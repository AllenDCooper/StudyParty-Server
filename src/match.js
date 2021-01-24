/* eslint-disable no-restricted-syntax */
/* eslint-disable guard-for-in */
const User = require('./db/user');
const Group = require('./db/group');
const initDb = require('./db/db');

const refreshUsers = async () => {
  // Things to cover still:
  // - check test date within 2 months or beyond
  // - deal with users who don't have time slot match here

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
  const type = 'GMAT';

  //   testTypes.forEach(type => {
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
  const userMatches = {};
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
      // deal with users who don't have time slot match here
    }
  });

  Object.keys(userMatches).forEach(user => {
    userMatches[user].matches.sort((a, b) => a.distance - b.distance);
  });
  return userMatches;
};

const makeMatch = async (user, match) => {
  const fullMatch = await User.findOne(match.id).exec();
  const fullUser = await User.findOne(user._id).exec();
  if (fullMatch.group !== null) {
    // add check for user not wanting group
    const group = await Group.findOne(fullMatch.group).exec();
    group.users.push(fullUser);
    fullUser.group = group;
    await group.save();
    await fullUser.save();
  } else {
    // eslint-disable-next-line no-new
    const newGroup = new Group({
      testType: fullUser.testType,
      closed: fullUser.groupSize === 'Partner',
      availability: match.time,
      users: [fullMatch, fullUser],
    });
    fullUser.group = newGroup;
    fullMatch.group = newGroup;
    await newGroup.save();
    console.log('new group created');
    await fullUser.save();
    await fullMatch.save();
  }
  users = await refreshUsers();
};

let users = {};
const findMatches = async () => {
  users = await refreshUsers();
  console.log('users refreshed');
  setInterval(async () => {
    for (const user in users) {
      console.log('inside for loop');
      const fullUser = await User.findOne(user.id).exec();
      const submitted = parseInt(fullUser.submitted);
      if (Date.now() > submitted + 86400000) {
        makeMatch(fullUser, users[user].matches[0]);
      }
    }
  }, 1000 * 60 * 60 * 12);
};
initDb().then(() => findMatches());
