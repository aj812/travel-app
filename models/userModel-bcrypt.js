const db = require('../config/connection');
const bcrypt = require('bcrypt');
const saltRounds = 10;

// Take an email and password; hash the password and try to create a new user
function register(credentials) {
  console.log(credentials)
  return bcrypt.hash(credentials.hashpassword, saltRounds)
    .then(hash => {
      const newUser = {
        name: credentials.name,
        email: credentials.email,
        hashpassword: hash
      };
      return db.one(`
        INSERT INTO users (name, email, hashpassword)
        VALUES ($/name/, $/email/, $/hashpassword/)
        RETURNING *
      `, newUser)
    });
}

function findByEmail(email) {
  return db.one(`
    SELECT * FROM users
    WHERE email = $1
  `, email);
}

function login(credentials) {
  return findByEmail(credentials.email)
    .then(user => (
      // compare the provided password with the password digest
      bcrypt.compare(credentials.hashpassword, user.hashpassword)
        // match is a boolean if hashing the provided password
        // matches the hashed password
        .then(match => {
          if (!match) throw new Error('Credentials do not match');
          delete user.hashpassword;
          return user;
        })
    ));
}

module.exports = {
  register,
  findByEmail,
  login
}
