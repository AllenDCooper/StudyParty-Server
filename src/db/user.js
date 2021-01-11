const mongoose = require('mongoose');

const UserSchema = mongoose.Schema({
  submitted: String,
  email: String,
  name: String,
  testDateMonth: Number,
  testDateYear: Number,
  availabilityTime: String,
  testPrep: String,
  groupSize: String,
  targetScore: String,
  targetSection: String,
  timeZone: String,
  timeZoneLocation: String,
  timeZoneOffset: Number,
  confirmed: Boolean,
});

const User = mongoose.model('user', UserSchema);

module.exports = User;
