var mongoose = require('mongoose')
var jwt      = require('jsonwebtoken')
var bcrypt   = require('bcrypt')

var SALT_WORK_FACTOR = 10

var UserSchema = new mongoose.Schema({
  username: { type: String, required: true, index: {unique: true} },
  password: { type: String, required: true }
})

UserSchema.pre('save', function(next) {
  var user = this

  if (!user.isModified('password')) return next()

  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) return next(err)

    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err)

      // hash the password
      user.password = hash
      next()
    })
  })
})

UserSchema.methods.comparePassword = function(testPassword, done) {
  bcrypt.compare(testPassword, this.password, function(err, isMatch) {
    if (err) return done(err)
    done(null, isMatch)
  })
}

UserSchema.methods.generateJWT = function() {
  // expire in 60days
  var today = new Date()
  var exp = new Date(today)
  exp.setDate(today.getDate() + 60)

  return jwt.sign({
    _id: this._id,
    username: this.username,
    exp: parseInt(exp.getTime() / 1000)
  }, 'SECRETWORDS')
}

module.exports = mongoose.model('User', UserSchema)