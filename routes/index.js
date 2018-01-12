var express = require('express');
var mid = require('./mid');
var router = express.Router();
var User = require('../models/user');
var Message = require('../models/message');


/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/chat');
});

router.get('/login', function(req, res, next) {
  res.render('index', { title: 'Log in' });
});

router.post('/login', function(req, res, next) {
  if (req.body.username && req.body.password) {
    User.authenticate(req.body.username, req.body.password, function (error, user) {
      if (error || !user) {
        res.render('index', {'error': "Wrong username or password."});
      } else {
        req.session.userId = user._id;
        return res.redirect('/chat');
      }
    });
  } else {
    var err = new Error('All fields required.');
    err.status = 400;
    return next(err);
  }
});

router.get('/register', function(req, res, next) {
  res.render('registration', { title: 'Register' });
});

router.post('/register', function(req, res, next) {
  if (req.body.username &&
    req.body.password &&
    req.body.confirm) {

    if (req.body.password != req.body.confirm) {
      res.render('registration', {'error': "Passwords don't match."});
      return;
    }

    var newUser = {
      username: req.body.username,
      password: req.body.password,
      confirm: req.body.confirm,
    }

    User.create(newUser, function (error, user) {
      if (error) {
        res.render('registration', {'error': "Username already exist."});;
      } else {
        req.session.userId = user._id;
        return res.redirect('/chat');
      }
    });
  }
});

router.get('/chat', mid.requiresLogin, function(req, res, next) {
  User.findOne({ _id: req.session.userId }, function (err, user) {
    console.log(req.session.userId);
    res.render('chat', { title: 'Chat', username: user.username, userId: req.session.userId });
  });


});

router.post('/add-message', mid.requiresLogin, function(req, res, next) {
  if (req.body.content && req.body.author) {
    var newMessage = {
      content: req.body.content,
      author: req.body.author,
    }

    Message.create(newMessage, function (error, message) {
      if (error) {
        res.send({error: error});
        return;
      } else {
        Message.findOne({_id: message._id})
          .populate('author')
          .exec(function(err, message) {
            res.send({notification: "Add message successfully.", message: message});
            return;
          });
        return;
      }
    });
  }

});

router.get('/all-messages', mid.requiresLogin, function(req, res, next) {
  Message.find({})
    .populate('author')
    .exec(function(err, messages) {

        //res.send(messageList);
        res.send(messages);
    });
});

router.get('/logout', function (req, res, next) {
  if (req.session) {
    // delete session object
    req.session.destroy(function (err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});



module.exports = router;
