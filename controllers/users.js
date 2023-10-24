const User = require('../models/user');

module.exports.renderRegisterForm = (req, res) => {
    res.render('user/register');
}


//try-catch to flash a message when a username already exists  
module.exports.registerUser = async (req, res) => {
    try{
    const {email, username, password} = req.body;
    const user = new User({email, username});
    //register method is in-built in passport
    const registeredUser = await User.register(user, password);
    // after registering to automatically login
    req.login(registeredUser, err => {
        if (err) return next(err);
        else  {
            req.flash("success","Welcome to yelp camp");
            res.redirect('/campgrounds');
        }
    })
    } catch(e) {
        req.flash("error", e.message)
        res.redirect('/register')
    }
}

module.exports.renderLoginForm = (req, res) => {
    res.render('user/login');
}

// middleware for authenticating by passport library
module.exports.loginUser = async (req, res) => {
    req.flash("success", "welcome back!");
    //if user goes directly to login so we use or /campgrounds
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    // after returning we delete returnTo
    // delete req.session.returnTo;
    res.redirect(redirectUrl);
}

module.exports.userLogout = (req, res, next) => {
    req.logout(function (err) {  // logout() is in-built by passport
        if(err) {
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
}