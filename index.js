require('dotenv').config();
const express = require("express");
const path = require("path"),
  morgan = require("morgan"),
  uuid = require("uuid");
const mongoose = require('mongoose');
const Models = require('./model.js');


const Movies = Models.Movie;
const Users = Models.User;

const app = express();

const cors = require('cors');
app.use(cors());

let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

const { check, validationResult } = require('express-validator');

app.use(express.json());
app.use(morgan('common'));
app.use(express.static('public'));
console.log(process.env)
//mongoose.connect('mongodb://localhost:27017/myFlixDB', { useNewUrlParser: true, useUnifiedTopology: true });
mongoose.connect(process.env.CONNECTION_URI, { useNewUrlParser: true, useUnifiedTopology: true });


let users = [
  {
    Username: "cm500",
    Password: "1234",
    Email: "hottomato@yahoo.com",
    Birthday: new Date("1994-01-17"),
  },

  {
    Username: "HadRad",
    Password: "12345",
    Email: "hotmop@yahoo.com",
    Birthday: new Date("1991-05-11"),
  },

  {
    Username: "BigBaz74",
    Password: "123456",
    Email: "hotlemon@yahoo.com",
    Birthday: new Date("1997-03-18"),
  },

  {
    "Username": "Arcane90",
    "Password": "1234567",
    "Email": "hotpopcorn@yahoo.com",
    Birthday: new Date("1990-09-27"),
  },

  {
    "Username": "huevos77",
    "Password": "12345678",
    "Email": "hotcotton@yahoo.com",
    Birthday: new Date("1989-10-23"),
  }
]

let movies = [

  {
    Title: "Get Shorty",
    Description: "The story follows a Miami mobster who goes to LA to collect some outstanding debts, and in the process becomes a movie producer.",
    Genre: {
      Name: "Comedy",
      Description: "a genre of fiction that consists of discourses or works intended to be humorous or amusing by inducing laughter",
    },
    Director: {
      Name: "Barry Sonnenfeld",
      Bio: "Barry Sonnenfeld is an American filmmaker and television director. He originally worked as a cinematographer for the Coen brothers before directing films such as The Addams Family and its sequel Addams Family Values, Get Shorty, the Men in Black trilogy, and Wild Wild West",
      Birth: "1953"
    },

  },

  {
    Title: "Wall-E",
    Description: "WALL-E, short for Waste Allocation Load Lifter Earth-class, is the last robot left on Earth. He spends his days tidying up the planet, one piece of garbage at a time.",
    Genre: {
      "Name": "Animated",
      "Description": "a genre of Animation is a method in which pictures are manipulated to appear as moving images.",
    },
    "Director": {
      "Name": "Andrew Stanton",
      "Bio": "Andrew Stanton is an American filmmaker and voice actor based at Pixar, which he joined in 1990",
      "Birth": "1965"
    },
  },

  {
    "Title": "Dune",
    "Description": "Paul Atreides, a brilliant and gifted young man born into a great destiny beyond his understanding, must travel to the most dangerous planet in the universe to ensure the future of his family and his people.",
    "Genre": {
      "Name": "Science Fiction",
      "Description": "is a genre of speculative fiction, which typically deals with imaginative and futuristic concepts such as advanced science and technology, space exploration, time travel, parallel universes, and extraterrestrial life.",
    },
    "Director": {
      "Name": "Denis Villeneuve",
      "Bio": "Denis Villeneuve OC CQ RCA is a Canadian filmmaker. He is a four-time recipient of the Canadian Screen Award for Best Direction, winning for Maelström in 2001, Polytechnique in 2009, Incendies in 2010 and Enemy in 2013.",
      "Birth": "1967"
    },
    "ImagePath": "Dune.png",
    "Featured": "True",
  },

  {
    "Title": "The Batman",
    "Description": "Batman ventures into Gotham City's underworld when a sadistic killer leaves behind a trail of cryptic clues.",
    "Genre": {
      "Name": "Action",
      "Description": "is a genre in which the protagonist is thrust into a series of events that typically involve violence and physical feats",
    },
    "Director": {
      "Name": "Matt Reeves",
      "Bio": "Matt Reeves is an American filmmaker who first gained recognition for the WB drama series Felicity, which he co-created with J. J. Abrams. Reeves came to widespread attention for directing the hit monster film Cloverfield.",
      "Birth": "1966"
    },
    "ImagePath": "Batman.png",
    "Featured": "False",
  },

  {
    "Title": "Sherlock Holmes",
    "Description": "When a string of brutal murders terrorizes London, it doesn't take long for legendary detective Sherlock Holmes and his crime-solving partner, Dr. Watson, to find the killer, Lord Blackwood.",
    "Genre": {
      "Name": "Mystery",
      "Description": "is a genre where the nature of an event, usually a murder or other crime, remains mysterious until the end of the story.",
    },
    "Director": {
      "Name": "Guy Ritchie",
      "Bio": "Guy Stuart Ritchie is an English film director, producer and screenwriter. His work includes British gangster films, and the Sherlock Holmes films starring Robert Downey Jr. Ritchie left school at age 15 and worked entry-level jobs in the film industry before going on to direct television commercials.",
      "Birth": "1968"
    },
    "ImagePath": "Sherlock.png",
    "Featured": "True",
  },

  {
    "Title": "The Arrivals",
    "Description": "Linguistics professor Louise Banks leads an elite team of investigators when gigantic spaceships touch down in 12 locations around the world. As nations teeter on the verge of global war, Banks and her crew must race against time to find a way to communicate with the extraterrestrial.",
    "Genre": {
      "Name": "Science Fiction",
      "Description": "is a genre of speculative fiction, which typically deals with imaginative and futuristic concepts such as advanced science and technology, space exploration, time travel, parallel universes, and extraterrestrial life.",
    },
    "Director": {
      "Name": "Denis Villeneuve",
      "Bio": "Denis Villeneuve OC CQ RCA is a Canadian filmmaker. He is a four-time recipient of the Canadian Screen Award for Best Direction, winning for Maelström in 2001, Polytechnique in 2009, Incendies in 2010 and Enemy in 2013.",
      "Birth": "1967",
      "ImagePath": "Arrivals.png",
      "Featured": "True"
    },
  },

  {
    "Title": "Odd Thomas",
    "Description": "A clairvoyant cook joins forces with his sweetheart and the town sheriff to prevent an unknown catastrophe that may be linked to a weird stranger.",
    "Genre": {
      "Name": "Mystery",
      "Description": "is a genre where the nature of an event, usually a murder or other crime, remains mysterious until the end of the story.",
    },
    "Director": {
      "Name": "Stephen Sommers",
      "Bio": "Stephen Sommers is an American filmmaker, best known for big-budget action movies, such as The Mummy, its sequel, The Mummy Returns, Van Helsing, and G.I. Joe: The Rise of Cobra.",
      "Birth": "1962"
    },
    "ImagePath": "oddThomas.png",
    "Featured": "True",
  },

  {
    "Title": "Karate Kid",
    "Description": "Daniel moves to Southern California with his mother, Lucille, but quickly finds himself the target of a group of bullies who study karate at the Cobra Kai dojo. Fortunately, Daniel befriends Mr. Miyagi, an unassuming repairman who just happens to be a martial arts master himself. Miyagi takes Daniel under his wing, training him in a more compassionate form of karate and preparing him to compete against the brutal Cobra Kai.",
    "Genre": {
      "Name": "Action",
      "Description": "is a genre in which the protagonist is thrust into a series of events that typically involve violence and physical feats",
    },
    "Director": {
      "Name": "John Avildsen",
      "Bio": "John Guilbert Avildsen was an American film director. He is best known for directing Rocky, which earned him the Academy Award for Best Director. He is also renowned for directing the first three films in The Karate Kid franchise.",
      "Birth": "1935"
    },
    "ImagePath": "karateKid.png",
    "Featured": "False",
  },

  {
    "Title": "Extraction",
    "Description": "A black-market mercenary who has nothing to lose is hired to rescue the kidnapped son of an imprisoned international crime lord.",
    "Genre": {
      "Name": "Action",
      "Description": "is a genre in which the protagonist is thrust into a series of events that typically involve violence and physical feats",
    },
    "Director": {
      "Name": "Sam Hargrave",
      "Bio": "Sam Hargrave is an American stunt coordinator, stuntman, actor, and director. He is best known for his collaborations with the Russo brothers, including being the stunt coordinator for several films in the Marvel Cinematic Universe. The pair also wrote and produced Hargrave's directorial debut, Extraction.",
      "Birth": "1984"
    },
    "ImagePath": "Extraction.png",
    "Featured": "True",
  },

  {
    "Title": "The Man from UNCLE",
    "Description": "At the height of the Cold War, a mysterious criminal organization plans to use nuclear weapons and technology to upset the fragile balance of power between the United States and Soviet Union. CIA agent Napoleon Solo and KGB agent Illya Kuryakin are forced to put aside their hostilities and work together to stop the evildoers in their tracks.",
    "Genre": {
      "Name": "Action",
      "Description": "is a genre in which the protagonist is thrust into a series of events that typically involve violence and physical feats.",
    },
    "Director": {
      "Name": "Guy Ritchie",
      "Bio": "Guy Stuart Ritchie is an English film director, producer and screenwriter. His work includes British gangster films, and the Sherlock Holmes films starring Robert Downey Jr. Ritchie left school at age 15 and worked entry-level jobs in the film industry before going on to direct television commercials.",
      "Birth": "1968"
    },
    "ImagePath": "Uncle.png",
    "Featured": "False"
  }
];

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
app.get('/movies', (req, res) => {
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