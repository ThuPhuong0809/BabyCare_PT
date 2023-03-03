const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
const mongooseDelete = require('mongoose-delete');
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

const QuanLys = new Schema(
  {
    sodienthoai: { type: String, maxLength: 255 },
    matkhau: { type: String, maxLength: 255 },
    hoten: { type: String, maxLength: 255 },
    tendangnhap: { type: String, maxLength: 255 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);
QuanLys.pre('save', function (next) {
  let user = this;

  bcrypt.hash(user.matkhau, 10, function (error, hash) {
    if (error) {
      return next(error);
    } else {
      user.matkhau = hash;
      next();
    }
  });
});

// Add plugin
mongoose.plugin(slug);
QuanLys.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' });

module.exports = mongoose.model('QuanLys', QuanLys);
