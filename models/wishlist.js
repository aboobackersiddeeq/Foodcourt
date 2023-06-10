const mongoose = require('mongoose');

const WishlistSchema = new mongoose.Schema(
  {
    userid: {

      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'please specify product category'],
      unique: true,
    },
    proid: [{

      type: mongoose.Schema.Types.ObjectId,
      ref: 'pro',
      required: [true, 'please specify product category'],
    }],

  },
  { timestamps: true },
);

module.exports = mongoose.model('wishlist', WishlistSchema);
