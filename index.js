const express = require("express");
const path = require("path");
  bodyParser = require("body-parser");
  morgan = require("morgan");
  uuid = require("uuid");

const app = express();

app.use(bodyParser.json());
app.use(morgan('common'));
app.use(express.static('public'));

let users = [
  {
    id: 1,
    name: "Ryan",
    favoriteMovies: []
  },

  {
    id: 2,
    name: "Pam",
    favoriteMovies: []
  },
]

let movies = [
  {
    "Title" : "Get Shorty",
    "Description" : "The story follows a Miami mobster who goes to LA to collect some outstanding debts, and in the process becomes a movie producer.",
    "Genre" : {
      "Name" : "Comedy",
      "Description" : "a genre of fiction that consists of discourses or works intended to be humorous or amusing by inducing laughter",
    },  
    "Director" : {
      "Name" : "Barry Sonnenfeld",
      "Bio" : "Barry Sonnenfeld is an American filmmaker and television director. He originally worked as a cinematographer for the Coen brothers before directing films such as The Addams Family and its sequel Addams Family Values, Get Shorty, the Men in Black trilogy, and Wild Wild West",
      "Birth" : "1953"
    },

  },
  

  {
    title: "Wall-E"
  },
  {
    title: "Dune"
  },
  {
    title: "The Batman"
  },
  {
    title: "Sherlock Holmes"
  },
  {
    title: "The Arrivals"
  },
  {
    title: "Odd Thomas"
  },
  {
    title: "Karate Kid"
  },
  {
    title: "Extraction"
  },
  {
    title: "John Wick"
  },
];

//Create
app.post('/users', (req, res) => {
  const newUser = req.body;

  if (newUser.name) {
    newUser.id = uuid.v4();
    users.push(newUser);
    res.status(201).json(newUser);
  } else {
      res.status(400).send('user needs name')
  }

});

//UPDATE

app.put('/users/:id', (req, res) => {
  
  const {id} = req.params;
  const updatedUser = req.body;

  let user = users.find( user => user.id == id);

  if(user) {
    user.name = updatedUser.name;
    res.status(200).json(user);
  } else {
    res.status(400).send('no such user')
  }

});

//CREATE

app.post('/users/:id/:movieTitle', (req, res) => {
  
  const {id, movieTitle} = req.params;

  let user = users.find( user => user.id == id);

  if(user) {
    user.favoriteMovies.push (movieTitle),
    res.status(200).send(`${movieTitle} has been added to ${id}'s array`);;
  } else {
    res.status(400).send('no such user')
  }

});

//DELETE

app.delete('/users/:id/:movieTitle', (req, res) => {
  
  const {id, movieTitle} = req.params;

  let user = users.find( user => user.id == id);

  if(user) {
    user.favoriteMovies = user.favoriteMovies.filter(title => title !== movieTitle );
    res.status(200).send(`${movieTitle} has been deleted from ${id}'s array`);
  } else {
    res.status(400).send('no such user')
  }

});

//DELETE

app.delete('/users/:id', (req, res) => {
  
  const {id} = req.params;

  let user = users.find( user => user.id == id);

  if(user) {
    users = users.filter(user => user.id != id );
    res.status(200).send(`user ${id} has been deleted`);
  } else {
    res.status(400).send('no such user')
  }

});

//Read
app.get('/movies', (req, res) => {
  res.status(200).json(movies);
});

//Read
app.get('/movies/:title', (req, res) => {
  const {title} = req.params;
  const movie = movies.find(movie => movie.title === title );

  if (movie) {
    res.status(200).json(movie);
  } else {
    res.status(400).send('No Movie Cuz')
  }
});

//Read
app.get('/movies/genre/:genreName', (req, res) => {
  const {genreName} = req.params;
  const genre = movies.find(movie => movie.Genre.Name === genreName ).Genre;

  if (genre) {
    res.status(200).json(genre);
  } else {
    res.status(400).send('I don\'t understand this Genre')
  }
});

//Read
app.get('/movies/directors/:directorName', (req, res) => {
  const {directorName} = req.params;
  const director = movies.find(movie => movie.Director.Name === directorName ).Director;

  if (director) {
    res.status(200).json(director);
  } else {
    res.status(400).send('Who dis director')
  }
});

app.get('/documentation.html', (req, res) => {
  res.sendFile(path.join(__dirname, "public", "documentation.html"));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.listen(8080, () => {
  console.log('Your app is listening on port 8080.');
});     
































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