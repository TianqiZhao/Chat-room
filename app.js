var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sassMiddleware = require('node-sass-middleware');
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var session = require('express-session');
var connectMongo = require('connect-mongo')(session);
//var nodemon = require('nodemon');
var swig = require('swig');
//var swig = new swig.Swig();
//var socketEvents = require('./socketEvents'),


var index = require('./routes/index');
var users = require('./routes/users');

var app = express();
var http = require("http");
var server = http.createServer(app);
var io = require('socket.io').listen(server);

io.sockets.on('connection', function (socket) {
  socket.on('say', function (data) {
      io.sockets.emit('say', data);
  });
});

//connect to MongoDB
mongoose.connect('mongodb://localhost:27017/chatroom',{useMongoClient:true});
// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;
var db = mongoose.connection;

//handle mongo error
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', function () {
  console.log("Connect to database successfully!");
});

app.use(session({
  secret: 'chat room',
  resave: true,
  saveUninitialized: false,
  store: new connectMongo({
    mongooseConnection: db
  })
}));

//Server's IP address
app.set("ipaddr", "127.0.0.1");

//Server's port number
app.set("port", 8080);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
//app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(sassMiddleware({
  src: path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  indentedSyntax: true, // true = .sass and false = .scss
  sourceMap: true
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//Start the http server at port and IP defined before
server.listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

module.exports = app;
