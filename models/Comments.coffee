mongoose = require('mongoose')
ObjectId = mongoose.Schema.Types.ObjectId

CommentSchema = new mongoose.Schema({
  body: String
  author: String
  upvotes: { type: Number, default: 0 },
  post: { type: ObjectId, ref: 'Post' }
})

CommentSchema.methods.upvote = (done) ->
  this.upvotes += 1
  this.save(done)

module.exports = mongoose.model('Comment', CommentSchema)