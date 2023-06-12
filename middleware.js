const { campgroundSchema, reviewSchema } = require("./schemas.js");
const ExpressError = require("./utils/ExpressError");
const Campground = require("./models/campground");
const Review = require("./models/review");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be signed in first !");
    return res.redirect("/login");
  }
  next();
};

module.exports.validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.isCampgroundAuthor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
      req.flash("error", "Sorry, that location does not exist !");
      return res.redirect("/campgrounds");
    }
    if (!campground.author.equals(req.user._id) && !req.user.isAdmin) {
      req.flash("error", "You do not have permission to do that !");
      return res.redirect(`/campgrounds/${id}`);
    }
    next();
  } catch (e) {
    req.flash("error", "Sorry, that location does not exist !");
    return res.redirect("/campgrounds");
  }
};

module.exports.isReviewAuthor = async (req, res, next) => {
  try {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if (!review) {
      req.flash("error", "Sorry, that review does not exist !");
      return res.redirect(`/campgrounds/${id}`);
    }
    if (!review.author.equals(req.user._id) && !req.user.isAdmin) {
      req.flash("error", "You do not have permission to do that !");
      return res.redirect(`/campgrounds/${id}`);
    }
    next();
  } catch (e) {
    req.flash("error", "Sorry, that comment does not exist !");
    return res.redirect(`/campgrounds/${id}`);
  }
};

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};
