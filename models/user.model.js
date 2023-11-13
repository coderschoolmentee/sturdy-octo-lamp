const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      select: false
    },
    role: {
      type: String,
      enum: ['admin', 'staff'],
      required: true
    },
    avatarUrl: {
      type: String,
      require: false,
      default: ''
    },
    isDeleted: {
      type: Boolean,
      default: false
    },
    resetPasswordToken: {
      type: String,
      default: null
    },
    resetPasswordExpires: {
      type: Date,
      default: null
    },
    verificationToken: {
      type: String,
      default: null
    },
    isVerified: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
)

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next()
  }
  const salt = await bcrypt.genSalt(10)
  const hashedPassword = await bcrypt.hash(this.password, salt)
  this.password = hashedPassword
  next()
})

userSchema.methods.comparePassword = async function (password) {
  return bcrypt.compare(password, this.password)
}

userSchema.methods.generateToken = function () {
  const payload = {
    name: this.name,
    id: this._id,
    email: this.email,
    role: this.role
  }
  const options = {
    expiresIn: '60d'
  }
  return jwt.sign(payload, JWT_SECRET_KEY, options)
}

userSchema.methods.toJSON = function () {
  const obj = this._doc
  delete obj.password
  delete obj.isDeleted
  delete obj.resetPasswordToken
  delete obj.resetPasswordExpires
  return obj
}

const User = mongoose.model('User', userSchema)
module.exports = User
