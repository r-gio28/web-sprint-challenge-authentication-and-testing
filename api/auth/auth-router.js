const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { BCRYPT_ROUNDS } = require('../../configs')
const secrets = require('../../configs/secret');
const User = require('./auth-model')
const { checkUserExists, validateBody } = require('./auth-middleware');


router.post('/register', checkUserExists, validateBody, async (req, res, next) => {
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.
    DO NOT EXCEED 2^8 ROUNDS OF HASHING!

    1- In order to register a new account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel", // must not exist already in the `users` table
        "password": "foobar"          // needs to be hashed before it's saved
      }

    2- On SUCCESSFUL registration,
      the response body should have `id`, `username` and `password`:
      {
        "id": 1,
        "username": "Captain Marvel",
        "password": "2a$08$jG.wIGR2S4hxuyWNcBf9MuoC4y0dNy7qC/LbmtuFBSdIhWks2LhpG"
      }

    3- On FAILED registration due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED registration due to the `username` being taken,
      the response body should include a string exactly as follows: "username taken".
  */
      try {
       const {username, password} = req.body
       
       const hash = bcrypt.hashSync(password, BCRYPT_ROUNDS)

       const user = {'username': username, 'password': hash}

       const NewUser = await User.add(user)
       res.status(201).json({
         'id': NewUser.id,
         'username': NewUser.username,
         'password': NewUser.password,
        })
      } catch (err) {
        next(err)
      }
});

router.post('/login', validateBody, async (req, res, next) => {
  /*
    IMPLEMENT
    You are welcome to build additional middlewares to help with the endpoint's functionality.

    1- In order to log into an existing account the client must provide `username` and `password`:
      {
        "username": "Captain Marvel",
        "password": "foobar"
      }

    2- On SUCCESSFUL login,
      the response body should have `message` and `token`:
      {
        "message": "welcome, Captain Marvel",
        "token": "eyJhbGciOiJIUzI ... ETC ... vUPjZYDSa46Nwz8"
      }

    3- On FAILED login due to `username` or `password` missing from the request body,
      the response body should include a string exactly as follows: "username and password required".

    4- On FAILED login due to `username` not existing in the db, or `password` being incorrect,
      the response body should include a string exactly as follows: "invalid credentials".
  */
     const {username, password} = req.body
     const newUser = await User.findBy({username})
     const user = newUser[0]
     if(user && bcrypt.compareSync(password, user.password)) {
       const token = generateToken(user)
       res.status(200).json({
         message: `welcome back, ${user.username}`,
         token: token
       })
     } else {
       next({
         status: 401,
         message: 'invalid credentials'
       })
     }
});

function generateToken(user) {
  const payload = {
    subject: user.id,
    username: user.username
  }
  const options = {
    expiresIn: '1d'
  }
  const secret = secrets.jwtSecret
  return jwt.sign(payload, secret, options)
}

module.exports = router;
