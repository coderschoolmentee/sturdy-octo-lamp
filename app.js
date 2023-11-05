const express = require('express')
const mongoose = require('mongoose')
const path = require('path')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const cors = require('cors')
require('dotenv').config()
const app = express()

app.use(cors())
app.use(logger('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))

const indexRouter = require('./routes/index')
app.use('/api', indexRouter)

app.get('/', (req, res) => {
  res.send('Welcome!')
})

app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found!' })
})

app.use((err, req, res, next) => {
  if (err.name === 'ValidationError') {
    const validationErrors = Object.values(err.errors).map(error => error.message)
    console.log('err')
    res.status(400).json({ error: validationErrors })
  } else {
    res.status(500).json({ error: err.message || 'Internal Server Error' })
  }
})

mongoose
  .connect(process.env.MONGODB_URI_LOCAL)
  // .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB')
  })
  .catch((err) => {
    console.error('Error connecting to MongoDB:', err)
  })
module.exports = app
