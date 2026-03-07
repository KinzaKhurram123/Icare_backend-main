const mongoose = require('mongoose');

const instructorCourseSchema = new mongoose.Schema({
  instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'Instructor', required: true },
  title: { type: String, required: true },
  caption: String,
  videos: [{
    title: String,
    url: String
  }],
  visibility: { type: String, enum: ['public', 'students', 'private'], default: 'public' }
}, { timestamps: true });

module.exports = mongoose.model('InstructorCourse', instructorCourseSchema);
