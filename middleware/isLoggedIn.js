module.exports = (req, res, next) => {
  if (!req.session.user) {
    return res.render("auth/login", {
      layout: false,
      originalUrl: req.originalUrl,
    });
  }
  next();
};
