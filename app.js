const express = require('express');
const app = express();
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const path = require('path');

const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');


const passport = require('passport');
const passportLocal = require('passport-local');
const User = require('./models/user');




mongoose.connect('mongodb://localhost:27017/YelpCamp', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false
});

//CHECKING MONGO CONNECTION STATUS
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('MONGODB CONNECTED!');
});
//SETS EJS-MATE AS A ENGINE TO RENDER EJS

//SET AND USE METHODS FOR THE APP
app.engine('ejs', ejsMate);
app.set('views', path.join(__dirname, '/views'));
app.set('view engine', 'ejs');

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

const sessionConfig = {
  secret: 'thisisasecret',
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7
  }
}
app.use(session(sessionConfig));
app.use(flash());



app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(User.authenticate()))
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next) => {
  console.log(req.session)
  res.locals.currentUser = req.user;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
})

// **** ROUTES ****
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/', userRoutes);



app.get('/', (req, res) => {
  res.render('home');
});

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
