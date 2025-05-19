const express = require("express");
const router = express.Router();
const { campgroundSchema } = require("../schemas.js");
const ExpressErrors = require("../utils/ExpressErrors");
const Campground = require("../models/campground");
const {isLoggedIn,isAuthor, validateCampground} = require("../middleware.js");
const campground = require("../models/campground");

router.get("/", async (req, res) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds/index.ejs", { campgrounds });
});
//Creating new campground by get and post
router.get("/new", isLoggedIn,(req, res) => {
  res.render("campgrounds/new.ejs");
});

router.post("/",isLoggedIn, validateCampground, async (req, res, next) => {
  try {
    const newCampground = new Campground(req.body.campground);
    newCampground.author = req.user._id;
    await newCampground.save();
    req.flash("success", "Successfully Added the campground");
    res.redirect(`/campgrounds/${newCampground._id}`);
    console.log("Campground added");
  } catch (e) {
    next(e);
  }
});

// Display information for each campground
router.get("/:id",async (req, res, next) => {
  try {
   const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');
    console.log(campground);
    if (!campground) {
      req.flash("error", "Cannot find that campground!");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/show.ejs", { campground });
  } catch (e) {
    next(e);
  }
});
// // Editing the campground
router.get("/:id/edit", isLoggedIn, isAuthor, async (req, res, next) => {
  try {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
      req.flash("error", "Cannot find that campground!");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit.ejs", { campground });
  } catch (e) {
    next(e);
  }
});
router.put("/:id", isLoggedIn, isAuthor , validateCampground, async (req, res, next) => {
  try {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground });
    req.flash('success','Successfully updated campground!');
    res.redirect(`/campgrounds/${campground._id}`)
  } catch (e) {
    next(e);
  }
});

// Delete the campground
router.delete("/:id", isLoggedIn, isAuthor,async (req, res, next) => {
  try {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    console.log("Campground deleted");
    req.flash("success", "Campground Deleted");
    res.redirect("/campgrounds");
  } catch (e) {
    next(e);
  }
});

module.exports = router;
