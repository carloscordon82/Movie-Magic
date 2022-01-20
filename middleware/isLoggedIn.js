module.exports = (req, res, next) => {
  if (!req.session.user) {
    return res.render("auth/login", {
      layout: false,
      originalUrl: req.originalUrl,
    });
  }
  console.log("CHECKING LOGIN", req.app.locals.globalUser);
  req.app.locals.globalUser = req.session.user;
  next();
};
