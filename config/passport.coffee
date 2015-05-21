passport      = require('passport')
LocalStrategy = require('passport-local')

User = require('../models/User')

passport.use new LocalStrategy (username, password, done) ->
  User.findOne {username: username}, (err, user) ->
    if err then return done(err)
    return done(null, false, {message: 'Incorrect username.'}) unless user?

    user.comparePassword password, (err, isMatch) ->
      if isMatch then done(null, user)
      else done(null, false, {message: 'Incorrect password.'})
