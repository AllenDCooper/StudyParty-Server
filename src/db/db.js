const mongoose = require('mongoose');
require('dotenv').config();

const initDb = async () => {
  const res = await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true,
  });
  if (res) console.log('Connected to db');
  else console.log('Error Connecting');
};

module.exports = initDb;
