const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
const mongooseDelete = require('mongoose-delete');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const Schema = mongoose.Schema;

const ListChat = new Schema(
  {
    idListChat: { type: Number },
    userName: { type: String, maxLength: 255 },
    createdDate: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Add plugin
mongoose.plugin(slug);
ListChat.plugin(AutoIncrement, { inc_field: 'ListChat' });
ListChat.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' });

module.exports = mongoose.model('ListChat', ListChat);
