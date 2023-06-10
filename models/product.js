const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      uppercase: true,
      unique: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'please specify product category'],

    // unique:true
    },
    price: {
      type: Number,
      required: true,
    // unique:true
    },
    stock: {
      type: Number,
    },
    discount: {
      type: Number,
    },
    description: {
      type: String,
      maxlength: 100,
    },
    images: {
      type: String,
      required: true,
    },
    arrimg: {
      type: Array,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('pro', productSchema);
