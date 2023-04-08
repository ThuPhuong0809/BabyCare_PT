const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
const mongooseDelete = require('mongoose-delete');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const bcrypt = require('bcryptjs');
const moment = require('moment');
const Schema = mongoose.Schema;

// moment().format('DD/MM/YYYY'); // date time hiện tại có format YYYY MM DD
// let date = moment(Date.now).format('DD/MM/YYYY');

const Comment = new Schema(
  {
    idComment: { type: Number },
    userName: { type: String, maxLength: 255 },
    userImage: { type: String, maxLength: 255 },
    newId: { type: Number },
    content: { type: String, maxLength: 255 },
    status: { type: Number },
    createdDate: { type: String, default: 'Hôm nay' },
    updatedDate: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Add plugin
mongoose.plugin(slug);
Comment.plugin(AutoIncrement, { inc_field: 'idComment' });
Comment.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' });

module.exports = mongoose.model('Comment', Comment);
