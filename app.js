const express = require('express');
const app = express();
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const { campgroundSchema, reviewSchema } = require('./schemas');
const wrapAsync = require('./utils/wrapAsync');
const ExpressError = require('./utils/ExpressError');
const path = require('path');
const Campground = require('./models/campground');
const Review = require('./models/review');
const review = require('./models/review');
mongoose.connect('mongodb://localhost:27017/YelpCamp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

app.engine('ejs', ejsMate);
//CHECKING MONGO CONNECTION STATUS
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('MONGODB CONNECTED!');
});
//SETS EJS-MATE AS A ENGINE TO RENDER EJS

//SET AND USE METHODS FOR THE APP
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

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

const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};
// **** ROUTES ****

app.get('/', (req, res) => {
  res.render('home');
});

// ALL CAMPGROUNDS
app.get(
  '/campgrounds',
  wrapAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', { campgrounds });
  })
);

// DISPLAYING PAGE TO ADD CAMPGROUND
app.get('/campgrounds/new', (req, res) => {
  res.render('campgrounds/new');
});

// DISPLAYING EDIT FORM
app.get(
  '/campgrounds/:id/edit',
  wrapAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', { campground });
  })
);

//INDIVIDUAL CAMPGROUND
app.get(
  '/campgrounds/:id',
  wrapAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    res.render('campgrounds/show', { campground });
  })
);
// UPDATING DATABASE WITH NEW VALUES FOR A CAMPGROUND
app.put(
  '/campgrounds/:id',
  validateCampground,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {
      ...req.body.campground,
    });
    res.redirect(`/campgrounds/${campground._id}`);
  })
);
// ADDING NEW CAMPGROUND AND SAVING TO DATABASE
app.post(
  '/campgrounds',
  validateCampground,
  wrapAsync(async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  })
);
// DELETING A CAMPGROUND(BUTTON)
app.delete(
  '/campground/:id',
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
  })
);

//REVIEWS

app.post(
  '/campgrounds/:id/reviews',
  validateReview,
  wrapAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground.id}`);
  })
);

app.delete('/campgrounds/:id/reviews/:reviewId', wrapAsync(async(req, res) => {
    const {id, reviewId} = req.params;
    await Campground.findByIdAndUpdate(id, {$pull: { reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);
  res.redirect(`/campgrounds/${id}`);
}))

//THIS WILL RUN WHEN NO MATCHING ROUTE IS REQUESTED
app.all('*', (req, res, next) => {
  next(new ExpressError('PAGE NOT FOUND', 404)); // ERROR WILL BE PASSED TO ERROR HANDLER BELOW
});
//ERROR HANDLER
app.use((err, req, res, next) => {
  //Deconstructing error from ExpressError class above, setting defaults if there are missing
  const { statusCode = 500 } = err;
  if (!err.message) err.message = 'OH NO, SOMETHING WENT WRONG!';
  res.status(statusCode).render('error', { err });
});
// OPENING EXPRESS PORT
app.listen(3000, () => {
  console.log('LISTENING ON PORT 3000!');
});
