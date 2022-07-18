// MODULES //
const fs = require('fs');
const mongoose = require('mongoose');
const dotevn = require('dotenv');
dotevn.config({ path: './config.env' });
const Tour = require('../../models/tourModel');
const User = require('../../models/userModel');
const Review = require('../../models/reviewModel');

// CONNECTING MongoDB ATLAS DB CONNECTION //
const connectDB = async (db, depen = { autoIndex: true }) => {
  const con = await mongoose.connect(db, depen);
  console.log('DB connection success!');
};
connectDB(
  process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD)
);

// READ FILE //
const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours.json`, 'utf-8'));
const users = JSON.parse(fs.readFileSync(`${__dirname}/users.json`, 'utf-8'));
const reviews = JSON.parse(
  fs.readFileSync(`${__dirname}/reviews.json`, 'utf-8')
);

// IMPORT DATA INTO DB //
const importData = async () => {
  try {
    await Tour.create(tours);
    await User.create(users, { validateBeforeSave: false });
    await Review.create(reviews);
    console.log('All data successfully loaded!');
  } catch (err) {
    console.error(err);
  }
  process.exit();
};

// DELETE ALL DATA FROM COLLECTION //
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    await User.deleteMany();
    await Review.deleteMany();
    console.log('All documents deleted successfully!');
  } catch (err) {
    console.error(err);
  }
  process.exit();
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
