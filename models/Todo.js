var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var TodoSchema = new Schema({
  text: String,
  flag: {type: Boolean, default: true},
  user: {type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Todo', TodoSchema);