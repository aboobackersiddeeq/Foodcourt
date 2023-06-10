/* eslint-disable linebreak-style */
const adminDatabase = require("../database/admin-database");
const user = require("../models/user");
const Category = require("../models/category");
const Product = require("../models/product");
const Coupon = require("../models/coupon");
const order = require("../models/order");
const Banner = require("../models/banner");

module.exports = {
  getadmin: async (req, res) => {
    try {
      if (req.session.admin) {
        const { admin } = req.session;
        let userCount;
        let categoryCount;
        let proCount = 0;
        let orderCount;
        const query = user.find();
        query.count((err, count) => {
          userCount = count;
        });
        const category = Category.find();
        category.count((err, count) => {
          categoryCount = count;
        });
        const Pro = Product.find();
        Pro.count((err, count) => {
          proCount = count;
        });

        const revenue = await order.aggregate([
          {
            $match: {
              $or: [
                {
                  $and: [
                    { status: { $eq: "Delivered" }, payment: { $eq: "COD" } },
                  ],
                },
                {
                  $and: [
                    {
                      status: { $eq: "Delivered" },
                      payment: { $eq: "Razorpay" },
                    },
                  ],
                },
                {
                  $and: [
                    { status: { $eq: "Placed" }, payment: { $eq: "Razorpay" } },
                  ],
                },
              ],
            },
          },

          {
            $group: {
              _id: {},
              totalPrice: { $sum: "$total" },
              items: { $sum: { $size: "$products" } },
              count: { $sum: 1 },
            },
          },
          { $sort: { createdAt: -1 } },
        ]);
        const date = new Date();
        const day = date.getDate();
        let month = date.getMonth();
        month += 1;
        const year = date.getFullYear();
        const todayrevenue = await order.aggregate([
          {
            $match: {
              $or: [
                {
                  $and: [
                    { status: { $eq: "Delivered" }, payment: { $eq: "COD" } },
                  ],
                },
                {
                  $and: [
                    {
                      status: { $eq: "Delivered" },
                      payment: { $eq: "Razorpay" },
                    },
                  ],
                },
                {
                  $and: [
                    { status: { $eq: "Placed" }, payment: { $eq: "Razorpay" } },
                  ],
                },
              ],
            },
          },
          {
            $addFields: {
              Day: { $dayOfMonth: "$createdAt" },
              Month: { $month: "$createdAt" },
              Year: { $year: "$createdAt" },
            },
          },
          { $match: { Day: day, Year: year, Month: month } },

          {
            $group: {
              _id: {
                day: { $dayOfMonth: "$createdAt" },
              },
              totalPrice: { $sum: "$total" },
              items: { $sum: { $size: "$products" } },
              count: { $sum: 1 },
            },
          },
        ]);

        const todaySales = await order.aggregate([
          {
            $match: { status: { $ne: "Cancelled" } },
          },
          {
            $addFields: {
              Day: { $dayOfMonth: "$createdAt" },
              Month: { $month: "$createdAt" },
              Year: { $year: "$createdAt" },
            },
          },
          { $match: { Day: day, Year: year, Month: month } },

          {
            $group: {
              _id: {
                day: { $dayOfMonth: "$createdAt" },
              },
              totalPrice: { $sum: "$total" },
              items: { $sum: { $size: "$products" } },
              count: { $sum: 1 },
            },
          },
        ]);
        const allSales = await order.aggregate([
          {
            $match: { status: { $ne: "Cancelled" } },
          },

          {
            $group: {
              _id: {},
              totalPrice: { $sum: "$total" },
              items: { $sum: { $size: "$products" } },
              count: { $sum: 1 },
            },
          },
          { $sort: { createdAt: -1 } },
        ]);

        const orders = order.find();
        orders.count((err, count) => {
          orderCount = count;
          res.render("admin/dashbord", {
            admin,
            userCount,
            categoryCount,
            proCount,
            orderCount,
            revenue,
            allSales,
            todaySales,
            todayrevenue,
          });
        });
      } else {
        res.redirect("/admin/login");
      }
    } catch {
      res.redirect("/error");
    }
  },
  adminLogin: (req, res) => {
    try {
      if (req.session.admin) {
        res.redirect("/admin");
      } else {
        res.render("admin/login", { adminloginerr: req.session.loginadminErr });
      }
    } catch {
      res.redirect("/error");
    }
  },
  adminPostLogin: (req, res) => {
    try {
      adminDatabase.doLogin(req.body, (response1) => {
        if (response1.status) {
          req.session.admin = response1.admin;
          req.session.loggedadmin = true;
          res.redirect("/admin");
        } else {
          req.session.loginadminErr = true;
          res.redirect("/admin/login");
        }
      });
    } catch {
      res.redirect("/error");
    }
  },
  customers: (req, res) => {
    try {
      adminDatabase.getAllUsers((err, users) => {
        if (err) {
          /* empty */
        }
        res.render("admin/customers", { users });
      });
    } catch {
      res.redirect("/error");
    }
  },
  adminLogout: (req, res) => {
    try {
      req.session.admin = null;
      req.session.loginadminErr = false;
      res.redirect("/admin/login");
    } catch {
      res.redirect("/error");
    }
  },
  block: async (req, res) => {
    try {
      const { id } = req.params;
      await user.findByIdAndUpdate(id, { access: false }, {});
      res.redirect("/admin/customers");
    } catch {
      res.redirect("/error");
    }
  },
  unblock: async (req, res) => {
    try {
      const { id } = req.params;
      await user.findByIdAndUpdate(id, { access: true }, {});
      res.redirect("/admin/customers");
    } catch {
      res.redirect("/error");
    }
  },
  // category
  viewCatogory: (req, res) => {
    try {
      adminDatabase.getAllcatogory((err, category) => {
        res.render("admin/view-category", { category });
      });
    } catch {
      res.redirect("/error");
    }
  },
  getaddCatogory: (req, res) => {
    try {
      const cat = req.flash("cat");
      res.render("admin/add-category", { cat });
    } catch {
      res.redirect("/error");
    }
  },

  addCatogory: async (req, res) => {
    try {
      const image = req.files.img;
      let imageUrl;
      if (image) {
        imageUrl = image[0].path;
        imageUrl = imageUrl.substring(6);
      }
      const getCategoryName = req.body.categoryName;
      const categoryName = getCategoryName.toUpperCase();
      const category = await Category.findOne({ name: categoryName });
      if (category) {
        req.flash("cat", "This Category is already entered");
        res.redirect("/admin/add-category");
      } else {
        const newCategory = new Category({
          name: categoryName,
          description: req.body.description,
          image: imageUrl,
        });
        newCategory
          .save()
          .then(() => {
            res.redirect("/admin/view-category");
          })
          .catch(() => {});
      }
    } catch {
      res.redirect("/error");
    }
  },
  Deletecatogry: (req, res) => {
    try {
      const cId = req.query.id;

      adminDatabase.deleteCategory(cId).then(() => {
        res.json({ status: true });
      });
    } catch {
      res.redirect("/error");
    }
  },
  updateCategory: (req, res) => {
    try {
      const image = req.files.img;
      const category = {};
      if (image) {
        const imageUrl = image[0].path.substring(6);
        category.image = imageUrl;
      }
      adminDatabase
        .updateCategory(req.params.id, req.body, category.image)
        .then(() => {
          res.redirect("/admin/view-category");
        });
    } catch {
      res.redirect("/error");
    }
  },
  updateCategoryGet: async (req, res) => {
    try {
      const category = await adminDatabase.getcategorydetials(req.query.id);

      res.render("admin/edit-category", { category });
    } catch {
      res.redirect("/error");
    }
  },
  //  product

  viewProducts: (req, res) => {
    try {
      adminDatabase.getAllProduct((err, product, cdate) => {
        adminDatabase.getAllcatogory((errs, category) => {
          res.render("admin/view-products", { product, cdate, category });
        });
      });
    } catch {
      res.redirect("/error");
    }
  },
  addProducts: (req, res) => {
    try {
      adminDatabase.getAllcatogory((err, category) => {
        const productMsg = req.flash("product");
        res.render("admin/add-product", { category, productMsg });
      });
    } catch {
      res.redirect("/error");
    }
  },
  addPostProducts: async (req, res) => {
    try {
      const image = req.files.img;
      const getProductName = req.body.title;
      const productName = getProductName.toUpperCase();
      const product = await Product.findOne({ title: productName });
      if (product) {
        req.flash("product", "This Product is already entered");
        res.redirect("/admin/add-product");
      } else if (!image) {
        req.flash("product", "image not found");
        res.redirect("/admin/add-product");
        // eslint-disable-next-line no-undef
        error = "";
      } else {
        let imageUrl = image[0].path;
        imageUrl = imageUrl.substring(6);
        //   multiple image
        const { images } = req.files;
        // const length=images.length

        const arrimg = [];
        if (images) {
          images.forEach((el, i, arr) => {
            arrimg.push(arr[i].path.substring(6));
          });
        }
        adminDatabase.addProducts(
          req.body,
          imageUrl,
          arrimg,
          productName,
          () => {}
        );
        res.redirect("/admin/view-products");
      }
    } catch {
      res.redirect("/error");
    }
  },
  deleteProduct: (req, res) => {
    try {
      const { id } = req.query;
      adminDatabase.deleteProduct(id).then(() => {
        res.json({ status: true });
      });
    } catch {
      res.redirect("/error");
    }
  },
  editProduct: (req, res) => {
    try {
      const { id } = req.params;
      const image = req.files.img;
      const cat = {};
      if (image) {
        const imageUrl = image[0].path.substring(6);
        cat.image = imageUrl;
      }
      const imgarr = [];

      const { images } = req.files;
      if (images) {
        images.forEach((el, i, arr) => {
          imgarr.push(arr[i].path.substring(6));
          cat.imgarr = imgarr;
        });
      }

      adminDatabase
        .editProduct(id, req.body, cat.image, cat.imgarr)
        .then(() => {
          res.redirect("/admin/view-products");
        });
    } catch {
      res.redirect("/error");
    }
  },
  editproductget: async (req, res) => {
    try {
      const { id } = req.query;

      const product = await Product.findOne({ _id: id });

      const category = await Category.find();

      res.render("admin/edit-product", { product, category });
    } catch {
      res.redirect("/error");
    }
  },
  // coupens
  addCoupon: (req, res) => {
    try {
      const couponMsg = req.flash("coupon");
      res.render("admin/add-coupon", { couponMsg });
    } catch {
      res.redirect("/error");
    }
  },
  viewCoupon: (req, res) => {
    try {
      adminDatabase.getAllCoupon((err, cop) => {
        res.render("admin/coupons", { cop });
      });
    } catch {
      res.redirect("/error");
    }
  },
  addPostCoupon: async (req, res) => {
    try {
      const getCode = req.body.code;
      const code = getCode.toUpperCase();
      const coupon = await Coupon.findOne({ code });
      if (coupon) {
        req.flash("coupon", "This Coupon is already entered");
        res.redirect("/admin/add-coupon");
      } else {
        adminDatabase.addCoupon(req.body, code, () => {});
        res.redirect("/admin/view-coupons");
      }
    } catch {
      res.redirect("/error");
    }
  },

  deleteCoupon: (req, res) => {
    try {
      const { id } = req.query;
      adminDatabase.deleteCoupon(id).then(() => {
        res.json({ status: true });
      });
    } catch {
      res.redirect("/error");
    }
  },
  editCoupon: async (req, res) => {
    try {
      const { id } = req.params;
      const coupons = await Coupon.findOne({ _id: id });
      const cre = coupons.createdAt;

      adminDatabase.editCoupon(id, req.body, cre).then(() => {
        res.redirect("/admin/view-coupons");
      });
    } catch {
      res.redirect("/error");
    }
  },
  editCouponGet: async (req, res) => {
    try {
      const { id } = req.query;

      const coupons = await Coupon.findOne({ _id: id });
      let Difference = [];
      req.session.exp = coupons.expireAfter;

      const DifferenceInTime =
        coupons.expireAfter.getTime() - coupons.createdAt.getTime();

      // To calculate the no. of days between two dates
      Difference = DifferenceInTime / (1000 * 3600 * 24);

      res.render("admin/edit-coupon", { coupons, Difference });
    } catch (err) {
      res.redirect("/error");
    }
  },
  viewOrders: async (req, res) => {
    try {
      order
        .find()
        .populate("userid")
        .where()
        .exec((errs, users) => {
          if (users) users.reverse();

          order
            .find()
            .populate("products.item")
            .where()
            .exec((err, orders) => {
              if (orders) orders.reverse();

              res.render("admin/view-orders", {
                orders,
                users,
              });
            });
        });
    } catch (e) {
      res.redirect("/error");
    }
  },
  changeStatus: (req, res) => {
    try {
      const value = req.query.s;
      if (value === "Delivered" || value === "Cancelled") {
        order
          .updateOne({ _id: req.query.id }, { $set: { status: req.query.s } })
          .then(() => {
            res.json({ status: false, value });
          });
      } else {
        order
          .updateOne({ _id: req.query.id }, { $set: { status: req.query.s } })
          .then(() => {
            res.json({ status: true });
          });
      }
    } catch {
      res.redirect("/error");
    }
  },
  salesReport: async (req, res) => {
    try {
      const sales = await order.aggregate([
        { $match: { status: { $eq: "Delivered" } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" },
            },
            totalPrice: { $sum: "$total" },
            items: { $sum: { $size: "$products" } },
            count: { $sum: 1 },
          },
        },
        {
          $sort: {
            "_id.year": -1,
            "_id.month": -1,
            "_id.day": -1,
          },
        },
      ]);

      res.render("admin/day-report", { sales });
    } catch {
      res.redirect("/error");
    }
  },
  monthReport: async (req, res) => {
    try {
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const sale = await order.aggregate([
        { $match: { status: { $eq: "Delivered" } } },
        {
          $group: {
            _id: {
              month: { $month: "$createdAt" },
            },
            totalPrice: { $sum: "$total" },
            items: { $sum: { $size: "$products" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { createdAt: 1 } },
      ]);

      const sales = sale.map((el) => {
        const newOne = { ...el };
        // eslint-disable-next-line no-underscore-dangle
        newOne._id.month = months[newOne._id.month - 1];
        return newOne;
      });

      res.render("admin/month-report", { sales });
    } catch {
      res.redirect("/error");
    }
  },
  yearReport: async (req, res) => {
    try {
      const sales = await order.aggregate([
        { $match: { status: { $eq: "Delivered" } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
            },
            totalPrice: { $sum: "$total" },
            items: { $sum: { $size: "$products" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.year": -1 } },
      ]);

      res.render("admin/year-report", { sales });
    } catch {
      res.redirect("/error");
    }
  },
  chart1: async (req, res) => {
    try {
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const sale = await order.aggregate([
        { $match: { status: { $eq: "Delivered" } } },
        {
          $group: {
            _id: {
              month: { $month: "$createdAt" },
            },
            totalPrice: { $sum: "$total" },
            items: { $sum: { $size: "$products" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { "_id.month": -1 } },
      ]);

      const salesRep = sale.map((el) => {
        const newOne = { ...el };
        // eslint-disable-next-line no-underscore-dangle
        newOne._id.month = months[newOne._id.month - 1];
        return newOne;
      });

      res.json({ salesRep });
    } catch {
      res.redirect("/error");
    }
  },
  chart2: async (req, res) => {
    try {
      const sales = await order.aggregate([
        { $match: { status: { $ne: "Cancelled" } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" },
              day: { $dayOfMonth: "$createdAt" },
            },
            totalPrice: { $sum: "$total" },
            items: { $sum: { $size: "$products" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { createdAt: -1 } },
      ]);
      res.json({ sales });
    } catch {
      res.redirect("/error");
    }
  },
  chart3: async (req, res) => {
    try {
      const sales = await order.aggregate([
        { $match: { status: { $ne: "Cancelled" } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
            },
            totalPrice: { $sum: "$total" },
            items: { $sum: { $size: "$products" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { createdAt: -1 } },
      ]);

      res.json({ sales });
    } catch {
      res.redirect("/error");
    }
  },
  chart4: async (req, res) => {
    try {
      const months = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ];
      const revenue = await order.aggregate([
        {
          $match: {
            $or: [
              {
                $and: [
                  { status: { $eq: "Delivered" }, payment: { $eq: "COD" } },
                ],
              },
              {
                $and: [
                  {
                    status: { $eq: "Delivered" },
                    payment: { $eq: "Razorpay" },
                  },
                ],
              },
              {
                $and: [
                  { status: { $eq: "Placed" }, payment: { $eq: "Razorpay" } },
                ],
              },
            ],
          },
        },

        {
          $group: {
            _id: {
              month: { $month: "$createdAt" },
            },
            totalPrice: { $sum: "$total" },
            items: { $sum: { $size: "$products" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { createdAt: -1 } },
      ]);
      const sales = revenue.map((el) => {
        const newOne = el;
        // eslint-disable-next-line no-underscore-dangle
        newOne._id.month = months[newOne._id.month - 1];
        return newOne;
      });

      res.json({ sales });
    } catch {
      res.redirect("/error");
    }
  },

  viewBanner: (req, res) => {
    try {
      adminDatabase.getAllBanner((err, ban) => {
        res.render("admin/view-banner", { ban });
      });
    } catch {
      res.redirect("/error");
    }
  },

  addPostBanner: (req, res) => {
    try {
      const image = req.files.img;

      let imageUrl;
      if (image) {
        imageUrl = image[0].path;
        imageUrl = imageUrl.substring(6);
      }
      const bann = new Banner({
        title: req.body.title,
        description: req.body.description,
        image: imageUrl,
        url: req.body.url,
      });
      bann
        .save()
        .then(() => {
          res.redirect("/admin/view-banner");
        })
        .catch(() => {});
    } catch {
      res.redirect("/error");
    }
  },

  deleteBanner: (req, res) => {
    try {
      const { id } = req.query;
      adminDatabase.deleteBanner(id).then(() => {
        res.json({ status: true });
      });
    } catch {
      res.redirect("/error");
    }
  },
};
