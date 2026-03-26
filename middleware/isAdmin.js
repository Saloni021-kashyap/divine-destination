module.exports = (req, res, next) => {
  if (!req.session.user || req.session.user.role !== "admin") {
    return res.send("Access Denied ❌ Admin Only");
  }
  next();
};
