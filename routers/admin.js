/* eslint-disable linebreak-style */
const express = require('express');

const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyAdmin } = require('../middleware/verify');

router.get('/', adminController.getadmin);

router.get('/login', adminController.adminLogin);

router.post('/login', adminController.adminPostLogin);
router.get('/customers', verifyAdmin, adminController.customers);
router.get('/logout', adminController.adminLogout);
router.get('/block/:id', verifyAdmin, adminController.block);
router.get('/unblock/:id', verifyAdmin, adminController.unblock);
router.get('/view-category', verifyAdmin, adminController.viewCatogory);
router.get('/add-category', adminController.getaddCatogory);
router.post('/add-category', adminController.addCatogory);
router.get('/delete-category', verifyAdmin, adminController.Deletecatogry);
router.get('/edit-cat', verifyAdmin, adminController.updateCategoryGet);
router.post('/edit-category/:id', adminController.updateCategory);
router.get('/view-products', verifyAdmin, adminController.viewProducts);
router.get('/add-product', verifyAdmin, adminController.addProducts);
router.post('/add-product', verifyAdmin, adminController.addPostProducts);
router.get('/delete-product', verifyAdmin, adminController.deleteProduct);
router.get('/edit-product', verifyAdmin, adminController.editproductget);
router.post('/edit-product/:id', adminController.editProduct);
router.get('/view-coupons', verifyAdmin, adminController.viewCoupon);
router.get('/add-coupon', verifyAdmin, adminController.addCoupon);
router.post('/add-coupon', verifyAdmin, adminController.addPostCoupon);
router.get('/delete-coupon', verifyAdmin, adminController.deleteCoupon);
router.get('/edit-coupon', verifyAdmin, adminController.editCouponGet);
router.post('/edit-coupon/:id', adminController.editCoupon);
router.get('/view-orders', verifyAdmin, adminController.viewOrders);
router.get('/change-status', adminController.changeStatus);
router.get('/sales-report', adminController.salesReport);
router.get('/month-report', adminController.monthReport);
router.get('/year-report', adminController.yearReport);
router.post('/chart1', adminController.chart1);
router.post('/chart2', adminController.chart2);
router.post('/chart3', adminController.chart3);
router.post('/chart4', adminController.chart4);
router.get('/view-banner', verifyAdmin, adminController.viewBanner);
router.post('/add-banner', verifyAdmin, adminController.addPostBanner);
router.get('/delete-banner', verifyAdmin, adminController.deleteBanner);
module.exports = router;
