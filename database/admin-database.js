
const admin1 = require('../models/admin');
const User2 = require('../models/user');
const category1 = require('../models/category');
const Pro = require('../models/product');
const Coupon = require('../models/coupon');
const banner = require('../models/banner');

module.exports = {
  doLogin: async (adminData, callback) => {
    // const loginStatus = false;
    const responce = {};

    const admin = await admin1.findOne({ email: adminData.email });

    if (admin) {
      if (adminData.password === admin.password) {
        //     bcrypt.compare(userData.password,users.password).then((status)=>{
        // if(status){

        responce.admin = admin;
        responce.status = true;
        callback(responce);
      } else {
        callback({ status: false });
      }

      // })
    } else {
      callback({ status: false });
    }
  },
  getAllUsers: (callback) => {
    User2.find().where()
      .exec((err, users) => {
        users.reverse();
        callback(err, users);
      });
  },
  addProducts: async (products, imageUrl, arrimg, productName) => {
    const product1 = new Pro({
      title: productName,
      stock: products.stock,
      discount: products.discount,
      category: products.category,
      price: products.price,
      description: products.description,
      images: imageUrl,
      arrimg,

    });
    await product1.save().then(() => {

    });
  },
  getAllcatogory: (callback) => {
    category1.find().where()
      .exec((err, category) => {
        category.reverse();
        callback(err, category);
      });
  },
  deleteCategory: (cId) => new Promise((resolve) => {
    category1.deleteOne({ _id: cId }).then((responce) => {
      resolve(responce);
    });
  }),
  updateCategory: (cid, cDetails, file) => new Promise((resolve) => {
    category1.updateOne({ _id: cid }, {
      $set: {
        name: cDetails.name,
        description: cDetails.description,
        image: file,
      },
    }).then(() => {
      resolve(true);
    });
  }),
  getcategorydetials: (catId) => new Promise((resolve) => {
    category1.findOne({ _id: catId }).then((category) => {
      resolve(category);
    });
  }),
  getAllProduct: (callback) => {
    Pro.find().where()
      .exec((err, product) => {
        product.reverse();

        callback(err, product);
      });

    Pro.aggregate([{ $project: { createdAt: 1 } }]);
  },
  deleteProduct: (id) => new Promise((resolve) => {
    Pro.deleteOne({ _id: id }).then((response) => {
      resolve(response);
    });
  }),
  editProduct: (id, product, file, imgarr) => new Promise((resolve) => {
    Pro.updateOne(
      { _id: id },
      {
        $set: {
          title: product.title,
          category: product.category,
          price: product.price,
          stock: product.stock,
          discount: product.discount,
          description: product.description,
          images: file,
          imgarr,
        },
      },
    ).then(() => {
      resolve(true);
    });
  }),
  addCoupon: async (coupons, code) => {
    let expireAfter = new Date().getTime() + coupons.expireAfter * 24 * 60 * 60 * 1000;
    expireAfter = new Date(expireAfter);
    const cop = new Coupon({
      code,
      isPercent: coupons.isPercent,
      amount: coupons.amount,
      minCartAmount: coupons.minCartAmount,
      expireAfter,
      usageLimit: coupons.usageLimit,
      maxDiscountAmount: coupons.maxDiscountAmount,
      createdAt: new Date(),

    });
    cop.save(() => {

    });
  },
  getAllCoupon: (callback) => {
    Coupon.find().where()
      .exec((err, cop) => {
        cop.reverse();

        callback(err, cop);
      });
  },
  deleteCoupon: (id) => new Promise((resolve) => {
    Coupon.deleteOne({ _id: id }).then((response) => {
      resolve(response);
    });
  }),
  editCoupon: (id, coupons, cre) => new Promise((resolve) => {
    let expireAfter = cre.getTime() + coupons.expireAfter * 24 * 60 * 60 * 1000;
    expireAfter = new Date(expireAfter);

    Coupon.updateOne(
      { _id: id },
      {
        $set: {
          code: coupons.code,
          expireAfter,
          amount: coupons.amount,
          minCartAmount: coupons.minCartAmount,
          usageLimit: coupons.usageLimit,
          maxDiscountAmount: coupons.maxDiscountAmount,

        },
      },
    ).then(() => {
      resolve(true);
    });
  }),
  getAllBanner: (callback) => {
    banner.find().where()
      .exec((err, cop) => {
        cop.reverse();

        callback(err, cop);
      });
  },
  deleteBanner: (cId) => new Promise((resolve) => {
    banner.deleteOne({ _id: cId }).then((responce) => {
      resolve(responce);
    });
  }),
};
