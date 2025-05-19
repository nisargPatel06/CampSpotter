const { campgroundSchema, reviewSchema } = require('./schemas.js');
const Campground = require('./models/campground');
const ExpressErrors = require("./utils/ExpressErrors");

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl; 
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}
module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
      const msg = error.details.map((el) => el.message).join(",");
      throw new ExpressErrors(msg, 400);
    } else {
      next();
    }
  };
  module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
      const msg = error.details.map((el) => el.message).join(",");
      throw new ExpressErrors(msg, 400);
    } else {
      next();
    }
  };
  
module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}

module.exports.isAuthor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const campground = await Campground.findById(id);

    // Check if the campground exists
    if (!campground) {
      req.flash("error", "Campground not found!");
      return res.redirect("/campgrounds");
    }

    // If there is no author, allow deletion
    if (!campground.author) {
      req.flash("warning", "Campground has no author, deleting anyway.");
      return next();
    }

    // Check if the current user is the author
    if (!campground.author.equals(req.user._id)) {
      req.flash("error", "You do not have permission to do that!");
      return res.redirect(`/campgrounds/${id}`);
    }

    next();
  } catch (err) {
    console.error("Error in isAuthor middleware:", err);
    req.flash("error", "Something went wrong. Please try again.");
    return res.redirect("/campgrounds");
  }
};
