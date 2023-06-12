const Campground = require("../models/campground");
const Review = require("../models/review");

module.exports.createReview = async (req, res) => {
  try {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash("success", "Posted your new review !");
    res.redirect(`/campgrounds/${campground._id}`);
  } catch (e) {
    req.flash("error", "Sorry, that location does not exist !");
    res.redirect("/campgrounds");
  }
};

module.exports.redirectToCampground = async (req, res) => {
  try {
    const campground = await Campground.findById(req.params.id);
    req.flash("success", "You can leave a review now ! ");
    res.redirect(`/campgrounds/${campground._id}`);
  } catch (e) {
    req.flash("error", "Sorry, that location does not exist !");
    res.redirect("/campgrounds");
  }
};

module.exports.deleteReview = async (req, res) => {
  try {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash("success", "Successfully deleted review !");
    res.redirect(`/campgrounds/${id}`);
  } catch (e) {
    req.flash("error", "Sorry, that location does not exist !");
    res.redirect("/campgrounds");
  }
};
