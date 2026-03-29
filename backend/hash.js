const bcrypt = require("bcrypt");

const password = "123456"; // your password

bcrypt.hash(password, 10).then(hash => {
  console.log("Hashed password:", hash);
});