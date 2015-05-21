mongoose = require('mongoose')
ObjectId = mongoose.Schema.Types.ObjectId

PostSchema = new mongoose.Schema({
  title: String
  link: String 
  upvotes: { type: Number, default: 0 }
  comments: [{
    type: ObjectId
    ref: 'Comment'
  }]
})

PostSchema.methods.upvote = (done) ->
  this.upvotes += 1
  this.save(done)

module.exports = mongoose.model('Post', PostSchema)