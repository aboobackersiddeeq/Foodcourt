const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    require: true,
    unique: true,
    uppercase: true,
  },
  isPercent: {
    type: Boolean,
  },
  amount: {
    type: Number,
  },
  createdAt: {
    type: Date,
  },
  expireAfter: {
    type: Date,
  },
  usageLimit: {
    type: Number,
  },
  minCartAmount: {
    type: Number,
  },
  maxDiscountAmount: {
    type: Number,
  },
  userUsed: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    },
  ],
});
module.exports = mongoose.model('Coupon', couponSchema);
