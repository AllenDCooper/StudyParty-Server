const { MongoClient } = require('mongodb');
require('dotenv').config();
const { getTimeZone, formatDateArr } = require('./time');

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME;

const dbConnect = (callback, options = {}) => {
  MongoClient.connect(
    uri,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    },
    async (err, client) => {
      if (err) {
        console.log(err);
        client.close();
      }
      const db = client.db(dbName);
      if (options === {}) callback(db);
      else await callback(db, options);
      client.close();
    }
  );
};

const insertDocument = (db, options = {}) => {
  const collection = db.collection(options.table);
  try {
    console.log('inserting doc');
    collection.insertOne(options.item);
  } catch (e) {
    console.log(e);
  }
};

const appendDB = options => {
  if (options.table && options.item) {
    dbConnect(insertDocument, { table: options.table, item: options.item });
  } else {
    return null;
  }
};

const sendUserToDb = data => {
  appendDB({
    table: 'users',
    item: {
      submitted: getTimeZone('currentMoment'),
      email: data.email,
      name: data.name,
      testDateMonth: data.testDate.getMonth() + 1,
      testDateYear: data.testDate.getFullYear(),
      availabilityEST: JSON.stringify(
        formatDateArr(data.availability, 'newYork')
      ),
      availabilityLocal: JSON.stringify(
        formatDateArr(data.availability, 'local')
      ),
      availabilityTime: JSON.stringify(
        formatDateArr(data.availability, 'time')
      ),
      testPrep: data.testPrep,
      groupSize: data.studyGroup,
      targetScore: data.targetScore,
      targetSection: data.targetSection,
      timeZone: getTimeZone('timeZoneName'),
      timeZoneLocation: getTimeZone('timeZoneLocation'),
      timeZoneOffset: getTimeZone('timeZoneOffset'),
    },
  });
};
module.exports = { appendDB };
