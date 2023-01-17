const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    ordernum: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    date: {
      type: String,
    },
    total: {
      type: Number,
    },
    payment: {
      type: String,
    },
    address: {
      type: String,
      required: true,
    },
    products: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'pro',
        },
        quantity: {
          type: Number,

        },
      },
    ],
    status: {
      type: String,
      enum: ['Placed', 'SHIPPED', 'OUT FOR DELIVERY', 'DELIVERED', 'CANCELLED', 'Pending'],
      default: 'placed',
    },
    discountCoupon: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon',
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model('order', orderSchema);
