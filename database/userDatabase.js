/* eslint-disable linebreak-style */
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Razorpay = require('razorpay');
const User1 = require('../models/user');
const Cart1 = require('../models/cart');
const Order = require('../models/order');

const Wishlist = require('../models/wishlist');

const { KEYID } = process.env;
const keySecret = process.env.KEYSE;
const instance = new Razorpay({ key_id: KEYID, key_secret: keySecret });

module.exports = {
  doLogin: async (userData, callback) => {
    const responce = {};
    const users = await User1.findOne({ email: userData.email });
    if (users && users.access) {
      bcrypt.compare(userData.password, users.password).then((status) => {
        if (status) {
          responce.users = users;
          responce.status = true;
          callback(responce);
        } else {
          callback({ status: false });
        }
      });
    } else {
      callback({ status: false });
    }
  },
  addToCart: async (prid, userid) => {
    const proObj = {
      item: prid, quantity: 1,
    };

    const cartuser = await Cart1.findOne({ userid });
    if (cartuser) {
      // eslint-disable-next-line eqeqeq
      const proExit = cartuser.proid.findIndex((proid) => proid.item === prid);

      if (proExit !== -1) {
        Cart1.updateOne({ userid, 'proid.item': prid }, { $inc: { 'proid.$.quantity': 1 } }).then(() => {

        });
      } else {
        Cart1.updateOne({ userid }, { $push: { proid: proObj } }).then(() => {

        });
      }
    } else {
      const cart = new Cart1({
        proid: proObj, userid,
      });
      await cart.save().then(() => {

      });
    }
  },
  getCartProduct: async (id, callback) => {
    const cartsund = await Cart1.findOne({ userid: id });
    if (cartsund) {
      Cart1.find({ userid: id })
        .populate('proid.item')
        .where()
        .exec((err, pro) => {
          // eslint-disable-next-line no-underscore-dangle
          callback(err, pro[0].proid, pro[0]._id);
        });
    } else {
      // eslint-disable-next-line no-undef
      callback();
    }
  },
  // eslint-disable-next-line no-async-promise-executor
  getCartCount: (userid) => new Promise(async (resolve) => {
    let count = 0;
    const carts = await Cart1.findOne({ userid });
    if (carts) {
      count = carts.proid.length;
    }
    resolve(count);
  }),
  changeCartQuntity: (details) => {
    let c = details.count;
    // eslint-disable-next-line no-param-reassign
    details.quantity = parseInt(details.quantity, 10);
    c = parseInt(c, 10);

    return new Promise((resolve) => {
      // eslint-disable-next-line eqeqeq, no-mixed-operators
      if (details.count == -1 && details.quantity === 1 || details.count == -2) {
        Cart1.updateOne(
          { _id: details.cart },
          { $pull: { proid: { item: details.product } } },
        )
          .then(() => {
            resolve({ removeProduct: true });
          });
      } else {
        Cart1.updateOne({ _id: details.cart, 'proid.item': details.product }, { $inc: { 'proid.$.quantity': c } }).then(() => {
          resolve({ status: true });
        });
      }
    });
  },
  getTotelamount: async (id, callback) => {
    const cartsss = await Cart1.findOne({ userid: id });
    if (cartsss) {
      Cart1.find({ userid: id })
        .populate('proid.item')
        .where()
        .exec((err, prodd) => {
          let sum = 0;
          prodd[0].proid.forEach((prod) => {
            const q = prod.quantity;
            const p = prod.item[0].price;
            sum += (p * q);
          });
          Cart1.updateOne({ userid: id }, { $set: { tprice: sum } }).then(() => {

          });
          callback(sum);
        });
    } else {
      callback(0);
    }
  },
  // eslint-disable-next-line no-async-promise-executor
  placeOrder: (body) => new Promise(async (resolve) => {
    const carts = await Cart1.find({ usreid: body.userid });
    const product = carts[0].proid;
    const status = body.optradio === 'COD' ? 'Placed' : 'Pending';
    const orders = new Order({
      userid: body.userid,
      total: body.totel,
      payment: body.optradio,
      address: body.address,
      products: product,
      status,
      date: new Date(),
    });
    await orders.save().then(async (newOne) => {
      await Cart1.deleteOne({ userid: body.userid });
      // eslint-disable-next-line no-underscore-dangle
      resolve(newOne._id);
    });
  }),
  generateRazonpay: (totel, orderid) => new Promise((resolve) => {
    const option = {
      amount: totel * 100,
      currency: 'INR',
      receipt: `${orderid}`,
    };
    instance.orders.create(option).then((orders) => {
      resolve(orders);
    }).catch(() => {

    });
  }),
  verifyPayment: (details) => new Promise((resolve, reject) => {
    let hmac = crypto.createHmac('sha256', keySecret);
    hmac.update(`${details.payment.razorpay_order_id}|${details.payment.razorpay_payment_id}`);
    hmac = hmac.digest('hex');
    if (hmac === details.payment.razorpay_signature) {
      resolve();
    } else {
      reject();
    }
  }),
  changePaymentStatus: (orderid) => new Promise((resolve) => {
    Order.updateOne(
      { _id: orderid },
      { $set: { status: 'Placed' } },
    ).then(() => {
      resolve();
    });
  }),
  addWishlist: async (prid, userid) => {
    const wishlistuser = await Wishlist.findOne({ userid });
    if (wishlistuser) {
      // eslint-disable-next-line eqeqeq
      const proExit = wishlistuser.proid.findIndex((proid) => proid == prid);

      if (proExit === -1) {
        Wishlist.updateOne({ userid }, { $push: { proid: prid } }).then(() => {

        });
      }
    } else {
      const wishlist1 = new Wishlist({
        proid: prid, userid,
      });
      await wishlist1.save().then(() => {

      });
    }
  },
  getWishlist: async (id, callback) => {
    const wishlistExist = await Wishlist.findOne({ userid: id });
    if (wishlistExist) {
      Wishlist.find({ userid: id })
        .populate('proid')
        .where()
        .exec((err, pro) => {
          callback(err, pro[0].proid);
        });
    } else {
      callback();
    }
  },
  deleteWislist: (userids, proids) => {
    Wishlist.updateOne(
      { userid: userids },
      { $pull: { proid: proids } },
    ).then(() => {

    });
  },

};
