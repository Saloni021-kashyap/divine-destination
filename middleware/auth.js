// 🔐 Check if user is logged in
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  next();
};

// 🔐 Check if user is admin
module.exports.isAdmin = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.send("Access Denied: Admin only");
  }
  next();
};