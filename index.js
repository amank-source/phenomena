// Use the dotenv package, to create environment variables

const express = require('express')
const apiRouter = require('./api')
const { client } = require('./db')
const bodyParser = require('body-parser')
var cors = require('cors')

const env = require('dotenv').config()
const PORT = process.env.port || 3000
const server = express()
const morgan = require('morgan')

server.use(morgan('dev'))

server.use(bodyParser.json())

// Create a constant variable, PORT, based on what's in process.env.PORT or fallback to 3000

// Import express, and create a server

// Require morgan and body-parser middleware

// Have the server use morgan with setting 'dev'

server.use(cors())

server.use('/api', apiRouter)

client.connect()

// Import cors
// Have the server use cors()

// Have the server use bodyParser.json()

// Have the server use your api router with prefix '/api'

// Import the client from your db/index.js

server.use(function (req, res, next) {
  if (res.status === '404') {
    res.status(404).send("Sorry can't find that!")
  } else if (res.status === '500') {
    res.status(500).send('sorry cant find that')
  }

  next()
})

// Create custom 404 handler that sets the status code to 404.

// Create custom error handling that sets the status code to 500
// and returns the error as an object
server.listen(PORT, () => {
  console.log('The server is up on port', PORT)
})

// Start the server listening on port PORT
// On success, connect to the database
