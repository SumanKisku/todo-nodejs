const mongoose = require('mongoose');
const Schema = mongoose.Schema

const userSchema = new Schema({
  name: {
    type: String,
    require: true,
  },
  username: {
    type: String,
    require: true,
    unique: true,
  },
  email: {
    type: String,
    require: true,
    unique: true,
  },
  password: {
    type: String,
    require: true,
  },
  telephone: {
    type: String,
    require: false,
  },
},
  {strict: false}
)

const User = mongoose.model("user", userSchema);

module.exports = User;
