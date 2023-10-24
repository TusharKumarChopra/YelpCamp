const mongoose = require('mongoose');
const Campground = require('../models/campground');
const cities = require('./cities');
const {places, descriptors} = require('./seedHelpers'); //destructuring of the below code
                        //or 
//const seedHelpers = require('./seedHelpers');
// Now you can access the variables from the imported module using dot notation
//const places = seedHelpers.places;
//const descriptors = seedHelpers.descriptors;
mongoose.set('strictQuery', true); 
main();
async function main() {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
    console.log('Connected to the mongo database successfully');
    
    // Continue with your application logic here
  } catch (err) {
    console.log("oh no mongo error")
    console.error('Error connecting to the database:', err);
  }
}

const sample = (array) => {             // to get a random names/value from an array
    const title = array[Math.floor(Math.random() * array.length)];
    return title;
}

const seedDB = async() => {
    await Campground.deleteMany({});
    for(let i = 0; i < 10; i++) {             // making new campgrounds and storing them in database and with different locations using random names from cities.js
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 600) + 30; // to generate a random number
        const camp = new Campground({
            title: `${sample(descriptors)} ${sample(places)}`,  //random title using both arrays
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            images: [
              {
                url: 'https://res.cloudinary.com/dbtk4il8g/image/upload/v1698060615/YelpCamp/mvx2orirl46xzrigvdke.jpg',
                filename: 'YelpCamp/mvx2orirl46xzrigvdke'
              },
              {
                url: 'https://res.cloudinary.com/dbtk4il8g/image/upload/v1698060618/YelpCamp/qpgq0zcerxxrqqvs8ha8.jpg',
                filename: 'YelpCamp/qpgq0zcerxxrqqvs8ha8'
              }
            ],
            description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Dolor aperiam impedit, inventore nesciunt ex expedita deleniti hic voluptate animi porro quo illum at amet nihil accusamus quidem et? Veritatis, corporis!",
            price: price,
            author: '652f9e90016da55e735fae3c'
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
})