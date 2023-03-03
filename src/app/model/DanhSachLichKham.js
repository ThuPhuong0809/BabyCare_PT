const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
const mongooseDelete = require('mongoose-delete');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const Schema = mongoose.Schema;

const DanhSachLichKham = new Schema(
  {
    masolich: { type: Number },
    mabacsi: { type: Number },
    hotenbacsi: { type: String, maxLength: 255 },
    diachiphongkham: { type: String, maxLength: 255 },
    dongia: { type: Number },
    mabenhnhan: { type: String, maxLength: 255 },
    hotenbenhnhan: { type: String, maxLength: 255 },
    ngaykham: { type: String, maxLength: 255 },
    buoi: { type: String, maxLength: 255 },
    giokham: { type: String, maxLength: 255 },
    trangthai: { type: String, maxLength: 255 },
    lydohuy: { type: String, maxLength: 255 },
    ngaydangky: { type: String, maxLength: 255 },
    ngaydatlich: { type: String, maxLength: 255 },
  },
  {
    timestamps: true,
  }
);

// Add plugin
mongoose.plugin(slug);
DanhSachLichKham.plugin(AutoIncrement, { inc_field: 'masolich' });
DanhSachLichKham.plugin(mongooseDelete, {
  deletedAt: true,
  overrideMethods: 'all',
});

module.exports = mongoose.model('DanhSachLichKham', DanhSachLichKham);
