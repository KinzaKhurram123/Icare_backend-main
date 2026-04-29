const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Course = require("./models/course");
const User = require("./models/user");

dotenv.config();

const reassignCourses = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const instructor = await User.findOne({ email: "instructor@icare.com" });
        if (!instructor) {
            console.error("Instructor user not found!");
            process.exit(1);
        }

        const result = await Course.updateMany(
            {},
            { $set: { instructor: instructor._id } }
        );

        console.log(`Successfully reassigned ${result.modifiedCount} courses to ${instructor.email} (${instructor._id})`);
        process.exit(0);
    } catch (error) {
        console.error("Error:", error);
        process.exit(1);
    }
};

reassignCourses();
