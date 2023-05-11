const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
const mongooseDelete = require('mongoose-delete');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const Schema = mongoose.Schema;

const ListChat = new Schema(
  {
    idListChat: { type: Number },
    userName: { type: String, maxLength: 255 },
    userImage: { type: String, maxLength: 255 },
    chatLatest: { type: String, maxLength: 255 },
    timeChatLatest: { type: Date, default: Date.now },
    createdDate: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Add plugin
mongoose.plugin(slug);
ListChat.plugin(AutoIncrement, { inc_field: 'idListChat' });
ListChat.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' });

module.exports = mongoose.model('ListChat', ListChat);
