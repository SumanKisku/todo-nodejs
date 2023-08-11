const express = require('express');
const clc = require('cli-color');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require('validator');
const session = require('express-session');
const mongoDbSession = require('connect-mongodb-session')(session);

//file-imports
const { cleanUpAndValidate } = require("./utils/AuthUtils.js");
const User = require('./models/userSchema.js');
const { isAuth } = require('./middleware/AuthMiddleware.js');

// variables
const app = express();

const PORT = process.env.PORT || 8000;
const MONGO_URI = "mongodb+srv://sumankisku:3W7UHNEPfMejGlTi@cluster0.7nxa6go.mongodb.net/todo-app";
const saltRound = 11;

// db connection
mongoose.connect(MONGO_URI).then(() => {
  console.log(clc.green.bold.underline("MongoDB connected"));
}).catch((err) => {
    console.log(clc.red.bold(err));
  });

const store = new mongoDbSession({
  uri: MONGO_URI, // mongodb databaser url
  collection: "sessions", // collection name
})

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: "This is todo app, we love coding",
  resave: false,
  saveUninitialized: false,
  store: store,
}))
// setting the view engine
app.set("view engine", "ejs");

// routes
app.get('/', (req, res) => {
  return res.send("This is your todo app");
})

app.get('/login', (req, res) => {
  return res.render("login");
})

app.get('/register', (req, res) => {
  return res.render("register");
})

// register
app.post('/register', async (req, res) => {
  const {name, email, username, password} = req.body;
  try {
    await cleanUpAndValidate(req.body);

    // check if the user exists

    const userExistsEmail = await User.findOne({ email });
    if(userExistsEmail) {
      return res.send({
        status: 403,
        message: "Email already being used."
      })
    }
    const userExistsUsername = await User.findOne({ username });
    if(userExistsUsername) {
      return res.send({
        status: 403,
        message: "Username already being used."
      })
    }

    // hash the password using bcrypt
    const hashPassword = await bcrypt.hash(password, saltRound);

    const user = new User({
      name: name,
      email: email,
      username: username,
      password: hashPassword,
    })


    try{
      const userDb = await user.save();
      return res.send({
        status: 201,
        message: "User registerd successfully",
        data: userDb
      })
    } catch(error) {
      return res.send({
        status: 500,
        message: "Database error",
        data: error
      })
    }
    return res.send("All good");
  } catch(error) {
    return res.send({
      stauts: 400,
      message: "Failed",
      error: error,
    })
  }
})

// login
app.post('/login', async (req, res) => {
  // validate data
  // what is log in Id(email or username)
  // find the user with loginId
  // password compare bcrypt.compare
  // is everything works fine, then user is login
  const { emailOrUsername, password} = req.body;
  if(!emailOrUsername || !password ) {
    return res.send({
      status: 400,
      message: "missing eredentials",
    })
  }
  if(typeof emailOrUsername !== 'string' || typeof password !== 'string') {
    return res.send({
      status: 400,
      message: "Invalid data format",
    })
  }
  try{
    let userDb;
    // if emailOrUsername is email then do this
    if(validator.isEmail(emailOrUsername)) {
      userDb = await User.findOne({ email: emailOrUsername});
    } else {
      userDb = await User.findOne({ username: emailOrUsername});
    } 
    if(!userDb) {
      return res.send({
        status: 404,
        message: "User not found, try a valid email and username",
      });
    }

    const match = await bcrypt.compare(password, userDb.password);
    if(!match) {
      return res.send({
        status: 400,
        message: "Password does not match",
      })
    }

    // Add session based auth sys
    req.session.isAuth = true;
    req.session.user = {
      username: userDb.username,
      email: userDb.email,
      userId: userDb._id,
    }

    return res.redirect('/dashboard');
  } catch(error) {
    return res.send({
      status: 500,
      message: "database error",
      error: error,
    })
  }
});   

app.get('/dashboard', isAuth, (req, res) => {
  return res.render("dashboard");
})

// logout api
app.post('/logout', isAuth, (req, res) => {
  req.session.destroy((err) => {
    if(err) throw err;

    return res.redirect('/login');
  })
})

// logout all
app.post('/logout_from_all_devices', isAuth, async (req, res) => {
  const username = req.session.user.username;
  // create a session schema 
  const sessionSchema = new mongoose.Schema({ _id: String}, { strict: false});
  const sessionModel = mongoose.model("session", sessionSchema);

  try{
    const deletionCount = await sessionModel.deleteMany({
      //key: values
      "session.user.username": username,

    })
    return res.send({
      status: 200,
      message: "Logout from all devices successfully",
    });
  } catch(error) {
    return res.send({
      status: 500,
      message: "Logout failed",
      error: error,
    })
  }
})

app.listen(PORT, ()=> {
  console.log(clc.blue.bold("Server is running on"), clc.blue.bold.underline(`http://localhost:${PORT}`));
})


// create server and mongodb-connection
// // registration page
// register.ejs
// register a user in DB
//
// login page 
// dashboard
// logout
// logout from all devices
// Todos
// create a schema for todo
// create a todo
// edit a todo
// delete a todo

// Broser.js
// axios
// read, edit and delete call from axios(client-side)


// pagination
// rate-limiting
// deploy
