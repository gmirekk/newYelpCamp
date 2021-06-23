const { campgroundSchema, reviewSchema } = require('./schemas');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl;
        req.flash('error', 'You must be signed in!')
        return res.redirect('/login')
    }
    next();
}

module.exports.validateCampground = (req, res, next) => {
    // the error is deconstructed from campgroundSchema
    const { error } = campgroundSchema.validate(req.body);
    // IF THERE IS ERROR, MAP OVER DETAILS OF THE ERROR(MAY BE MORE THAN ONE), JOIN THEM TOGETHER AND THROW THE ERROR WITH THE DETAILS AND STATUS TO ERROR HANDLER AT THE BOTTOM TO RENDER ERROR TEMPLATE
    if (error) {
      const msg = error.details.map((el) => el.message).join(',');
      throw new ExpressError(msg, 400);
    } else {
      next();
    }
  };

module.exports.isAuthor = async(req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if(!campground.author.equals(req.user._id)) {
    req.flash('error', 'You do not have permission to update this campground!');
    return res.redirect(`/campgrounds/${id}`)
  }
  next();
};
module.exports.isReviewAuthor = async(req, res, next) => {
    const { id, reviewId } = req.params;
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)) {
      req.flash('error', 'You do not have permission to update this campground!');
      return res.redirect(`/campgrounds/${id}`)
    }
    next();
  };

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
      const msg = error.details.map((el) => el.message).join(',');
      throw new ExpressError(msg, 400);
    } else {
      next();
    }
  };