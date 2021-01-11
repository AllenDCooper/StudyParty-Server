const mongoose = require('mongoose');

const GroupSchema = mongoose.Schema({});

const Group = mongoose.model('user', GroupSchema);

module.exports = Group;
