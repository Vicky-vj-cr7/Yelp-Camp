const Campground = require("../models/campground");
const { cloudinary } = require("../cloudinary/index");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

module.exports.index = async (req, res) => {
  if (req.query.search) {
    escapeRegex(req.query.search);
    const regex = new RegExp(escapeRegex(req.query.search), "gi");
    const foundCampgrounds = await Campground.find({ title: regex });
    if (foundCampgrounds.length <= 0) {
      req.flash("error", "Sorry! We cannot find any matching location !");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/index", { campgrounds: foundCampgrounds });
  } else {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
  }
};

module.exports.renderNewForm = (req, res) => {
  res.render("campgrounds/new");
};

module.exports.createCampground = async (req, res, next) => {
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1,
    })
    .send();
  if (
    !geoData ||
    !geoData.body ||
    !geoData.body.features ||
    !geoData.body.features.length
  ) {
    req.flash("error", "Invalid Location !");
    return res.redirect("/campgrounds/new");
  }
  if (req.files.length <= 0) {
    req.flash("error", "Location should have an image !");
    return res.redirect("/campgrounds/new");
  }
  const campground = new Campground(req.body.campground);
  campground.geometry = geoData.body.features[0].geometry;
  campground.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  campground.author = req.user._id;
  // console.log(campground);
  await campground.save();
  req.flash("success", "Location added successfully !");
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.showCampground = async (req, res) => {
  try {
    const campground = await Campground.findById(req.params.id)
      .populate({
        path: "reviews",
        populate: {
          path: "author",
        },
      })
      .populate("author");
    if (!campground) {
      req.flash("error", "Sorry, that location does not exist !");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show", { campground });
  } catch (e) {
    req.flash("error", "Sorry, that location does not exist !");
    res.redirect("/campgrounds");
  }
};

module.exports.renderEditForm = async (req, res) => {
  try {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
      req.flash("error", "Sorry, that location does not exist !");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit", { campground });
  } catch (e) {
    req.flash("error", "Sorry, that location does not exist !");
    res.redirect("/campgrounds");
  }
};

module.exports.updateCampground = async (req, res) => {
  const { id } = req.params;
  const imgs = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1,
    })
    .send();
  if (
    !geoData ||
    !geoData.body ||
    !geoData.body.features ||
    !geoData.body.features.length
  ) {
    req.flash("error", "Invalid Location !");
    return res.redirect("/campgrounds/new");
  }

  const campground = await Campground.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  campground.geometry = geoData.body.features[0].geometry;
  campground.images.push(...imgs);
  await campground.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await campground.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }
  req.flash("success", `Location updated successfully ! - ${campground.title}`);
  res.redirect(`/campgrounds/${campground._id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Location deleted successfully ! ");
  res.redirect("/campgrounds");
};
