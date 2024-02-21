const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      default: '0'
    },
    username: {
      type: String,
    },
    whatsApp: {
      type: String,
    },
    tel: {
      type: String
    },
    password: {
      type: String
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('user', UserSchema);
