const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Course = require("./models/course");
const User = require("./models/user");

dotenv.config();

const checkCourses = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const courses = await Course.find().populate("instructor", "name email role");
        console.log("Found " + courses.length + " courses:");
        courses.forEach(c => {
            console.log(`- Title: ${c.title}`);
            console.log(`  ID: ${c._id}`);
            console.log(`  Instructor: ${c.instructor ? c.instructor.email : 'NULL'} (${c.instructor ? c.instructor._id : 'N/A'})`);
            console.log(`  IsPublished: ${c.isPublished}`);
            console.log('---');
        });

        const users = await User.find({ role: 'Instructor' });
        console.log("Instructors in DB:");
        users.forEach(u => {
            console.log(`- ${u.name} (${u.email}) ID: ${u._id}`);
        });

        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

checkCourses();
