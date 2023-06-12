const express = require("express");
const router = express.Router({ mergeParams: true });
const { validateReview, isLoggedIn, isReviewAuthor } = require("../middleware");
const reviews = require("../controllers/reviews");
const catchAsync = require("../utils/catchAsync");

router
  .route("/")
  .post(isLoggedIn, validateReview, catchAsync(reviews.createReview))
  .get(isLoggedIn, catchAsync(reviews.redirectToCampground));

router
  .route("/:reviewId")
  .delete(isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;
