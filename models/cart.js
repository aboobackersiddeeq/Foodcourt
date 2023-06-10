const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema(
  {
    userid: {

      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'please specify product category'],
      unique: true,
    },
    proid: [{
      type: Object,
      ref: 'pro',
      required: [true, 'please specify product category'],
    }],
    tprice: Number,
  },
  { timestamps: true },
);

module.exports = mongoose.model('cart', cartSchema);
