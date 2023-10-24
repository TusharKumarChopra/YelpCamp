const mongoose = require('mongoose');
const Review = require("./review");
const { campgroundSchema } = require('../schemas');
const Schema = mongoose.Schema; //only a reference


const imageSchema = new Schema({
    url: String,
    filename:String
});

imageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200');
})

const CampgroundSchema = new Schema({
    title: String,
    images: [imageSchema],
    price: Number,
    description: String,
    location: String,
    //we are assigning the camp made by a particular person as the author for that campground
    author: {
        type: Schema.Types.ObjectId, //reference
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'
        }
    ]
});

//middleware for deleting reviews after campground is deleted
CampgroundSchema.post('findOneAndDelete', async function(doc) {
    if(doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Campground', CampgroundSchema);