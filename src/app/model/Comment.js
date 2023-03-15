const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
const mongooseDelete = require('mongoose-delete');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const bcrypt = require('bcryptjs');

const Schema = mongoose.Schema;

const Comment = new Schema(
  {
    id: { type: Number },
    userId: { type: Number },
    newId: { type: Number },
    content: { type: String, maxLength: 255 },
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
Comment.plugin(AutoIncrement, { inc_field: 'id' });
Comment.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' });

module.exports = mongoose.model('Comment', Comment);
