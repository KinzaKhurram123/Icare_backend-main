const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("./models/user");
const Instructor = require("./models/instructor");

dotenv.config();

const createInstructor = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Connected to MongoDB");

        const email = "instructor@icare.com";
        const password = "password123";

        let user = await User.findOne({ email });
        if (!user) {
            user = new User({
                name: "Default Instructor",
                email: email,
                password: password,
                role: "Instructor",
                isEmailVerified: true,
                isApproved: true
            });
            await user.save();
            console.log("Instructor user account created successfully!");
        } else {
            console.log("Instructor user account already exists.");
        }

        // Check if instructor profile exists
        let profile = await Instructor.findOne({ user: user._id });
        if (!profile) {
            profile = new Instructor({
                user: user._id,
                bio: "Expert healthcare instructor with years of teaching experience.",
                qualification: "Master of Public Health",
                age: 35,
                gender: "Male",
                address: "Healthcare Hub, City Center",
                specialties: ["General Health", "Mental Wellness"],
                experience: "10 years",
                isVerified: true
            });
            await profile.save();
            console.log("Instructor profile created successfully!");
        } else {
            console.log("Instructor profile already exists.");
        }

        console.log("Setup complete!");
        console.log("Email: " + email);
        console.log("Password: " + password);
        process.exit(0);
    } catch (error) {
        console.error("Error creating instructor:", error);
        process.exit(1);
    }
};

createInstructor();
