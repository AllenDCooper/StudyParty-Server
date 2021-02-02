/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
const User = require('./db/user');
const Group = require('./db/group');

const refreshUsers = async () => {
  const userMatches = {};

  const testPrepWeight = 100;
  const targetScoreWeight = 10;
  const targetSectionWeight = 1;

  const qMap = {
    testPrep: { None: 1, 'A little': 2, 'A lot': 3 },

    targetScore: {
      'At least 60th percentile (~550 and up)': 1,
      'Not sure': 2,
      'At least 70th percentile (~600 and up)': 3,
      'At least 80th percentile (~650 and up)': 4,
      'At least 90th percentile (~700 and up)': 5,
    },

    targetSection: { Quantitative: 1, Both: 2, Verbal: 3 },
  };

  const testTypes = ['LSAT', 'GRE', 'GMAT', 'MCAT'];

  testTypes.forEach(async type => {
    const fiveDays = 1000 * 60 * 60 * 24 * 5;
    const unGroupedUsers = await User.find({
      group: null,
      testType: type,
    }).exec();
    const groups = await Group.find({
      closed: false,
      testType: type,
      created: { $gt: Date.now() - fiveDays },
      userCount: { $lt: 5 },
    }).exec();

    const groupedUsers = [];
    for (const group of groups) {
      for (const user of group.users) {
        const groupUser = User.find(user);
        groupUser.availabilityTime = group.availability;
        groupedUsers.push(groupUser);
      }
    }
    const timeSlots = {};
    const allUsers = [...unGroupedUsers, ...groupedUsers];
    allUsers.forEach(user => {
      user.availabilityTime.forEach(time => {
        if (timeSlots[time]) {
          timeSlots[time].push(user);
        } else {
          timeSlots[time] = [user];
        }
      });
    });
    Object.keys(timeSlots).forEach(time => {
      if (timeSlots[time].length > 1) {
        for (const user of timeSlots[time]) {
          if (!userMatches[user._id] && user.group === null) {
            userMatches[user._id] = { id: user._id, matches: [], time };
          }
          for (const otherUser of timeSlots[time]) {
            if (user._id.toString() !== otherUser._id.toString()) {
              const firstPoint =
                (qMap.testPrep[user.testPrep] -
                  qMap.testPrep[otherUser.testPrep]) **
                  2 *
                testPrepWeight;
              const secondPoint =
                (qMap.targetScore[user.targetScore] -
                  qMap.targetScore[otherUser.targetScore]) **
                  2 *
                targetScoreWeight;
              const thirdPoint =
                (qMap.targetSection[user.targetSection] -
                  qMap.targetSection[otherUser.targetSection]) **
                  2 *
                targetSectionWeight;
              const distance = Math.sqrt(firstPoint + secondPoint + thirdPoint);
              if (user.groupSize !== 'Partner') {
                userMatches[user._id].matches.push({
                  id: otherUser._id,
                  distance,
                  time,
                });
              } else if (otherUser.group === null) {
                userMatches[user._id].matches.push({
                  id: otherUser._id,
                  distance,
                  time,
                });
              }
            }
          }
        }
      } else {
        // users who don't have any matching time slots would be dealt with here.
      }
    });
  });
  Object.keys(userMatches).forEach(user => {
    userMatches[user].matches.sort((a, b) => a.distance - b.distance);
  });
  return userMatches;
};

const makeMatch = async (user, match) => {
  try {
    const fullMatch = await User.findOne(match.id).exec();
    if (fullMatch.group !== null && user.groupSize !== 'Partner') {
      const group = await Group.findOne(fullMatch.group).exec();
      group.users.push(user);
      user.group = group;
      console.log('Joined Group');
      console.log(user._id, fullMatch._id);
      await group.save();
      await user.save();
    } else {
      // eslint-disable-next-line no-new
      const newGroup = new Group({
        testType: user.testType,
        closed: !!(
          user.groupSize === 'Partner' || fullMatch.groupSize === 'Partner'
        ),
        availability: match.time,
        users: [fullMatch, user],
      });
      await newGroup.save();
      user.group = newGroup;
      fullMatch.group = newGroup;
      console.log('new group created');
      console.log(user._id, fullMatch._id);
      await user.save();
      await fullMatch.save();
    }
  } catch (e) {
    console.log(`ERROR: @makeMatch ${e}`);
  }
};

const findMatches = async () => {
  console.log('started finding matches');
  let users = {};
  users = await refreshUsers();
  console.log('users refreshed');
  for (const user in users) {
    const fullUser = await User.findOne(users[user].id).exec();
    const submitted = parseInt(fullUser.submitted);
    if (Date.now() > submitted + 86400000) {
      await makeMatch(fullUser, users[user].matches[0]);
      users = await refreshUsers();
    }
  }
};

module.exports = findMatches;
