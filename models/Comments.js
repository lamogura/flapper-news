var mongoose = require('mongoose')

var CommentSchema = new mongoose.Schema({
  body: String,
  author: String,
  upvotes: {type: Number, default: 0},
  post: {type: mongoose.Schema.Types.ObjectId, ref: 'Post'}
})

CommentSchema.methods.upvote = function(done) {
  this.upvotes += 1
  this.save(done)
}

module.exports = mongoose.model('Comment', CommentSchema)