// const mongoose = require('mongoose');

// const blogSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   content: { type: String, required: true },
//   owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
// });

// const Blog = mongoose.model('Blog', blogSchema);

// module.exports = Blog;


// // In your 'model/blog.js' file:

// const mongoose = require('mongoose');

// const commentSchema = new mongoose.Schema({
//   user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   text: { type: String, required: true },
// });

// const blogSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   content: { type: String, required: true },
//   owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   rating: { type: Number, default: 0 },
//   comments: [commentSchema],
// });

// const Blog = mongoose.model('Blog', blogSchema);

// module.exports = Blog;


// In your 'model/blog.js' file:

// const mongoose = require('mongoose');

// const blogSchema = new mongoose.Schema({
//   title: { type: String, required: true },
//   content: { type: String, required: true },
//   owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//   rating: { type: Number, default: 0 },
//   comments: [{
//     user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
//     text: { type: String, required: true },
//   }],
//   categories: [{ type: String }],
// });

// const Blog = mongoose.model('Blog', blogSchema);

// module.exports = Blog;


const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, default: 0 },
  comments: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
  }],
  categories: [{ type: String }],
  createdAt: { type: Date, default: Date.now }, // Add createdAt field
  disabled: { type: Boolean, default: false }, // Add disabled field
});

const Blog = mongoose.model('Blog', blogSchema);

module.exports = Blog;


