express  = require('express')
router   = express.Router()

Post    = require('../models/Post')
Comment = require('../models/Comment')

jwt  = require('express-jwt')
auth = jwt({ secret: "SECRETWORDS", userProperty: 'payload' })

# PARAMS
router.param 'post', (req, res, next, id) ->
  query = Post.findById(id)

  query.exec (err, post) ->
    if err then return next(err)
    return next(new Error('cant find post')) unless post?

    req.post = post
    next()

router.param 'comment', (req, res, next, id) ->
  query = Comment.findById(id)

  query.exec (err, comment) ->
    if err then return next(err)
    return next(new Error('cant find comment')) unless comment?

    req.comment = comment
    next()

# GET /posts
router.get '/', (req, res, next) ->
  Post.find (err, posts)->
    if err then return next(err)
    res.json(posts)

# GET /posts/:post
router.get '/:post', (req, res) ->
  req.post.populate 'comments', (err, post) ->
    if err then return next(err)
    res.json(req.post)

# AUTHENTICATED

# POST /posts
router.post '/', auth, (req, res, next) ->
  post = new Post(req.body)
  post.author = req.payload.username

  post.save (err, post) ->
    if err then return next(err)
    res.json(post)

# PUT /posts/:post/upvote
router.put '/:post/upvote', auth, (req, res, next) ->
  req.post.upvote (err, post) ->
    if err then return next(err)
    res.json(post)

# POST /posts/:post/comments
router.post '/:post/comments', auth, (req, res, next) ->
  comment = new Comment(req.body)
  comment.post = req.post
  comment.author = req.payload.username

  comment.save (err, comment) ->
    if err then return next(err)

    req.post.comments.push(comment)
    req.post.save (err, post) ->
      if err then return next(err)
      res.json(comment)

# PUT /posts/:post/comments/:comment/upvote
router.put '/:post/comments/:comment/upvote', auth, (req, res, next) ->
  req.comment.upvote (err, comment) ->
    if err then return next(err)
    res.json(comment)

module.exports = router