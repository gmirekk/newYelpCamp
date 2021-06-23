const express = require('express');
const router = express.Router();
const wrapAsync = require('../utils/wrapAsync');
const Campground = require('../models/campground');
const {isLoggedIn, isAuthor, validateCampground} = require('../middleware');

// ALL CAMPGROUNDS
router.get('/',wrapAsync(async (req, res, next) => {
      const campgrounds = await Campground.find({});
      res.render('campgrounds/index', { campgrounds });
    })
  );
  
  // DISPLAYING PAGE TO ADD CAMPGROUND
  router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
  });
  
  // DISPLAYING EDIT FORM
  router.get('/:id/edit',isLoggedIn, isAuthor, wrapAsync(async (req, res) => {
      const { id } = req.params;
      const campground = await Campground.findById(id);
      if(!campground) {
        req.flash('error', 'Cannot find requested campground!');
        return res.redirect('/campgrounds')
      }
      res.render('campgrounds/edit', { campground });
    })
  );
  
  //INDIVIDUAL CAMPGROUND
  router.get('/:id',wrapAsync(async (req, res) => {
    //nested populate
      const campground = await Campground.findById(req.params.id).populate({path: 'reviews', populate: {path: 'author'}}).populate('author');
      console.log(campground)
      if(!campground) {
        req.flash('error', 'Cannot find requested campground!');
        return res.redirect('/campgrounds')
      }
      res.render('campgrounds/show', { campground });
    })
  );
  // UPDATING DATABASE WITH NEW VALUES FOR A CAMPGROUND
  router.put('/:id',isLoggedIn, isAuthor, validateCampground, wrapAsync(async (req, res) => {
      const { id } = req.params;
      const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground});
      req.flash('success', 'You have successfully updated a campground!');
      res.redirect(`/campgrounds/${campground._id}`);
      }));

  // ADDING NEW CAMPGROUND AND SAVING TO DATABASE
  router.post('/',isLoggedIn, validateCampground, wrapAsync(async (req, res, next) => {
      const campground = new Campground(req.body.campground);
      campground.author = req.user._id;
      await campground.save();
      req.flash('success', 'You have successfully made a new campground!')
      res.redirect(`/campgrounds/${campground._id}`);
    })
  );
  // DELETING A CAMPGROUND(BUTTON)
  router.delete('/:id', isLoggedIn, isAuthor, wrapAsync(async (req, res) => {
      const { id } = req.params;
      await Campground.findByIdAndDelete(id);
      req.flash('success', 'You have successfully deleted a campground!');
      res.redirect('/campgrounds');
    })
  );

  module.exports = router;

  