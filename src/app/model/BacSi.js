const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
const mongooseDelete = require('mongoose-delete');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

const BacSi = new Schema(
  {
    hoten: { type: String, maxLength: 255 },
    mabacsi: { type: Number },
    gioitinh: { type: String, maxLength: 255 },
    ngaysinh: { type: String, maxLength: 255 },
    chuyenkhoa: { type: String, maxLength: 255 },
    hochamhocvi: { type: String, maxLength: 255 },
    chucvu: { type: String, maxLength: 255 },
    benhviencongtac: { type: String, maxLength: 255 },
    trangthaikham: { type: String, maxLength: 255 },
    matkhau: { type: String, maxLength: 255 },
    sodienthoai: { type: String, maxLength: 255 },
    anh: { type: String, maxLength: 255 },
    diachiphongkham: { type: String, maxLength: 255 },
    dongia: { type: Number },
    danhgia: { type: Number },
    email: { type: String, maxLength: 255 },
    gioithieu: { type: String, maxLength: 255 },
    kinhnghiem: { type: String, maxLength: 255 },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

BacSi.pre('save', function (next) {
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
BacSi.plugin(AutoIncrement, { inc_field: 'mabacsi' });
BacSi.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' });

module.exports = mongoose.model('BacSi', BacSi);
