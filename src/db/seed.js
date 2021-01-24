const User = require('./user');
const initDb = require('./db');

const test = {
  submitted: 'Sat Jan 02 2021 19:15:57 GMT+0000 (Coordinated Universal Time)',
  email: 'email@email.com',
  name: 'name',
  testDateMonth: 5,
  testDateYear: 2021,
  availabilityTime:
    '[1609696800000,1609700400000,1609704000000,1609707600000,1609711200000...',
  testPrep: 'A little',
  groupSize: 'Not sure',
  targetScore: 'At least 90th percentile (~700 and up)',
  targetSection: 'Verbal',
};

const questionArr = [
  {
    questionName: 'availabilityTime',
    answerOptionsArr: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  },
  {
    questionName: 'testType',
    answerOptionsArr: [
      // 'LSAT',
      // 'GRE',
      'GMAT',
      // 'MCAT'
    ],
  },
  {
    questionName: 'groupSize',
    answerOptionsArr: ['Partner', 'Group', 'Not sure'],
  },
  {
    questionName: 'testPrep',
    answerOptionsArr: ['A lot', 'A little', 'None'],
  },
  {
    questionName: 'targetScore',
    answerOptionsArr: [
      'At least 60th percentile (~550 and up)',
      'At least 70th percentile (~600 and up)',
      'Not sure',
      'At least 80th percentile (~650 and up)',
      'At least 90th percentile (~700 and up)',
    ],
  },
  {
    questionName: 'targetSection',
    answerOptionsArr: ['Quantitative', 'Verbal', 'Both'],
  },
];

const getValue = q => {
  const comp1 = 1 + Math.floor(Math.random() * 5);
  const comp2 =
    q.answerOptionsArr[Math.floor(Math.random() * q.answerOptionsArr.length)];
  const value = comp1 * 1000 + comp2;
  return value;
};
initDb().then(() => {
  for (let i = 0; i < 10; i += 1) {
    const user = new User({});
    user.submitted = Date.now();
    questionArr.forEach(q => {
      if (q.questionName === 'availabilityTime') {
        user[q.questionName] = [];
        const interval = Math.floor(Math.random() * 10) + 3;
        for (let x = 0; x < interval; x += 1) {
          let val = getValue(q);
          while (user[q.questionName].includes(val)) {
            val = getValue(q);
          }
          user[q.questionName].push(val);
        }
      } else {
        user[q.questionName] =
          q.answerOptionsArr[
            Math.floor(Math.random() * q.answerOptionsArr.length)
          ];
      }
    });
    console.log('saving item');
    user.save();
  }
});
