const { MongoClient } = require('mongodb');
require('dotenv').config();

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

// appendDB({ table: 'users', item: { foo: 'bar' } });

module.exports = { appendDB };
