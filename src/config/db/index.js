const mongoose = require('mongoose');

async function connect() {
  try {
    await mongoose.connect('mongodb://localhost:27017/babycare', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      useCreateIndex: true,
    });
    console.log('Kết nối MongoDB thành công!!!');
  } catch (e) {
    console.log('Kết nối MongoDB thất bại!!!');
  }
}

module.exports = { connect };
