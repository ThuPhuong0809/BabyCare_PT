const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
const mongooseDelete = require('mongoose-delete');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

const Account = new Schema(
  {
    id: { type: Number },
    username: { type: String, maxLength: 255 },
    password: { type: String, maxLength: 255 },
    role: { type: Number },
  },
  {
    timestamps: true,
  }
);

Account.pre('save', function (next) {
  let user = this;

  bcrypt.hash(user.password, 10, function (error, hash) {
    if (error) {
      return next(error);
    } else {
      user.password = hash;
      next();
    }
  });
});

// Add plugin
mongoose.plugin(slug);
Account.plugin(AutoIncrement, { inc_field: 'id' });
Account.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' });

module.exports = mongoose.model('Account', Account);
