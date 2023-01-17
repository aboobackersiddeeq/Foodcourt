/* eslint-disable linebreak-style */
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
    },
    description: {
      type: String,
      maxlength: 100,
      required: true,
    },
    image: {
      type: String,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('category', categorySchema);
