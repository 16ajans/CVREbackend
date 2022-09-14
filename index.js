import 'dotenv/config';
import express from 'express';
import session from 'express-session';
import morgan from 'morgan';

// import { router as api } from './middleware/api.js'
import { router as auth } from './middleware/auth.js'

const app = express()

app.use(morgan('dev'));
app.use(session({ //TODO: tweak session expiration, store
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    // store: MongoStore.create({
    //     mongoUrl: process.env.MONGODB_URI
    // })
}));

// app.use('/api', api);
app.use('/auth', auth);

app.listen(process.env.port, () => {
    console.log(`Listening at http://localhost:${process.env.port}`)
});