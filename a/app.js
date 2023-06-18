const express = require('express')
require('express-async-errors')
const app = express()
const cors = require('cors')
const notesRouter = require('./controllers/notes')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')
const mongoose = require('mongoose')
const config = require('./utils/config')

logger.info('app is running...')

const url = config.MONGODB_URL

logger.info('connecting to ', url)

mongoose.connect(url)
    .then(() => {
        logger.info('connected to mongoDB')
    })
    .catch(error => {
        logger.info('error connecting to mongoDB', error.message)
    })

// 下述的use顺序特别重要
app.use(cors())
app.use(express.static('build'))
app.use(express.json())
app.use(middleware.requestLogger)

app.use('/api/notes', notesRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

app.use(middleware.unkonwnEndpoint)
app.use(middleware.errorHandler)

module.exports = app