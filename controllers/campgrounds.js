const Campground = require('../models/campground');
const {cloudinary} = require('../cloudinary/index');
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
}

module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new");
}

module.exports.createCampground = async (req, res, next) => {
    //if(!req.body.campground) throw new ExpressError('Invalid Campground data', 400);

    const campground = new Campground(req.body.campground);
    campground.images = req.files.map(f => ({url: f.path, filename: f.filename})) //from multer to get url of image and name of image
    campground.author = req.user._id; //to associate the new campground with the user which created it
    await campground.save();
    console.log(campground);
    req.flash('success', 'Successfully created a new campground');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground = async(req, res) => {
    const id = req.params.id;
    const camp = await Campground.findById(id).
    populate({path: 'reviews', populate: ({path: 'author'})}).  //nested because we have to populate author inside of reviews
    populate('author');
    if(!camp) {
      req.flash('error', 'Campground does not exist!');
      return res.redirect('/campgrounds');
    }
    res.render("campgrounds/show", {camp});
}

module.exports.renderEditForm = async (req, res) => {
    const id = req.params.id;
    const camp = await Campground.findById(id);
    res.render("campgrounds/edit", {camp});
}

module.exports.editCampground = async (req, res) => {
    const id = req.params.id;
    //to change all edited information we use spread operator
    const camp = await Campground.findByIdAndUpdate(id, {...req.body.campground}); // as we grouped the name in new ejs with campground ex, campground[title] etc, we use spread operator
    //The spread operator is used to expand an iterable (e.g., an array or an object) into individual elements. In this context, it is used to create a new object that includes all the properties and values from req.body.campground.
    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}));  //this makes an array so push array inside array is troublesome
    //so we use spread operator to pass in each image seperately
    camp.images.push(...imgs);
    await camp.save()
    //to delete image in mongodb
    if(req.body.deleteImages) {
        for(let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await camp.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}});
    }
    if(!camp) {
      req.flash('error', 'Campground does not exist!');
      return res.redirect('/campgrounds');
    }
    req.flash('success','Successfully updated the campground')
    res.redirect(`/campgrounds/${camp._id}`);
}

module.exports.deleteCampground = async (req, res) => {
    const id = req.params.id;
    await Campground.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted your camp');
    res.redirect("/campgrounds");
}