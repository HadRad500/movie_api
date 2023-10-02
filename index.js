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

    let hashedPassword = Users.hashPassword(req.body.Password);
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
app.get('/users/:Username', async (req, res) => {
  await Users.findOne({ Username: req.params.Username })
    .then((user) => {
      res.json(user);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
});

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
    await Users.findOneAndUpdate({ Username: req.params.Username },
      {
        $set:
        {
          Username: req.body.Username,
          Password: req.body.Password,
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

//Read
app.get('/movies', passport.authenticate('jwt', { session: false }), (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(201).json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send("Error: " + err);
    });
});

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






















/*
const http = require('http'),
url = require('url'),
fs = require('fs');

http.createServer((request, response) => {
  let addr = request.url;
  let q = url.parse(addr, true);
  filepath = ''

  fs.appendFile('log.txt', 'URL: ' + addr + '\nTimestamp: ' + new Date() + '\n\n', (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log('Added to log.');
    }
  });

  if (q.pathname.includes('documentation')) {
    filePath = (__dirname + '/documentation.html');
  } else {
    filePath = 'index.html';
  }

  response.writeHead(200, {'Content-Type': 'text/plain'});
  response.end('Hello Node!\n');
}).listen(8080);

console.log('My first Node test server is running on Port 8080.');*/