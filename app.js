if(process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const session = require('express-session');
const ExpressError = require('./utils/ExpressError');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize'); //for mongo-injection
const helmet = require('helmet');
const MongoStore = require('connect-mongo');

// const dbUrl = process.env.DB_URL;
const dbUrl = process.env.DB_URL || "mongodb://127.0.0.1:27017/yelp-camp";

const campgroundRoutes = require('./routes/campgroundRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const userRoutes = require('./routes/userRoutes');

mongoose.set('strictQuery', true); 
main();
async function main() {
  try {
    //'mongodb://127.0.0.1:27017/yelp-camp'
    await mongoose.connect(dbUrl);
    console.log('Connected to the mongo database successfully');
    
    // Continue with your application logic here
  } catch (err) {
    console.log("oh no mongo error")
    console.error('Error connecting to the database:', err);
  }
}


app.engine("ejs", ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(mongoSanitize());
 
const secret = process.env.SECRET || 'thisshouldbeabettersecret!'

//to store session
const store = MongoStore.create({
  mongoUrl: dbUrl,
  touchAfter: 24 * 60 * 60,
  crypto: {
      secret: secret
  }
});

store.on("error", function(e) {
  console.log("SESSION STORE ERROR", e);
})

//setting up session
const sessionConfig = {
  store,
  name: 'session', //explicit name foer sessionid
  secret: secret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    //expiration so that user doesnt get logged in forever
    expires: Date.now() + 1000 * 60 *60 * 24 * 7,   //expiration date of cookie is set to one week(date is in milliseconds so add one week in ms)
    maxAge: 1000 * 60 *60 * 24 * 7,
    HttpOnly: true, //extra security so client cant change scripts
    secure: true //use only when deployed as it works for https

  }
}

app.use(session(sessionConfig))
app.use(flash());


app.use(passport.initialize());  
app.use(passport.session()); //session should be used before passport.session
passport.use(new LocalStrategy(User.authenticate()));

//static method to store and de-store a user in the session
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//middleware to implement flash so that whenever there is a success or error message this runs
app.use((req, res, next) => {
  //res.locals is like global data hence accessible anywhere 
  res.locals.currentUser = req.user; //by password.js
  //in all templates currentUser will be accessible 

  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
})


// app.get('/fakeuser', async (req, res) => {
//   const user = new User({email:'t123@gmail.com', username:'Tushar'})
//   const newUser = await User.register(user, 'chicken');
//   res.send(newUser);
// })

app.get("/", (req, res) => {
  res.render("home");
});

app.use('/campgrounds', campgroundRoutes);  //to use router (breaking routes for different models)  
//every campground route will start from /campgrounds
app.use('/campgrounds/:id/reviews', reviewRoutes); //similarlly
app.use('/', userRoutes);


app.all("*", (req, res, next) => {
  next(new ExpressError('Page not found', 404));
})

app.use((err, req, res, next) => {
  const {status = 500} = err;
  if(!err.message) err.message = "Oh no, something went wrong!!";
  res.status(status).render("error", {err});
})

app.listen(process.env.PORT || 3000, () => {
    console.log("Server is running on port 3000");
})