require('dotenv').config();
const express = require("express");
const path = require("path"),
  morgan = require("morgan"),
  uuid = require("uuid");
const mongoose = require('mongoose');
const Models = require('./model.js');
const passport = require('passport');


const Movies = Models.Movie;
const Users = Models.User;

const app = express();

const cors = require('cors');
app.use(cors());
const { check, validationResult } = require('express-validator');

app.use(express.json());
app.use(morgan('common'));
app.use(express.static('public'));
console.log(process.env)
//mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });
app.use(cors());

let auth = require('./auth')(app);
require('./passport');


app.get("/", (request, response) => {
  let responseText = "See you Space Cowboy...";
  response.send(responseText);
});

/**
 * Allow new users to register.
 * 
 * @function
 * @param {Object} request - Express request object.
 * @param {Object} response = Express response object.
 * @returns {Object} - List of movies in JSON format.
 * @throws {Object} - Error object if there's an issue with the request.
 * @example
 *  // Request
 * POST /users
 * //Body: { username: 'newuser', password: 'password123', email: 'newuser@yahoo.com}
 * 
 * // Response (example)
 * [
 * {
 * _id: '123',
 * username: 'user12345',
 * email: 'userdeez@yahoo.com'
 * }
 * ]
 */

//Create

app.post('/users',
  [
    check('Username', 'Username contains non-alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
  ], async (req, res) => {

    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    const hashedPassword = Users.hashPassword(req.body.Password);
    await Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          return res.status(400).send(req.body.Username + 'already exists');
        } else {
          Users
            .create({
              Username: req.body.Username,
              Password: hashedPassword,
              Email: req.body.Email,
              Birthday: req.body.Birthday
            })
            .then((user) => { res.status(201).json(user) })
            .catch((error) => {
              console.error(error);
              res.status(500).send('Error: ' + error);
            })
        }
      })
      .catch((error) => {
        console.error(error);
        res.status(500).send('Error: ' + error);
      });
  });

//UPDATE

/*app.put('/users/:id', (req, res) => {
  
  const {id} = req.params;
  const updatedUser = req.body;

  let user = users.find( user => user.id == id);

  if(user) {
    user.name = updatedUser.name;
    res.status(200).json(user);
  } else {
    res.status(400).send('no such user')
  }

});*/

//CREATE

app.post('/users/:id/:movieTitle', (req, res) => {

  const { id, movieTitle } = req.params;

  let user = users.find(user => user.id == id);

  if (user) {
    user.favoriteMovies.push(movieTitle),
      res.status(200).send(`${movieTitle} has been added to ${id}'s array`);;
  } else {
    res.status(400).send('no such user')
  }

});

//DELETE

app.delete('/users/:id/:movieTitle', (req, res) => {

  const { id, movieTitle } = req.params;

  let user = users.find(user => user.id == id);

  if (user) {
    user.favoriteMovies = user.favoriteMovies.filter(title => title !== movieTitle);
    res.status(200).send(`${movieTitle} has been deleted from ${id}'s array`);
  } else {
    res.status(400).send('no such user')
  }

});

//DELETE

/*app.delete('/users/:id', (req, res) => {
  
  const {id} = req.params;

  let user = users.find( user => user.id == id);

  if(user) {
    users = users.filter(user => user.id != id );
    res.status(200).send(`user ${id} has been deleted`);
  } else {
    res.status(400).send('no such user')
  }

});*/

/**
 * Delete a user by username
 * 
 * @function
 * @param {Object} request - Express request object.
 * @param {Object} response = Express response object.
 * @returns {Object} - List of movies in JSON format.
 * @throws {Object} - Error object if there's an issue with the request.
 * @example
 *  // Request
 * DELETE /users/:username/
 * 
 * // Response (example)
 * "user {removedUser} was deleted"
 */

//Delete by Username
app.delete('/users/:Username', async (req, res) => {
  await Users.findOneAndRemove({ Username: req.params.Username })
    .then((user) => {
      if (!user) {
        res.status(400).send(req.params.Username + ' was not found');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * Gets all Users.
 * 
 * @function
 * @param {Object} request - Express request object.
 * @param {Object} response = Express response object.
 * @returns {Object} - List of movies in JSON format.
 * @throws {Object} - Error object if there's an issue with the request.
 * @example
 *  // Request
 * GET /users
 * 
 * // Response (example)
 * [
 * {
 * _id: '123',
 * username: 'user12345',
 * email: 'userdeez@yahoo.com'
 * }
 * ]
 */

//Read
app.get('/users', async (req, res) => {
  await Users.find()
    .then((users) => {
      res.status(201).json(users);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

//Read by Username
app.get('/users/:Username', passport.authenticate('jwt', { session: false }), (req, res) => {
  //Users.findOne({ Username: req.params.Username })
  Users.findById(req.user._id)
    .populate("FavoriteMovies")
    .then((user) => {
      if (!user) {
        return res.status(404).json({})
      }

      return res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(400).send('Error: ' + err);
    });

  // try{
  //   const user = await Users.findOne({ Username: req.params.Username })
  //  res.json(user);
  // }catch(err){
  //   console.error(err);
  //   res.status(500).send('Error: ' + err);
  // }
});

/**
 * Update user details.
 * 
 * @function
 * @param {Object} request - Express request object.
 * @param {Object} response = Express response object.
 * @returns {Object} - List of movies in JSON format.
 * @throws {Object} - Error object if there's an issue with the request.
 * @example
 *  // Request
 * PUT /users/:username
 * //Body: { username: 'newuser', password: 'password123', email: 'newuser@yahoo.com}
 * 
 * // Response (example)
 * [
 * {
 * _id: '123',
 * username: 'user12345',
 * email: 'userdeez@yahoo.com'
 * }
 * ]
 */

//Update Username
app.put('/users/:Username',
  [
    check('Username', 'Username contains non-alphanumeric characters - not allowed.').isAlphanumeric(),
    check('Password', 'Password is required').not().isEmpty(),
  ],
  passport.authenticate('jwt', { session: false }),
  async (req, res) => {
    //Condition to Check
    if (req.user.Username !== req.params.Username) {
      return res.status(400).send('Permission Denied');
    }
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }

    //Condition Ends
    Users.findOneAndUpdate({ Username: req.params.Username },
      {
        $set:
        {
          Username: req.body.Username,
          Password: Users.hashPassword(req.body.Password),
          Email: req.body.Email,
          Birthday: req.body.Birthday
        }
      },
      { new: true }) // This line makes sure that the updated document is returned
      .then((updatedUser) => {
        res.json(updatedUser);
      })
      .catch((err) => {
        console.error(err);
        res.status(500).send('Error: ' + err);
      })

  });

/**
* Add a favorite movie to the users list.
* 
* @function
* @param {Object} request - Express request object.
* @param {Object} response = Express response object.
* @returns {Object} - List of movies in JSON format.
* @throws {Object} - Error object if there's an issue with the request.
* @example
*  // Request
* POST /users/:username/movies/:movieID
* 
* // Response (example)
* [
* {
* _id: '123',
* username: 'user12345',
* favoriteMovies: ['movieID1, ....']
* }
* ]
*/

//Create a movie to favoritemovies
app.post('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username }, {
    $push: { FavoriteMovies: req.params.MovieID }
  },
    { new: true }) // This line makes sure that the updated document is returned
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * Delete a fav movie from the user's list..
 * 
 * @function
 * @param {Object} request - Express request object.
 * @param {Object} response = Express response object.
 * @returns {Object} - List of movies in JSON format.
 * @throws {Object} - Error object if there's an issue with the request.
 * @example
 *  // Request
 * Delete /users/:useranem/movies/:movieID
 * 
 * // Response (example)
 * [
 * {
 * _id: '123',
 * username: 'user12345',
 * favoriteMovies: ['movieID1, ....']
 * }
 * ]
 */

//Delete a movie to favoritemovies
app.delete('/users/:Username/movies/:MovieID', passport.authenticate('jwt', { session: false }), async (req, res) => {
  await Users.findOneAndUpdate({ Username: req.params.Username }, {
    $pull: { FavoriteMovies: req.params.MovieID }
  },
    { new: true }) // This line makes sure that the updated document is returned
    .then((updatedUser) => {
      res.json(updatedUser);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * Gets a list of all movies.
 * 
 * @function
 * @param {Object} request - Express request object.
 * @param {Object} response = Express response object.
 * @returns {Object} - List of movies in JSON format.
 * @throws {Object} - Error object if there's an issue with the request.
 * @example
 *  // Request
 * GET /movies
 * 
 * // Response (example)
 * [
 * {
 * _id: '123',
 * title: 'Movie Title',
 * genre: {
 * name: 'General',
 * description: 'desciption here'},
 * director: {
 * name: 'Name',
 * bio: 'Biography Here',
 * birth: Date,
 * },
 * imagepath: 'imagepath',
 * featured: true, //boolean},
 * ]
 */

//Read
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(200).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

/**
 * Gets info on one movie by title.
 * 
 * @function
 * @param {Object} request - Express request object.
 * @param {Object} response = Express response object.
 * @returns {Object} - List of movies in JSON format.
 * @throws {Object} - Error object if there's an issue with the request.
 * @example
 *  // Request
 * GET /movies/:movieTitle
 * 
 * // Response (example)
 * {
 * {
 * _id: '123',
 * title: 'The Movie Title',
 * genre: {
 * name: 'General',
 * description: 'desciption here'},
 * director: {
 * name: 'Name',
 * bio: 'Biography Here',
 * birth: Date,
 * },
 * imagepath: 'imagepath',
 * featured: true, // or false},
 * }
 */

//Read
app.get('/movies/:Title', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ Title: req.params.Title })
    .then((movie) => {
      res.json(movie);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

/**
 * Gets info on movies by genre.
 * 
 * @function
 * @param {Object} request - Express request object.
 * @param {Object} response = Express response object.
 * @returns {Object} - List of movies in JSON format.
 * @throws {Object} - Error object if there's an issue with the request.
 * @example
 *  // Request
 * GET /movies/genre
 * 
 * // Response (example)
 * {
 * genre: {
 * name: 'General',
 * description: 'Genre desciption here'},
 * }
 */

//Read
app.get('/genre/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ 'Genre.Name': req.params.Name })
    .then((movie) => {
      if (!movie) {
        res.status(404).send(req.params.Name + ' Genre Does not exist');
      } else {
        res.json(movie.Genre.Description);
      }
    })

    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });

});

/**
 * Gets info on director by name.
 * 
 * @function
 * @param {Object} request - Express request object.
 * @param {Object} response = Express response object.
 * @returns {Object} - List of movies in JSON format.
 * @throws {Object} - Error object if there's an issue with the request.
 * @example
 *  // Request
 * GET /movies/director/David
 * 
 * // Response (example)
 * {
 * _id: '123',
 * director: {
 * name: 'Name',
 * bio: 'Biography Here',
 * birth: Date,
 * }
 */

//Read
app.get('/director/:Name', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.findOne({ 'Director.Name': req.params.Name })
    .then((movie) => {
      if (!movie) {
        res.status(404).send(req.params.Name + ' Director does not exist');
      } else {
        res.json(movie.Director);
      }
    })

    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });

});

app.get('/documentation.html', (req, res) => {
  res.sendFile(path.join(__dirname, "public", "documentation.html"));
});

/**
 * Error handling middleware function.
 * 
 * @name ErrorHandleMiddleware
 * @function
 * @param {Object} err - Error object.
 * @param {Object} req = Express response object.
 * @param {Object} res = Express response object.
 * @param {Function} next = Express next function.
 * @returns {Object} - Response with a status code of 500 and an error message.
 * @example
 *  // Implementation:
 * app.use((err, req, res, next) => {
 * console.error(err.stack);
 * res.status(500).send("something broke");
 * });
 */

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port' + port);
});



//mongoimport --uri mongodb+srv://hadignasr:hTEEZAS1998@the-cluster.3skg7ti.mongodb.net/myFlixDB --collection users --type json --file ./dbexport/users.json


//mongodb+srv://hadignasr:hTEEZAS1998@the-cluster.3skg7ti.mongodb.net/?retryWrites=true&w=majority&appName=AtlasApp


//mongoexport --host="localhost:27017" --collection=users --db=myFlixDB --out=./dbexport/users.json
