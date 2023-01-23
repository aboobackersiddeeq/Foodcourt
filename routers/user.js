/* eslint-disable linebreak-style */
const express = require('express');
const { check, body } = require('express-validator');

const router = express.Router();
const userController = require('../controllers/user-controller');
const { verifyUser } = require('../middleware/verify');

router.get('/', userController.userHome);

router.get('/signup', userController.signupView);
router.get('/login', userController.loginView);
router.post('/login', userController.loginPost);
router.post('/signup', [check('email', 'Invalid Email').isEmail(), body('password', 'invailed Password').isLength({ min: 6 }).custom((value) => {
  const specialChars = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/;
  if (specialChars.test(value) === false) throw new Error('Password need special charecter');
  else return true;
}).custom((value, { req }) => {
  if (value !== req.body.cpassword) {
    throw new Error('Password and conform not matching !');
  } else return true;
}), body('phone', 'invailed Phone Number !').isNumeric().isLength({ min: 10, max: 10 }),
], userController.signinPost);
router.get('/logout', userController.userLogout);
router.get('/otp', userController.getotp);
router.post('/otp', userController.postotp);
router.post('/add-to-cart', verifyUser, userController.addToCart);
router.get('/viewcart', verifyUser, userController.viewcart);
router.post('/change-product-quantity', userController.cartquntity);
router.get('/checkout', verifyUser, userController.checkout);
router.post('/add-address', userController.addAddressPost);
router.post('/add-address2', userController.addAddressPost2);
router.post('/edit-address/:id', userController.editAddress);
router.get('/delete-address/:id', verifyUser, userController.deleteAdd);
router.post('/place-order', verifyUser, userController.placeOrder);
router.get('/profile', verifyUser, userController.profile);
router.post('/verify-payment', userController.verifyPayment);
router.get('/view-order', verifyUser, userController.viewOrder);
router.get('/order-success', verifyUser, userController.orderSuccess);
router.get('/wishlist', verifyUser, userController.wishlist);
router.get('/add-wishlist/:id', verifyUser, userController.addWishlist);
router.get('/delet-wishlist', verifyUser, userController.deleteWishlist);
router.get('/single-product', userController.singleProduct);
router.get('/forgot', userController.forgotPassword);
router.post('/forgot', userController.postForgot);
router.get('/new-password', userController.newPassword);
router.post('/reset', userController.postNewPassword);
router.post('/coupon-check', verifyUser, userController.couponCheck);
router.get('/shop', userController.shop);
router.post('/search', userController.search);
router.get('/error', userController.error);
router.get('/resend-otp', userController.resend);
router.get('/invoice', userController.invoice);
module.exports = router;
