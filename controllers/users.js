const User = require('../models/user');
const wrapAsync = require('../utils/wrapAsync');

module.exports.renderRegisterForm = (req, res) => {
    res.render('users/register')
};

module.exports.registerUser = async(req, res, next) => {
    try {
        const {username, email, password} = req.body;
        const newUser = await new User({email, username});
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, err => {
            if (err) {
                return next(err);
            }
            req.flash('success', 'Welcome to the Yelp Camp!')
            res.redirect('/campgrounds');
        });
    } catch(e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}

module.exports.renderLoginForm = (req, res) => {
    res.render('users/login')
}

module.exports.loginUser = (req, res) => {
    req.flash('success', 'Welcome back!')
    const redirectUrl = req.session.returnTo || '/campgrounds';
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

module.exports.logoutUser = (req, res) => {
    req.logout();
    req.flash('success', 'Goodbye!')
    res.redirect('/campgrounds')
};


