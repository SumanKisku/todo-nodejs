const express = require('express');
const clc = require('cli-color');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validator = require("validator");

//file-imports
const { cleanUpAndValidate } = require("./utils/AuthUtils.js");
const User = require('./models/userSchema.js');

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

// middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

app.post('/register', async (req, res) => {
  console.log(req.body);
  const {name, email, username, password} = req.body;
  try {
    await cleanUpAndValidate(req.body);

    // check if the user exists

    const userExistsEmail = await User.findOne({ email });
    if(userExistsEmail) {
      console.log(userExistsEmail);
      return res.send({
        status: 403,
        message: "Email already being used."
      })
    }
    const userExistsUsername = await User.findOne({ username });
    if(userExistsUsername) {
      console.log(userExistsUsername);
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
      console.log(userDb);
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

      console.log(error);
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
  console.log(req.body);
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

  let userDb;
  // if emailOrUsername is email then do this
  if(validator.isEmail(emailOrUsername)) {
    console.log("emailOrUsername is email");
    try {
      userDb = await User.findOne({ email: emailOrUsername});
      console.log(userDb);
      if(!userDb) {
        return res.send({
          status: 404,
          message: "User not found, try a valid email and username",
        });
      }
    } catch(error) {
      return res.json({
        error: error
      })
    }
    if(!userDb) {
      return res.send({
        status: 400,
        message: "User not found, Please register first",
      })
    }

    // password compare with bcrypt
    const match = await bcrypt.compare(password, userDb.password);
    if(!match) {
      return res.send({
        status: 400,
        message: "Password does not match",
      })
    }
  } else {
    console.log("emailOrUsername is username");
    // if emailOrUsername is username then do this user
    try {
      userDb = await User.findOne({ username: emailOrUsername});
      console.log(userDb);
      if(!userDb) {
        return res.send({
          status: 404,
          message: "User not found, try a valid email and username",
        });
      }
    } catch(error) {
      return res.json({
        error: error
      })
    }
    if(!userDb) {
      return res.send({
        status: 400,
        message: "User not found, Please register first",
      })
    }

    // password compare with bcrypt
    const match = await bcrypt.compare(password, userDb.password);
    if(!match) {
      return res.send({
        status: 400,
        message: "Password does not match"
      })
    }
  }

  return res.json(userDb);
})

// MVC - Models View Controler

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
