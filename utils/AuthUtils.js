const validator = require("validator");

const cleanUpAndValidate = ({name, email, password, username}) => {
  return new Promise((resolve, reject) => {
    if(!name || !email || !username || !password) {
      reject("Missing credentials");
    }
    if(typeof email !== 'string') {
      reject("Invalid email");
    }
    if(typeof username !== 'string') {
      reject("Invalid username");
    }
    if(typeof password !== 'string') {
      reject("Invalid password");
    }
    if(username.length <= 2 || username.length > 50) {
      reject("Username length should be 3-50");
    }
    if(password.length <= 2 || password.length > 25) {
      reject("password length should be 3 to 25");
    }
    if(!validator.isEmail(email)) {
      reject("Invalid email format");
    }
    resolve("good");
  })
}
module.exports = {cleanUpAndValidate}
