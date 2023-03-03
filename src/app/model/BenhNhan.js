const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
const mongooseDelete = require('mongoose-delete');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

const BenhNhan = new Schema(
  {
    sodienthoai: { type: String, maxLength: 255 },
    email: { type: String, maxLength: 255 },
    matkhau: { type: String, maxLength: 255 },
    hoten: { type: String, maxLength: 255 },
    gioitinh: { type: String, maxLength: 255 },
    ngaysinh: { type: String, maxLength: 255 },
    mabenhnhan: { type: Number },
    anh: { type: String, maxLength: 255 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

BenhNhan.pre('save', function (next) {
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

mongoose.plugin(slug);
BenhNhan.plugin(AutoIncrement, { inc_field: 'mabenhnhan' });
BenhNhan.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' });

module.exports = mongoose.model('BenhNhan', BenhNhan);
