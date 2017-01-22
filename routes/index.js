require('../config/passport');

var passport = require('passport');
var jwt      = require('express-jwt');
var express  = require('express');
var mongoose = require('mongoose');
var User     = require('../models/User');
var Todo     = require('../models/Todo');
var router   = express.Router();

var auth = jwt({secret: 'SECRET', userProperty: 'payload'});
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get('/users', function(req, res, next) {
  User.find(function(err, posts){
    if(err){
      return next(err);
    }

    res.json(posts);
  });
});

router.post('/register', function (req, res) {
  var user = new User();

  user.username = req.body.username;

  user.setPassword(req.body.password);

  user.save(function(err) {
    var token;
    token = user.generateJWT();
    res.status(200);
    res.json({
      "token" : token
    });
  });


});
router.post('/login', function(req, res, next){
  if(!req.body.username || !req.body.password){
    return res.status(400).json({message: 'Please fill out all fields'});
  }
  passport.authenticate('local', function(err, user, info){
    if(err){return next(err); }
    if(user){
      return res.json({token: user.generateJWT()});
    } else {
      return res.status(401).json(info);
    }
  })(req, res, next);
});

router.get('/users/:user/todos', function(req, res, next) {
  var body = req.body;
  var userId = body._id;

  Todo.find({user: userId}, function(err, posts) {
    if (err) {
      return next(err);
    }
    res.json(posts);

  });
});

router.post('/users/:user/todos', function(req, res, next) {
  var todo = new Todo(req.body);
  todo.text = req.body.text;
  // todo.user = req.payload._id;
  todo.user = req._id;

  todo.save(function(err, todo){
    if(err){ return next(err); }

    // req.post.comments.push(comment);
    // req.todo.save(function(err, todo) {
    //   if(err){ return next(err); }
    //
    //   res.json(todo);
    // });
    res.json(todo);
  });
});


module.exports = router;
