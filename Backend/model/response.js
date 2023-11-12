// const mongoose = require('mongoose');

// const responseSchema = new mongoose.Schema({
//   poll: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Poll',
//     required: true,
//   },
//   answers: [
//     {
//       question: {
//         type: mongoose.Schema.Types.ObjectId,
//         ref: 'Poll.questions',
//         required: true,
//       },
//       answer: {
//         type: String,
//         required: true,
//       },
//     },
//   ],
//   user: {
//     type: String, 
//   },
//   createdAt: {
//     type: Date,
//     default: Date.now,
//   },
// });

// const Response = mongoose.model('Response', responseSchema);

// module.exports = Response;


const mongoose = require('mongoose');

const responseSchema = new mongoose.Schema({
  // Define the fields for your Response schema as needed
  // For example:
  // user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  // content: { type: String, required: true },
});

const Response = mongoose.model('Response', responseSchema);

module.exports = Response;
