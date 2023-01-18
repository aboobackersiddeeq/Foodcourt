/* eslint-disable no-underscore-dangle */
/* eslint-disable linebreak-style */

const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');
const User = require('../models/user');
const Address = require('../models/address');
const address = require('../models/address');

const salt = bcrypt.genSaltSync(10);

const userDatabase = require('../database/user-database');
const { sendotp, verifyotp } = require('../utilities/otp');
const pro = require('../models/product');
const order = require('../models/order');
const Coupon = require('../models/coupon');
const Category = require('../models/category');
const Banner = require('../models/banner');

const host = process.env.HOST;
const nodemailerPass = process.env.MAILERPASS;
const userEmail = process.env.USEREMAIL;
const mailer = nodemailer.createTransport({
  host,
  port: 587,
  auth: {
    user: userEmail,
    pass: nodemailerPass,
  },

});

module.exports = {
  userHome: async (req, res, next) => {
    try {
      const { users } = req.session;
      let userid;
      const product = await pro.find();
      const category = await Category.find();
      const banner = await Banner.find();
      const email = req.flash('em');
      let cartcount = null;
      if (req.session.users) {
      // eslint-disable-next-line no-underscore-dangle
        userid = req.session.users._id;
        // eslint-disable-next-line no-underscore-dangle
        cartcount = await userDatabase.getCartCount(req.session.users._id);
      }

      res.render('user/home', {

        users, userHeader: true, product, cartcount, userid, category, banner, email,
      });
    } catch (e) {
      next(new Error(e));
    }
  },
  signupView: (req, res, next) => {
    try {
      const errorMs = req.flash('errorMsg');

      res.render('user/signup', { errorMsg: errorMs[0] });
    } catch (e) {
      next(new Error(e));
    }
  },
  loginView: (req, res, next) => {
    try {
      if (req.session.loggedIn) {
        res.redirect('/');
      } else {
        const lErr = req.session.loginErr;
        req.session.loginErr = false;
        res.render('user/login', { lErr });
      }
    } catch (e) {
      next(new Error(e));
    }
  },
  loginPost: async (req, res, next) => {
    try {
      userDatabase.doLogin(req.body, (response) => {
        if (response.status) {
          req.session.users = response.users;
          req.session.loggedIn = true;

          res.redirect('/');
        } else {
          req.session.loginErr = true;
          res.redirect('/login');
        }
      });
    } catch (e) {
      next(new Error(e));
    }
  },
  signinPost: async (req, res, next) => {
    try {
      const error = validationResult(req);
      if (!error.isEmpty()) {
        res.render('user/signup', { errorMsg: error.array()[0].msg });
      }
      const { email } = req.body;
      const user = await User.findOne({ email });
      req.session.signup = req.body;
      if (user) {
        req.flash('errorMsg', 'Email address already in use');
        res.redirect('/signup');
      } else {
        sendotp(req.body.phone);
        res.redirect('otp');
      }
    } catch (e) {
      next(new Error(e));
    }
  },
  getotp: (req, res, next) => {
    try {
      const errs = req.flash('err');
      res.render('user/otp', { errs });
    } catch (e) {
      next(new Error(e));
    }
  },
  userLogout: (req, res, next) => {
    try {
      req.session.users = null;
      req.session.loggedIn = false;
      res.redirect('/');
    } catch (e) {
      next(new Error(e));
    }
  },

  postotp: async (req, res, next) => {
    try {
      const users = req.session.signup;
      const { otp } = req.body;

      req.session.loggedIn = true;

      await verifyotp(users.phone, otp).then(async (verificationcheck) => {
        // eslint-disable-next-line eqeqeq
        if (verificationcheck.status == 'approved') {
          users.password = await bcrypt.hash(users.password, salt);
          users.cpassword = await bcrypt.hash(users.cpassword, salt);
          const user1 = new User({
            name: users.name,
            email: users.email,
            phone: users.phone,
            password: users.password,
            cpassword: users.cpassword,
          });
          await user1.save();
          req.session.users = user1;
          req.session.otpverifyed = true;
          res.redirect('/');
        } else {
          req.flash('err', 'OTP does not match');
          res.redirect('/otp');
        }
      });
    } catch (e) {
      next(new Error(e));
    }
  },
  resend: (req, res, next) => {
    try {
      const { phone } = req.session.signup;
      sendotp(phone);
      res.redirect('otp');
    } catch (e) {
      next(new Error(e));
    }
  },
  // cart
  addToCart: (req, res, next) => {
    try {
      userDatabase.addToCart(req.body.proid, req.body.userid).then(async () => {
        const cartcount = await userDatabase.getCartCount(req.body.userid);

        res.json({ status: true, count: cartcount });
      });
    } catch (e) {
      next(new Error(e));
    }
  },

  viewcart: (req, res, next) => {
    try {
      const userid = req.session.users._id;
      const { users } = req.session;
      // eslint-disable-next-line no-shadow, no-underscore-dangle
      userDatabase.getCartProduct(req.session.users._id, (err, pro, cart) => {
        if (err) { /* empty */ } else {
          userDatabase.getTotelamount(userid, async (total) => {
            let cartcount = 0;
            if (req.session.users) {
            // eslint-disable-next-line no-underscore-dangle
              cartcount = await userDatabase.getCartCount(req.session.users._id);
            }
            const subtotal = total - 30;

            res.render('user/cart', {
              pro, cart, total, userid, users, cartcount, subtotal,
            });
          });
        }
      });
    } catch (e) {
      next(new Error(e));
    }
  },
  cartquntity: (req, res, next) => {
    try {
      const details = req.body;

      userDatabase.changeCartQuntity(details).then((response) => {
        userDatabase.getTotelamount(details.use, (totel) => {
          response.totel = totel;
          response.subtotel = totel;
          res.json(response);
        });
      });
    } catch (e) {
      next(new Error(e));
    }
  },
  checkout: async (req, res, next) => {
    try {
    // eslint-disable-next-line no-underscore-dangle
      const userids = req.session.users._id;
      const { users } = req.session;
      const add = await address.findOne({ userId: userids });
      const cartcount = await userDatabase.getCartCount(req.session.users._id);
      userDatabase.getTotelamount(userids, (total) => {
        res.render('user/checkout', {
          users, add, cartcount, total, userids,
        });
      });
    } catch (e) {
      next(new Error(e));
    }
  },

  addAddressPost: async (req, res, next) => {
    try {
    // eslint-disable-next-line no-underscore-dangle
      const useridd = req.session.users._id;
      const add = await Address.findOne({ userId: useridd });
      if (add) {
        await Address.updateOne({ userId: useridd }, { $push: { address: req.body } });
      } else {
        const ad = new Address({
          address: [req.body],
          userId: useridd,
        });
        ad.save(() => {
        });
      }

      res.redirect('/profile');
    } catch (e) {
      next(new Error(e));
    }
  },

  addAddressPost2: async (req, res, next) => {
    try {
      const useridd = req.session.users._id;
      const add = await Address.findOne({ userId: useridd });
      if (add) {
        await Address.updateOne({ userId: useridd }, { $push: { address: req.body } });
      } else {
        const ad = new Address({
          address: [req.body],
          userId: useridd,
        });
        ad.save(() => {
        });
      }

      res.redirect('/checkout');
    } catch (e) {
      next(new Error(e));
    }
  },

  editAddress: async (req, res, next) => {
    try {
      const addId = req.params.id;
      const userid = req.session.users._id;
      const upAd = {
        name: req.body.name,
        mob: req.body.mob,
        house: req.body.house,
        landmark: req.body.landmark,
        city: req.body.city,
        district: req.body.district,
        state: req.body.state,
        pincode: req.body.pincode,
      };
      const addDoc = await Address.findOne({ userId: userid });
      addDoc.editAdd(upAd, addId).then(() => {
        res.redirect('/profile');
      });
    } catch (e) {
      next(new Error(e));
    }
  },
  deleteAdd: async (req, res, next) => {
    try {
      const addressId = req.params.id;
      const id = req.session.users._id;
      Address.updateOne({ userId: id }, { $pull: { address: { _id: addressId } } })
        .then(() => {
          res.redirect('/profile');
        });
    } catch (e) {
      next(new Error(e));
    }
  },
  placeOrder: (req, res, next) => {
    try {
      const couponObj = {
        userId: req.body.userid,
      };
      userDatabase.placeOrder(req.body).then(async (orderid) => {
        if (req.session.usedCoupon) {
          await Coupon.updateOne(
            { _id: req.session.usedCoupon },
            { $push: { userUsed: couponObj } },
          ).then(() => {
            req.session.usedCoupon = null;
          });
        }
        // eslint-disable-next-line eqeqeq
        if (req.body.optradio == 'COD') {
          res.json({ codstatus: true });
        } else {
          userDatabase.generateRazonpay(req.body.totel, orderid).then((response) => {
            res.json(response);
          });
        }
      });
    } catch (e) {
      next(new Error(e));
    }
  },
  profile: async (req, res, next) => {
    try {
      const { users } = req.session;
      const useridd = req.session.users._id;
      const add = await Address.findOne({ userId: useridd });
      const cartcount = await userDatabase.getCartCount(req.session.users._id);
      res.render('user/profile', {
        users, add, cartcount,
      });
    } catch (e) {
      next(new Error(e));
    }
  },
  verifyPayment: (req, res, next) => {
    try {
      userDatabase.verifyPayment(req.body).then(() => {
        userDatabase.changePaymentStatus(req.body.order.receipt).then(() => {
          res.json({ status: true });
        });
      }).catch(() => {
        res.json({ status: false, errMsg: 'Payment Failed' });
      });
    } catch (e) {
      next(new Error(e));
    }
  },
  viewOrder: async (req, res, next) => {
    try {
      const { users } = req.session;
      let cartcount = null;
      if (req.session.users) {
        cartcount = await userDatabase.getCartCount(req.session.users._id);
      }
      await order.find({ userid: req.session.users._id }).populate('products.item').where()
        .exec((err, orders) => {
          if (orders)orders.reverse();

          res.render('user/view-order', {
            users, cartcount, orders,
          });
        });
    } catch (e) {
      next(new Error(e));
    }
  },
  orderSuccess: async (req, res, next) => {
    try {
      const { users } = req.session;
      res.render('user/order-success', { users });
    } catch (e) {
      next(new Error(e));
    }
  },
  invoice: async (req, res, next) => {
    try {
      const oderId = req.query.id;
      const { users } = req.session;
      let cartcount = null;
      if (req.session.users) {
        cartcount = await userDatabase.getCartCount(req.session.users._id);
      }
      await order.findOne({ _id: oderId }).populate('products.item').where()
        .exec((err, Order) => {
          res.render('user/invoice', {
            users, cartcount, Order,
          });
        });
    } catch (e) {
      next(new Error(e));
    }
  },
  wishlist: async (req, res, next) => {
    try {
      const { users } = req.session;
      let cartcount = null;
      if (req.session.users) {
        cartcount = await userDatabase.getCartCount(req.session.users._id);
      }
      userDatabase.getWishlist(req.session.users._id, (err, prod) => {
        res.render('user/wishlist', { users, cartcount, prod });
      });
    } catch (e) {
      next(new Error(e));
    }
  },
  addWishlist: (req, res, next) => {
    try {
      userDatabase.addWishlist(req.params.id, req.session.users._id);
      res.redirect('/');
    } catch (e) {
      next(new Error(e));
    }
  },
  deleteWishlist: (req, res, next) => {
    try {
      const proId = req.params.id;
      const userId = req.session.users._id;
      userDatabase.deleteWislist(userId, proId);
      res.redirect('/wishlist');
    } catch (e) {
      next(new Error(e));
    }
  },
  singleProduct: async (req, res, next) => {
    try {
      const { users } = req.session;
      let cartcount = null;
      let userid;
      if (req.session.users) {
        userid = req.session.users._id;
        cartcount = await userDatabase.getCartCount(req.session.users._id);
      }
      const proid = req.query.id;

      const product = await pro.findOne({ _id: proid });

      res.render('user/product-single', {
        users, cartcount, product, userid,
      });
    } catch (e) {
      next(new Error(e));
    }
  },
  forgotPassword: (req, res, next) => {
    try {
      const errs = req.flash('err');
      res.render('user/forgot', { errs });
    } catch (e) {
      next(new Error(e));
    }
  },

  postForgot: (req, res, next) => {
    try {
      crypto.randomBytes(32, (err, buffer) => {
        if (err) {
          res.redirect('/forgot');
        }
        const token = buffer.toString('hex');
        User.findOne({ email: req.body.email }).then((users) => {
          const userz = users;
          if (!userz) {
            req.flash(
              'err',
              "Couldn't find your Foodcourt Account",
            );
            res.redirect('/forgot');
          }

          userz.resetToken = token;
          userz.resetTokenExpiration = Date.now() + 3600000;
          return userz.save();
        })

          .then((result) => {
            req.flash(
              'em',
              "We've sent an email to your email address. click link and complete verification",
            );
            res.redirect('/');
            const emails = {
              to: result.email,
              from: 'rashidrashi9876543210@gmail.com',
              subject: 'password reseted',

              html: `
            <p>You Requested  a Password reset </p>
             <p>Click this <a href="http://localhost:7015/new-password?token=${token}">link</a> to set a password</p>
          `,
            };
            mailer.sendMail(emails, () => {
            });
          }).catch(() => {
          });
      });
    } catch (e) {
      next(new Error(e));
    }
  },
  newPassword: (req, res, next) => {
    try {
      const { token } = req.query;
      User.findOne({
        resetToken: token,
      }).then((user) => {
        const userid = user._id;
        res.render('user/new-password', { userid });
      }).catch(() => {
      });
    } catch (e) {
      next(new Error(e));
    }
  },
  postNewPassword: (req, res, next) => {
    try {
      let updatedUser;
      const newpassword = req.body.password;
      const userId = req.body.userid;
      User.findOne({ _id: userId }).then((users) => {
        updatedUser = users;
        return bcrypt.hash(newpassword, 12);
      }).then((hashedpassword) => {
        updatedUser.password = hashedpassword;
        updatedUser.cpassword = hashedpassword;
        updatedUser.resetToken = undefined;
        updatedUser.resetTokenExpiration = undefined;
        return updatedUser.save();
      }).then(() => {
        res.redirect('/login');
      });
    } catch (e) {
      next(new Error(e));
    }
  },
  couponCheck: async (req, res, next) => {
    try {
      const total = parseInt(req.body.total, 10);
      const coupon = await Coupon.findOne({ code: req.body.code });
      if (coupon) {
        if (coupon.expireAfter >= Date.now()) {
          if (coupon.minCartAmount <= total) {
          // eslint-disable-next-line eqeqeq
            const index = await coupon.userUsed.findIndex((obj) => obj.userId == req.body.userId);
            if (index >= 0) {
              res.json({ status: false, error: 4, message: 'Already used coupon' });
            } else {
              const { maxDiscountAmount } = coupon;
              req.session.usedCoupon = coupon._id;
              const cartTotal = total - maxDiscountAmount;
              res.json({ status: true, total: cartTotal, dis: maxDiscountAmount });
            }
          } else {
            res.json({ status: false, error: 2, message: 'Your cart is not minumum cart amount or more' });
          }
        } else {
          res.json({ status: false, error: 5 });
        }
      } else {
        res.json({ status: false, message: 'No such coupon' });
      }
    } catch (e) {
      next(new Error(e));
    }
  },
  shop: async (req, res, next) => {
    try {
      const { users } = req.session;
      let cartcount = null;
      let userid;

      const page = parseInt(req.query.page, 10) || 1;
      const itemsPerPage = 4;
      let totalproducts = await pro.find().countDocuments();
      if (req.session.users) {
        userid = req.session.users._id;
        cartcount = await userDatabase.getCartCount(req.session.users._id);
      }

      let product;
      const category = await Category.find();
      const { cat } = req.query;
      const { q } = req.query;

      if (cat) {
        totalproducts = await pro.find({ category: cat }).countDocuments();
        product = await pro.find({ category: cat })
          .skip((page - 1) * itemsPerPage).limit(itemsPerPage);
      } else if (q) {
        totalproducts = await pro.find({ category: cat }).countDocuments();
        product = await pro.find({ _id: q }).skip((page - 1) * itemsPerPage).limit(itemsPerPage);
      } else {
        product = await pro.find().skip((page - 1) * itemsPerPage).limit(itemsPerPage);
      }

      res.render('user/shop', {
        users,
        userid,
        cartcount,
        product,
        category,
        page,
        hasNextPage: itemsPerPage * page < totalproducts,
        hasPreviousPage: page > 1,
        PreviousPage: page - 1,
        lastPage: Math.ceil(totalproducts / itemsPerPage),
      });
    } catch (e) {
      next(new Error(e));
    }
  },
  search: async (req, res, next) => {
    try {
      const sResult = [];
      const skey = req.body.payload;
      const regex = new RegExp(`^${skey}.*`, 'i');
      const pros = await pro.aggregate([{
        $match: {
          $or: [{ title: regex },
            { description: regex }],
        },
      }]);

      pros.forEach((val) => {
        sResult.push({ title: val.title, type: 'Product', id: val._id });
      });
      const catlist = await Category.aggregate([{
        $match: {
          $or: [{ name: regex },
            { description: regex }],
        },
      }]);
      catlist.forEach((val) => {
        sResult.push({ title: val.name, type: 'Category', id: val._id });
      });

      res.send({ payload: sResult });
    } catch (e) {
      next(new Error(e));
    }
  },
  error: (req, res, next) => {
    try {
      res.render('user/error');
    } catch (e) {
      next(new Error(e));
    }
  },

};
