var mongoose = require("mongoose");

var blogSchema = new mongoose.Schema({
  title: String,
  image: String,
  imageId: String,
  description: String,
  url: {
    work: { type: mongoose.SchemaTypes.Url, required: true },
    profile: { type: mongoose.SchemaTypes.Url, required: true }
  },
  createdAt: { type: Date, default: Date.now },
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    username: String
  }
});

module.exports.blog = blog;
