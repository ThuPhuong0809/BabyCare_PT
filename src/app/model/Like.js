const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
const mongooseDelete = require('mongoose-delete');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const Schema = mongoose.Schema;

const Like = new Schema(
  {
    idLike: { type: Number },
    userId: { type: Number },
    userName: { type: String, maxLength: 255 },
    newId: { type: Number },
    isRead: { type: Number },
    time: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Add plugin
mongoose.plugin(slug);
Like.plugin(AutoIncrement, { inc_field: 'idLike' });
Like.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' });

module.exports = mongoose.model('Like', Like);
