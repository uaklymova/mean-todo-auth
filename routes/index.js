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
  if (!req.body.username || !req.body.password)
  {
    // return message{"Bad params"}
  }

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

router.get('/users/:user/todos', auth, function(req, res, next) {
  var body = req.body;
  var userId = req.payload._id;
  
  //check if user exist
  Todo.find({user: userId}, function(err, todos) {
    if (err) {
      return next(err);
    }
    console.log(todos);
    res.json(todos);

  }).exec();
});
router.post('/users/:user/todos', auth, function(req, res, next) {
  var todo = new Todo(req.body);
  todo.text = req.body.text;
  todo.user = req.payload._id;

  //here should be checking in DB

  todo.save(function(err, todo){
    if(err){ return next(err); }
    res.json(todo);
  });
});
router.delete('/users/:user/todos/:todo_id', function (req, res) {
  Todo.remove({
    _id: req.params.todo_id
  }, function (err, todo) {
    if (err)
      res.send(err);

    getTodos(res);
  });
});

module.exports = router;
