import 'dotenv/config'
import express from 'express'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import compression from 'compression'
import morgan from 'morgan'

import { router as api } from './middleware/api.js'
import { router as auth } from './middleware/auth.js'

const app = express()

app.use(compression())
app.use(morgan(process.env.MORGAN))
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI
    }),
    maxAge: 432000000
  })
)

app.disable('x-powered-by')

app.use('/api', api)
app.use('/auth', auth)

app.use(
  express.static('public', {
    extensions: ['html', 'htm'],
    maxAge: '1 day'
  })
)

app.listen(process.env.PORT, () => {
  console.log(`Listening at http://localhost:${process.env.PORT}`)
})
