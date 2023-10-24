const express = require('express');
const router = express.Router({mergeParams: true}); //as in routes we cant get id's directly
const catchAsync = require('../utils/catchAsync');
const reviews = require('../controllers/reviews');
const {validateReview, isLoggedin, isReviewAuthor} = require('../middleware');


router.post("/", isLoggedin, validateReview, catchAsync(reviews.makeReview))
router.delete("/:reviewid", isLoggedin, isReviewAuthor, catchAsync(reviews.deleteReview))

module.exports = router;