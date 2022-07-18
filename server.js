// MODULES //
const mongoose = require('mongoose');
const dotevn = require('dotenv');
dotevn.config({ path: './config.env' });

// APP //
const app = require('./app');

// CATCHING UNCAUGHT EXCEPTIONS //
process.on('uncaughtException', err => {
  console.log(`${err.name}: ${err.message}`);
  console.log('UNCAUGHT EXCEPTION 🧯: App is crashing...');
  process.exit(1);
});

// CONNECTING MongoDB ATLAS DB CONNECTION //
const connectDB = async (db, depen = { autoIndex: true }) => {
  await mongoose.connect(db, depen);
};
connectDB(
  process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)
);

// RUNNING THE APP //
const port = process.env.PORT || 3000;
const server = app.listen(port, () => {
  console.log(`App is running on port ${port}!`);
});

// CATCHING UNHANDLED REJECTIONS //
process.on('unhandledRejection', err => {
  console.log(`${err.name}: ${err.message}`);
  console.log('UHNANDLED REJECTION 🧯: App is crashing...');
  server.close(() => {
    process.exit(1);
  });
});
