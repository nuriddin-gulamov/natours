// MODULES //
const express = require('express');
const path = require('path');
const fs = require('fs');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');
const cors = require('cors');

// ROUTES //
const tourRoutes = require('./routes/tourRoutes');
const userRoutes = require('./routes/userRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const viewRoutes = require('./routes/viewRoutes');
const AppError = require('./utils/appError');
const errorController = require('./controllers/errorController');

// APP //
const app = express();

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

// MIDDLEWARES //
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// REQUEST RATE LIMITER //
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try in an hour.',
});
app.use('/api', limiter);

// SET SECURITY HTTP HEADERS //
app.use(helmet());

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// DATA SANITIZATION AGAINST NoSQL QUERY INJECTION //
app.use(mongoSanitize());

// DATA SANITIZATION AGAINST XSS //
app.use(xss());

// IMPLEMENTING CORS //
app.use(cors());
app.options('*', cors())

// HTTP PARAMETER POLLUTION //
app.use(
  hpp({
    whitelist: [
      'duration',
      'ratingQuantity',
      'ratingAverage',
      'maxGroupSize',
      'difficulty',
      'price',
    ],
  })
);

app.use(compression());

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.cookies);
  next();
});

// USING TOUR AND USER ROUTES //
app.use('/', viewRoutes);

// API //
app.use('/api/v1/tours', tourRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/reviews', reviewRoutes);

app.all('*', (req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
});

app.use(errorController);

module.exports = app;
