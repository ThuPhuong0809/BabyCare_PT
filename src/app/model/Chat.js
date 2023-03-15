const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
const mongooseDelete = require('mongoose-delete');

const Schema = mongoose.Schema;

const Chat = new Schema(
  {
    id: { type: Number },
    userId: { type: Number },
    type: { type: Number },
    message: { type: String, maxLength: 255 },
    createdDate: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Add plugin
mongoose.plugin(slug);
Chat.plugin(AutoIncrement, { inc_field: 'id' });
Chat.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' });

module.exports = mongoose.model('Chat', Chat);
