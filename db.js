const { MongoClient } = require('mongodb');
const path = require('path');
require('dotenv').config();
const { formatDateArr } = require('./time');

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
const updateOne = (db, options = {}) => {
  const collection = db.collection(options.table);
  try {
    collection.updateOne(
      { email: options.email },
      { $set: { confirmed: true } }
    );
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
  const testDate = new Date(data.testDate);
  appendDB({
    table: 'users',
    item: {
      submitted: new Date().toString(),
      email: data.email,
      name: data.name,
      testDateMonth: testDate.getMonth() + 1,
      testDateYear: testDate.getFullYear(),
      availabilityTime: JSON.stringify(
        formatDateArr(data.availability, 'time')
      ),
      testPrep: data.testPrep,
      groupSize: data.studyGroup,
      targetScore: data.targetScore,
      targetSection: data.targetSection,
      timeZone: data.timeZone,
      timeZoneLocation: data.timeZoneLocation,
      timeZoneOffset: data.timeZoneOffset,
      confirmed: false,
    },
  });
};

const sendConfirmToDb = email => {
  dbConnect(updateOne, {
    table: 'users',
    email,
    change: { confirmed: true },
  });
};

module.exports = { sendUserToDb, sendConfirmToDb };
