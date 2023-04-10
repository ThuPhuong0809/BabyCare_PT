const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
const mongooseDelete = require('mongoose-delete');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

const EmailOTPSchema = new Schema(
  {
    userName: { type: String, maxLength: 255 },
    otp: { type: String, maxLength: 255 },
    createAt: Date,
    expireAt: Date,
  },
  {
    timestamps: true,
  }
);

EmailOTPSchema.pre('save', function (next) {
  let otpemail = this;

  bcrypt.hash(otpemail.otp, 10, function (error, hash) {
    if (error) {
      return next(error);
    } else {
      otpemail.otp = hash;
      next();
    }
  });
});

mongoose.plugin(slug);
module.exports = mongoose.model('EmailOTP', EmailOTPSchema);
