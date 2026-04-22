const Instructor = require("../models/instructor");
const InstructorCourse = require("../models/instructorCourse");
const StudentCourseEnrollment = require("../models/studentCourseEnrollment");
const User = require("../models/user");
const Notification = require("../models/notification");
const Course = require("../models/course");

exports.assignCourse = async (req, res) => {
  try {
    const userId = req.user._id;
    const instructor = await Instructor.findOne({ user: userId });
    if (!instructor)
      return res.status(403).json({ message: "Instructor profile not found" });

    const { targetUserId, courseId } = req.body;

    // Try to find in InstructorCourse first, then fall back to Course
    let course = await InstructorCourse.findById(courseId);

    if (!course) {
      course = await Course.findById(courseId);
    }

    if (!course) return res.status(404).json({ message: "Course not found" });

    // Authorization check (instructor must own the course)
    const courseInstructorId = course.instructor ? course.instructor.toString() : null;
    if (!courseInstructorId) return res.status(400).json({ message: "Course has no associated instructor" });

    if (courseInstructorId !== instructor._id.toString() && courseInstructorId !== userId.toString()) {
      return res.status(403).json({ message: "Not authorized to assign this course" });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) return res.status(404).json({ message: "Target user not found" });

    // Check if already enrolled
    const existing = await StudentCourseEnrollment.findOne({ user: targetUserId, course: courseId });
    if (existing) return res.status(400).json({ message: "User already enrolled in this course" });

    const totalVideos = (course.videos && Array.isArray(course.videos))
      ? course.videos.length
      : (course.modules && Array.isArray(course.modules))
        ? course.modules.reduce((sum, m) => sum + (m.lessons && Array.isArray(m.lessons) ? m.lessons.length : 0), 0)
        : 0;

    const enrollment = await StudentCourseEnrollment.create({
      user: targetUserId,
      course: courseId,
      status: "active",
      progress: { completedVideos: 0, totalVideos, percent: 0 },
    });

    // Notify the user
    await Notification.create({
      user: targetUserId,
      title: "New Course Assigned",
      message: `Instructor ${req.user.name} has assigned you a new course: ${course.title}.`,
      type: "general",
      data: { courseId: course._id, enrollmentId: enrollment._id },
    });

    res.status(201).json({ success: true, enrollment });
  } catch (error) {
    console.error("Assign Course Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.createCourse = async (req, res) => {
  try {
    const userId = req.user._id;
    const instructor = await Instructor.findOne({ user: userId });
    if (!instructor)
      return res.status(403).json({ message: "Instructor profile not found" });
    const { title, caption, videos, visibility } = req.body;
    const course = await InstructorCourse.create({
      instructor: instructor._id,
      title,
      caption,
      videos: Array.isArray(videos) ? videos : [],
      visibility: visibility || "public",
    });
    res.status(201).json({ success: true, course });
  } catch (error) {
    console.error("Create Course Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.listCourses = async (req, res) => {
  try {
    const { instructorId, visibility, q } = req.query;

    let allCourses = [];

    // 1. Search in NEW collection
    const filterNew = {};
    if (instructorId) filterNew.instructor = instructorId;
    if (visibility) filterNew.visibility = visibility;
    if (q) filterNew.title = { $regex: q, $options: "i" };

    const newCourses = await InstructorCourse.find(filterNew).populate("instructor", "user");
    allCourses = [...newCourses];

    // 2. Search in LEGACY collection
    // Note: Legacy Course model uses User ID for instructor if it came from the old flow
    // If instructorId was passed, it might be an Instructor Profile ID. 
    // We should try to find the User ID for that instructor first.
    const Instructor = require("../models/instructor");
    const Course = require("../models/course");

    let legacyUserId = instructorId;
    if (instructorId && mongoose.Types.ObjectId.isValid(instructorId)) {
      const instr = await Instructor.findById(instructorId);
      if (instr) legacyUserId = instr.user;
    }

    const filterLegacy = {};
    if (legacyUserId) filterLegacy.instructor = legacyUserId;
    if (visibility === 'public') filterLegacy.isPublished = true;
    if (q) filterLegacy.title = { $regex: q, $options: "i" };

    const legacyCourses = await Course.find(filterLegacy);
    allCourses = [...allCourses, ...legacyCourses];

    res.status(200).json({ success: true, count: allCourses.length, courses: allCourses });
  } catch (error) {
    console.error("List Courses Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getCourseById = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await InstructorCourse.findById(id).populate(
      "instructor",
      "user",
    );
    if (!course) return res.status(404).json({ message: "Course not found" });
    res.status(200).json({ success: true, course });
  } catch (error) {
    console.error("Get Course Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const instructor = await Instructor.findOne({ user: userId });
    if (!instructor)
      return res.status(403).json({ message: "Instructor profile not found" });
    const course = await InstructorCourse.findById(id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (course.instructor.toString() !== instructor._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to edit this course" });
    }
    const updated = await InstructorCourse.findByIdAndUpdate(
      id,
      { $set: req.body },
      { new: true },
    );
    res.status(200).json({ success: true, course: updated });
  } catch (error) {
    console.error("Update Course Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const instructor = await Instructor.findOne({ user: userId });
    if (!instructor)
      return res.status(403).json({ message: "Instructor profile not found" });
    const course = await InstructorCourse.findById(id);
    if (!course) return res.status(404).json({ message: "Course not found" });
    if (course.instructor.toString() !== instructor._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this course" });
    }
    await InstructorCourse.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Course deleted" });
  } catch (error) {
    console.error("Delete Course Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
