const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const { campgroundSchema } = require('../schemas');

const validateCampground = (req, res, next) => {
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

// ALL CAMPGROUNDS
router.get('/',wrapAsync(async (req, res, next) => {
      const campgrounds = await Campground.find({});
      res.render('campgrounds/index', { campgrounds });
    })
  );
  
  // DISPLAYING PAGE TO ADD CAMPGROUND
  router.get('/new', (req, res) => {
    res.render('campgrounds/new');
  });
  
  // DISPLAYING EDIT FORM
  router.get('/:id/edit',wrapAsync(async (req, res) => {
      const campground = await Campground.findById(req.params.id);
      if(!campground) {
        req.flash('error', 'Cannot find requested campground!');
        return res.redirect('/campgrounds')
      }
      res.render('campgrounds/edit', { campground });
    })
  );
  
  //INDIVIDUAL CAMPGROUND
  router.get('/:id',wrapAsync(async (req, res) => {
      const campground = await Campground.findById(req.params.id).populate('reviews');
      if(!campground) {
        req.flash('error', 'Cannot find requested campground!');
        return res.redirect('/campgrounds')
      }
      res.render('campgrounds/show', { campground });
    })
  );
  // UPDATING DATABASE WITH NEW VALUES FOR A CAMPGROUND
  router.put('/:id',validateCampground, wrapAsync(async (req, res) => {
      const { id } = req.params;
      const campground = await Campground.findByIdAndUpdate(id, {
        ...req.body.campground,
      });
      req.flash('success', 'You have successfully updated a campground!')
      res.redirect(`/campgrounds/${campground._id}`);
    })
  );
  // ADDING NEW CAMPGROUND AND SAVING TO DATABASE
  router.post('/',validateCampground, wrapAsync(async (req, res, next) => {
      const campground = new Campground(req.body.campground);
      await campground.save();
      req.flash('success', 'You have successfully made a new campground!')
      res.redirect(`/campgrounds/${campground._id}`);
    })
  );
  // DELETING A CAMPGROUND(BUTTON)
  router.delete('/:id',wrapAsync(async (req, res) => {
      const { id } = req.params;
      await Campground.findByIdAndDelete(id);
      req.flash('success', 'You have successfully deleted a campground!');
      res.redirect('/campgrounds');
    })
  );

  module.exports = router;

  