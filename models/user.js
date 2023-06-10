const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    //  unique:true
  },
  phone: {
    type: String,
    required: true,
    //  unique:true
  },
  password: {
    type: String,
    required: true,
  },
  cpassword: {
    type: String,
    required: true,
  },
  access: {
    type: Boolean,
    default: true,
  },
  resetToken: String,
  resetTokenExpiration: Date,
});

module.exports = mongoose.model('User', userSchema);
