const mongoose = require('mongoose');
const slug = require('mongoose-slug-generator');
const mongooseDelete = require('mongoose-delete');

const Schema = mongoose.Schema;

const NewType = new Schema(
  {
    id: { type: Number },
    name: { type: String, maxLength: 255 },
    image: { type: String, maxLength: 255 },
  },
  {
    timestamps: true,
  }
);

// Add plugin
mongoose.plugin(slug);
NewType.plugin(AutoIncrement, { inc_field: 'id' });
NewType.plugin(mongooseDelete, { deletedAt: true, overrideMethods: 'all' });

module.exports = mongoose.model('NewType', NewType);
