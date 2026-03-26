// 🔐 Check if user is logged in
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.session.user) {
    req.session.error = "Please log in to continue";
    return res.redirect("/login");
  }
  next();
};

// 🔐 Check if user is admin
module.exports.isAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    req.session.error = "Access denied: admin only";
    return res.redirect("/");
  }
  next();
};
