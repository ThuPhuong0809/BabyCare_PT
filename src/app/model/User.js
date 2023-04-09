const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
const mongooseDelete = require('mongoose-delete');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

const User = new Schema(
  {
    idUser: { type: Number },
    name: { type: String, maxLength: 255 },
    dateOfBirth: { type: String, maxLength: 255 },
    gender: { type: String, maxLength: 255 },
    cccd: { type: String, maxLength: 255 },
    issuedBy: { type: String, maxLength: 255 },
    dateOfIssue: { type: String, maxLength: 255 },
    status: { type: Number },
    avatar: { type: String, maxLength: 255 },
    idAccount: { type: Number },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Add plugin
mongoose.plugin(slug);
User.plugin(AutoIncrement, { inc_field: 'idUser' });
User.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' });

module.exports = mongoose.model('User', User);
