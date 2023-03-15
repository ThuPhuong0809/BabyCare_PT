const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
const mongooseDelete = require('mongoose-delete');

const Schema = mongoose.Schema;

const Like = new Schema(
  {
    id: { type: Number },
    userId: { type: Number },
    newId: { type: Number },
    time: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Add plugin
mongoose.plugin(slug);
Like.plugin(AutoIncrement, { inc_field: 'id' });
Like.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' });

module.exports = mongoose.model('Like', Like);
