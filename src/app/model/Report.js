const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
const mongooseDelete = require('mongoose-delete');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const bcrypt = require('bcryptjs');
const moment = require('moment');
const Schema = mongoose.Schema;

// moment().format('DD/MM/YYYY'); // date time hiện tại có format YYYY MM DD
// let date = moment(Date.now).format('DD/MM/YYYY');

const Report = new Schema(
  {
    idReport: { type: Number },
    userId: { type: Number },
    commentId: { type: Number },
    reason: { type: Array },
    status: { type: Number },
    createdDate: { type: Date, default: Date.now },
    updatedDate: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Add plugin
mongoose.plugin(slug);
Report.plugin(AutoIncrement, { inc_field: 'idReport' });
Report.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' });

module.exports = mongoose.model('Report', Report);
