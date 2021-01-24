const mongoose = require('mongoose');

const { Schema } = mongoose;
const GroupSchema = new Schema(
  {
    testType: String,
    closed: { type: Boolean, default: false },
    availability: [Number],
    users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
  },
  { timestamps: true }
);

GroupSchema.virtual('userCount').get(function() {
  return this.users.length;
});

const Group = mongoose.model('group', GroupSchema);

module.exports = Group;
