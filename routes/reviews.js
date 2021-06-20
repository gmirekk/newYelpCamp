const express = require('express');
const router = express.Router({mergeParams: true});
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');
const { reviewSchema } = require('../schemas');
const Review = require('../models/review');
const Campground = require('../models/campground');

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
      const msg = error.details.map((el) => el.message).join(',');
      throw new ExpressError(msg, 400);
    } else {
      next();
    }
  };
  //REVIEWS

router.post('/',validateReview, wrapAsync(async (req, res) => {
      const { id } = req.params;
      const campground = await Campground.findById(id);
      const review = new Review(req.body.review);
      campground.reviews.push(review);
      await review.save();
      await campground.save();
      req.flash('success', 'You have successfully added new review!');
      res.redirect(`/campgrounds/${campground.id}`);
    })
  );
  
  router.delete('/:reviewId', wrapAsync(async(req, res) => {
      const {id, reviewId} = req.params;
      await Campground.findByIdAndUpdate(id, {$pull: { reviews: reviewId}});
      await Review.findByIdAndDelete(reviewId);
      req.flash('success', 'You have successfully deleted a review!');
    res.redirect(`/campgrounds/${id}`);
  }))
  
  module.exports = router;

