mongoose = require('mongoose')
jwt      = require('jsonwebtoken')
bcrypt   = require('bcrypt')

SALT_WORK_FACTOR = 10

UserSchema = new mongoose.Schema({
  username: { type: String, required: true, index: { unique: true } },
  password: { type: String, required: true }
})

UserSchema.pre 'save', (next) ->
  user = this
  return next() unless user.isModified('password')

  bcrypt.genSalt SALT_WORK_FACTOR, (err, salt) ->
    if err then return next(err)

    bcrypt.hash user.password, salt, (err, hash) ->
      if err then return next(err)

      # hash the password
      user.password = hash
      next()

UserSchema.methods.comparePassword = (testPassword, done) ->
  bcrypt.compare testPassword, this.password, (err, isMatch) ->
    if err then return done(err)
    done(null, isMatch)

UserSchema.methods.generateJWT = ->
  # expire in 60days
  today = new Date()
  exp = new Date(today)
  exp.setDate(today.getDate() + 60)

  return jwt.sign({
    _id: this._id
    username: this.username
    exp: parseInt(exp.getTime() / 1000)
  }, 'SECRETWORDS')

module.exports = mongoose.model('User', UserSchema)