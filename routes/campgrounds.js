const express = require("express");
const router = express.Router();
const campgrounds = require("../controllers/campgrounds");
const catchAsync = require("../utils/catchAsync");
const {
  isLoggedIn,
  isCampgroundAuthor,
  validateCampground,
} = require("../middleware");
const multer = require("multer");
const { storage } = require("../cloudinary");

// multer configuration
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2000000,
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.toLowerCase().match(/\.(png|jpg|jpeg)$/)) {
      return cb(new Error("Please upload a image of type PNG ,JPEG OR JPG !"));
    }
    cb(undefined, true);
  },
});

const Campground = require("../models/campground");

router
  .route("/")
  .get(catchAsync(campgrounds.index))
  .post(
    isLoggedIn,
    upload.array("image"),
    validateCampground,
    catchAsync(campgrounds.createCampground)
  );

router.get("/new", isLoggedIn, campgrounds.renderNewForm);

router
  .route("/:id")
  .get(catchAsync(campgrounds.showCampground))
  .put(
    isLoggedIn,
    isCampgroundAuthor,
    upload.array("image"),
    validateCampground,
    catchAsync(campgrounds.updateCampground)
  )
  .delete(
    isLoggedIn,
    isCampgroundAuthor,
    catchAsync(campgrounds.deleteCampground)
  );

router.get(
  "/:id/edit",
  isLoggedIn,
  isCampgroundAuthor,
  catchAsync(campgrounds.renderEditForm)
);

module.exports = router;
