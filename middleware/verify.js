module.exports = {
  verifyUser: (req, res, next) => {
    if (req.session.loggedIn) {
      next();
    } else {
      res.redirect('/login');
    }
  },
  verifyAdmin: (req, res, next) => {
    if (req.session.admin) {
      next();
    } else {
      res.redirect('/admin/login');
    }
  },
};
