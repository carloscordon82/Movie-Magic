module.exports = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/");
  } else if (!req.session.user.isAdmin) {
    return res.redirect("/");
  }
  req.app.locals.globalUser = req.session.user;

  next();
};
