const User = require("../models/user");

module.exports.renderRegister = (req, res) => {
  res.render("users/register");
};

module.exports.register = async (req, res, next) => {
  try {
    const { email, username, password, adminCode } = req.body;
    const user = new User({ email, username });
    if (adminCode) {
      if (adminCode == process.env.ADMIN_KEY) {
        user.isAdmin = true;
      } else {
        req.flash("error", "Incorrect admin code !");
        return res.redirect("/register");
      }
    }
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, (err) => {
      if (err) return next(err);
      req.flash("success", `Bonjour ! ${user.username}`);
      res.redirect("/campgrounds");
    });
  } catch (e) {
    if (e.code == 11000) {
      req.flash("error", "The user with that mail already exists !");
    } else {
      req.flash("error", e.message);
    }
    res.redirect("register");
  }
};

module.exports.renderLogin = (req, res) => {
  res.render("users/login");
};

module.exports.login = (req, res) => {
  req.flash("success", `Welcome Back ! ${req.user.username}`);
  const redirectUrl = req.session.returnTo || "/campgrounds";
  delete req.session.returnTo;
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res) => {
  req.logout();
  req.flash("success", "Successfully logged out !");
  res.redirect("/campgrounds");
};
