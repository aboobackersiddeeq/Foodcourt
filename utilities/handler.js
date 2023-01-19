module.exports = (err, req, res, next) => {
  console.log(err);
  res.status(err.statusCode || 500);
  res.render('user/error', {
    error: {
      status: err.statusCode || 500,
      message: err.message,
    },
    uzer: false,
    admin: false,
  });
};
