const mongoose = require('mongoose');

async function connect() {
  try {
    await mongoose.connect('mongodb://localhost:27017/babycare', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
    console.log('connect successfuly!!!');
  } catch (e) {
    console.log('connect failure!!!');
  }
}

module.exports = { connect };
