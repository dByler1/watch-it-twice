import createError from'http-errors';
import express from 'express';
import hbs from 'express-handlebars';
import hbshelpers from 'handlebars-helpers';
import path from'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import session from 'express-session';
import flash from 'connect-flash'
import mongoose from 'mongoose';
import passport from 'passport';
import dotenv from 'dotenv';
import helmet from 'helmet';

const MongoStore = require('connect-mongo')(session);

import indexRouter from './routes/index';
import usersRouter from './routes/users';
import movieRouter from './routes/movie';
import reviewRouter from './routes/review';

const multihelpers = hbshelpers();
const app = express();
dotenv.config();
app.use(helmet())

//Passport Config
require('./config/passport')(passport);

// DB Config
// const db = require('./config/keys').MongoURI;

// Connect to Mongo
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));

// view engine setup
app.engine(
  "hbs",
  hbs({
    helpers: multihelpers,
    extname: "hbs",
    defaultLayout: "layout",
    layoutsDir: "views/layouts",
    partialsDir: ["views/partials"]
  })
);
app.set('view engine', 'hbs');

// helper_date.register(hbs.hanlebars, 'date');

app.use(express.static(path.join(__dirname, '../public')));
//npm managed front end packages
app.use('/jquery', express.static(path.join(__dirname, '../node_modules', 'jquery', 'dist')));
app.use('/popper', express.static(path.join(__dirname, '../node_modules', 'popper.js', 'dist')));
app.use('/bootstrap', express.static(path.join(__dirname, '../node_modules', 'bootstrap', 'dist')));


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Express Session
//session enables enables storing unique user data
//enables flash messages
app.use(session({
  secret: 'secret',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({mongooseConnection: mongoose.connection}),
  cookie: {maxAge: 180 * 60 * 1000}
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

//Global Vars
app.use((req, res, next) => {
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error = req.flash('error');
  res.locals.login = req.isAuthenticated();
  res.locals.session = req.session;
  next();
});

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/movie', movieRouter);
app.use('/review', reviewRouter);

// catch 404 and forward to error handler
app.use( (req, res, next) => {
  next(createError(404));
});

// error handler
app.use( (err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

export default app;
