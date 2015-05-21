express  = require('express')
router   = express.Router()
passport = require('passport')

User     = require('../models/Users')

router.get('/', (req, res) -> res.render('index'))

router.use('/posts', require('./posts'))

router.post '/register', (req, res, next) ->
  unless req.body.username? and req.body.password?
    return res.status(400).json(message: 'Please fill out all fields.')

  user = new User(req.body)
  user.save (err) ->
    if err then return next(err)

    return res.json(token: user.generateJWT())

router.post '/login', (req, res, next) ->
  unless req.body.username? and req.body.password?
    return res.status(400).json(message: 'Please fill out all fields.')

  passport.authenticate('local', (err, user, info) ->
    if err then return next(err)

    if (user) then return res.json(token: user.generateJWT())
    else return res.status(401).json(info)
  )(req, res, next)

module.exports = router
