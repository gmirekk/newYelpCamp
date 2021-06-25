const Campground = require('../models/campground');

module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
  };

module.exports.renderNewForm = (req, res) => {
    res.render('campgrounds/new');
  };

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if(!campground) {
      req.flash('error', 'Cannot find requested campground!');
      return res.redirect('/campgrounds')
    }
    res.render('campgrounds/edit', { campground });
  };

module.exports.showCampground = async (req, res) => {
    //nested populate
      const campground = await Campground.findById(req.params.id).populate({path: 'reviews', populate: {path: 'author'}}).populate('author');
      if(!campground) {
        req.flash('error', 'Cannot find requested campground!');
        return res.redirect('/campgrounds')
      }
      res.render('campgrounds/show', { campground });
    };

module.exports.editCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, { ...req.body.campground});
    req.flash('success', 'You have successfully updated a campground!');
    res.redirect(`/campgrounds/${campground._id}`);
    };

module.exports.createCampground = async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash('success', 'You have successfully made a new campground!')
    res.redirect(`/campgrounds/${campground._id}`);
  };

module.exports.deletingCampground = async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'You have successfully deleted a campground!');
    res.redirect('/campgrounds');
  };
