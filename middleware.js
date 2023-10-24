const Campground = require('./models/campground');
const {campgroundSchema, reviewSchema} = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const Review = require('./models/review');
module.exports.isLoggedin = (req, res, next) =>{
    if(!req.isAuthenticated()) { //to allow to add a new campground only if user is logged in (uses passport static method)
        //returnTo is stored so that after login we can go back to the route which we were exploring before login(stores in session)
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in')
        return res.redirect('/login');
    } 
    next();
}

//use a middleware function to transfer the returnTo value from the session (req.session.returnTo) to the Express.js app res.locals object before the passport.authenticate() function is executed in the /login POST route.
//In Express.js, res.locals is an object that provides a way to pass data through the application during the request-response cycle. It allows you to store variables that can be accessed by your templates and other middleware functions

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo;
    }
    next();
}


module.exports.validateCampground = (req, res, next) => {
    // validating on server side
    const {error} = campgroundSchema.validate(req.body);
    if(error) {
      const msg = error.details.map(el => el.message).join(',');
      throw new ExpressError(msg, 400);
    }
    else {
      next();
    }
  }


//validation server-side
module.exports.validateReview = (req, res, next) => {
  const {error} = reviewSchema.validate(req.body);
  if(error) {
    const msg = error.details.map(el => el.message).join(',');
    throw new ExpressError(msg, 400);
  }
  else {
    next();
  }
} 


//for allowing only owner to edit or delete a campground
module.exports.isAuthor = async (req, res, next) => {
  const {id} = req.params;
  const camp = await Campground.findById(id);
  if(!camp.author.equals(req.user._id)) {
    req.flash('error', 'You do not have permission!');
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
}


//for allowing only the one who wrote the review to delete it
module.exports.isReviewAuthor = async(req, res, next) => {
    const {id, reviewid} = req.params;
    const review = await Review.findById(reviewid);
    if(!review.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}