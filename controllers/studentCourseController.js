const InstructorCourse = require('../models/instructorCourse');
const StudentCourseEnrollment = require('../models/studentCourseEnrollment');
const Instructor = require('../models/instructor');

const certNumber = () => `CERT-${Date.now().toString().slice(-6)}-${Math.random().toString(36).slice(2,7).toUpperCase()}`;

exports.listPublicCourses = async (req, res) => {
  try {
    const { q } = req.query;
    const filter = { visibility: 'public' };
    if (q) filter.title = { $regex: q, $options: 'i' };
    const courses = await InstructorCourse.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: courses.length, courses });
  } catch (error) {
    console.error('List Public Courses Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.getCourseDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const course = await InstructorCourse.findById(id).populate('instructor', 'user');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.status(200).json({ success: true, course });
  } catch (error) {
    console.error('Get Course Details Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.buyCourse = async (req, res) => {
  try {
    const userId = req.user._id;
    const { courseId } = req.body;
    const course = await InstructorCourse.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });
    const totalVideos = Array.isArray(course.videos) ? course.videos.length : 0;
    const enrollment = await StudentCourseEnrollment.create({
      user: userId,
      course: courseId,
      status: totalVideos === 0 ? 'completed' : 'active',
      progress: { completedVideos: 0, totalVideos, percent: totalVideos ? 0 : 100 },
      certificate: totalVideos === 0 ? {
        title: course.title,
        issuedAt: new Date(),
        directorName: '',
        number: certNumber()
      } : undefined
    });
    res.status(201).json({ success: true, enrollment });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Already purchased this course' });
    }
    console.error('Buy Course Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.myPurchases = async (req, res) => {
  try {
    const userId = req.user._id;
    const items = await StudentCourseEnrollment.find({ user: userId }).populate('course');
    res.status(200).json({ success: true, count: items.length, items });
  } catch (error) {
    console.error('My Purchases Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.updateProgress = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const { completedVideos } = req.body;
    const enr = await StudentCourseEnrollment.findById(id).populate('course');
    if (!enr) return res.status(404).json({ message: 'Enrollment not found' });
    if (enr.user.toString() !== userId.toString()) return res.status(403).json({ message: 'Not authorized' });
    const total = Array.isArray(enr.course.videos) ? enr.course.videos.length : (enr.progress?.totalVideos || 0);
    const comp = Math.max(0, Math.min(Number(completedVideos || 0), total));
    const percent = total ? Math.round((comp / total) * 100) : 100;
    enr.progress = { completedVideos: comp, totalVideos: total, percent };
    if (percent === 100) {
      const instr = await Instructor.findById(enr.course.instructor).populate('user', 'name');
      enr.status = 'completed';
      enr.certificate = {
        title: enr.course.title,
        issuedAt: new Date(),
        directorName: instr && instr.user ? instr.user.name : '',
        number: certNumber()
      };
    }
    await enr.save();
    res.status(200).json({ success: true, enrollment: enr });
  } catch (error) {
    console.error('Update Progress Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.myCertificates = async (req, res) => {
  try {
    const userId = req.user._id;
    const items = await StudentCourseEnrollment.find({ user: userId, status: 'completed' }).populate('course');
    const certs = items.map(i => ({
      id: i._id,
      title: i.certificate?.title || i.course?.title || '',
      progress: i.progress ? `${i.progress.completedVideos}/${i.progress.totalVideos} ${i.progress.percent}%` : '',
      date: i.certificate?.issuedAt,
      directorName: i.certificate?.directorName || ''
    }));
    res.status(200).json({ success: true, count: certs.length, certificates: certs });
  } catch (error) {
    console.error('My Certificates Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

exports.getCertificateById = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const enr = await StudentCourseEnrollment.findById(id).populate('course');
    if (!enr) return res.status(404).json({ message: 'Certificate not found' });
    if (enr.user.toString() !== userId.toString()) return res.status(403).json({ message: 'Not authorized' });
    if (enr.status !== 'completed') return res.status(400).json({ message: 'Course not completed yet' });
    res.status(200).json({
      success: true,
      certificate: {
        id: enr._id,
        title: enr.certificate?.title || enr.course?.title || '',
        progress: enr.progress ? `${enr.progress.completedVideos}/${enr.progress.totalVideos} ${enr.progress.percent}%` : '',
        date: enr.certificate?.issuedAt,
        directorName: enr.certificate?.directorName || ''
      }
    });
  } catch (error) {
    console.error('Get Certificate Error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}
