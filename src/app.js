import express from 'express';
import logger from 'morgan';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import helmet from 'helmet';
import "core-js/stable";
import "regenerator-runtime/runtime";


// import indexRouter from './routes/index';
import userRoutes from './routes/users';
// import movieRouter from './routes/movie';
import reviewRoutes from './routes/review';
import authRoutes from './routes/authRoutes';

const app = express();
app.use(express.json());
dotenv.config();
app.use(helmet());


// Connect to Mongo
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB Connected...'))
  .catch(err => console.log(err));


// Set CORS Policy 
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods', 
    'OPTIONS, GET, POST, PUT, PATCH, DELETE'
  );
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
})

app.use(logger('dev'));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);
// app.use('/review', reviewRouter);

app.use('/auth', authRoutes)
app.use('/review', reviewRoutes)
app.use('/user', userRoutes)

// catch 404 and forward to error handler
// app.use( (req, res, next) => {
//   next(createError(404));
// });

// error handler
// app.use( (err, req, res, next) => {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

export default app;
