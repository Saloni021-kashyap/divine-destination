module.exports = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    req.session.error = "Access denied: admin only";
    return res.redirect("/");
  }
  next();
};
