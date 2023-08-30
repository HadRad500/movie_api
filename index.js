const express = require("express");
const path = require("path");
  morgan = require("morgan");

const app = express();

let topMovies = [
  {
    title: "Get Shorty"
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

app.use(morgan('common'));
app.use(express.static('public'));


app.get('/movies', (req, res) => {
  res.json(topMovies);
});

app.get('/', (req, res) => {                  
  res.send('Welcome to my favorite movie list!') //{ root: __dirname });
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