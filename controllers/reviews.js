const Campground = require('../models/campground');
const Review = require("../models/review");



module.exports.makeReview = async(req, res) => {
    const {id} = req.params;
    const camp = await Campground.findById(id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    camp.reviews.push(review)
    await review.save();
    await camp.save();
    req.flash('success', 'Created new review');
    res.redirect(`/campgrounds/${id}`);
}


module.exports.deleteReview =  async (req, res) => {
    const {id} = req.params;
    const {reviewid} = req.params;
    const camp = await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewid}});
    await Review.findByIdAndDelete(reviewid);
    req.flash('success', 'Successfully deleted your review');
    res.redirect(`/campgrounds/${id}`)
}