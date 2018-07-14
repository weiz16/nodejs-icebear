const path = require('path');
const app = require('express')();
const express = require('express');
/**
 * Get port from environment and store in Express.
 */
var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);



var bodyParser = require('body-parser');
var session = require("express-session");

var jwt = require('jsonwebtoken');


const db = require('./database')();
const emailManager = require('./emailer')();

const helper = require('./helper')();
const passport = require('passport');
var pt = require('./passport')(passport);



var api = require('./routes/api');


var gmail = require('./gmail')();
const cors = require('cors');

gmail.start();

/**
 * Create HTTP server and socket io server.
 */

var http = require('http').Server(app);
const orderSocket = require('./socket')(http);



/**
 * Listen on provided port, on all network interfaces.
 */

http.listen(port);
http.on('error', onError);
http.on('listening', onListening);



app.use(require('morgan')('combined'));
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(passport.initialize());
app.use(cors());
app.use('/api', api);
let order_api = require('./routes/order.api')(api, db.con, orderSocket);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}


/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = http.address();
  var bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  console.log('Ice bear at port ' + bind);
}





module.exports = { app, orderSocket };