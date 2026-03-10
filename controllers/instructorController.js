const Instructor = require("../models/instructor");

exports.AddInstructorDetails = async (req, res) => {
  try {
    const userId = req.user._id;
    const {
      bio,
      qualification,
      age,
      gender,
      address,
      card,
      specialties,
      languages,
      experience,
      availabilityDays,
      availabilityTime,
      isVerified,
    } = req.body;
    const existingProfile = await Instructor.findOne({ user: userId }).populate(
      "user",
      "name email phoneNumber role createdAt",
    );
    if (existingProfile) {
      existingProfile.bio = bio;
      existingProfile.qualification = qualification;
      existingProfile.age = age;
      existingProfile.gender = gender;
      existingProfile.address = address;
      existingProfile.card = card;
      existingProfile.specialties = specialties;
      existingProfile.languages = languages;
      existingProfile.experience = experience;
      existingProfile.availabilityDays = availabilityDays;
      existingProfile.availabilityTime = availabilityTime;
      existingProfile.isVerified = isVerified ?? existingProfile.isVerified;
      await existingProfile.save();
      return res.status(200).json({
        message: "Instructor Updated Successfully",
        existingProfile,
        success: true,
      });
    }
    const instructor = await Instructor.create({
      user: userId,
      bio,
      qualification,
      age,
      gender,
      address,
      card,
      specialties: specialties ?? [],
      languages: languages ?? [],
      experience,
      availabilityDays: availabilityDays ?? [],
      availabilityTime,
      isVerified: isVerified ?? false,
    });
    const full = await Instructor.findById(instructor._id).populate(
      "user",
      "name email role phoneNunber createdAt",
    );
    return res.status(201).json({
      message: "Instructor created successfully",
      instructor: full,
      success: true,
    });
  } catch (error) {
    console.error("AddInstructorDetails Error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAllInstructors = async (req, res) => {
  try {
    const instructors = await Instructor.find().populate(
      "user",
      "name email role phoneNumber",
    );
    res.status(200).json({ success: true, instructors });
  } catch (error) {
    console.error("Get All Instructors Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getMyInstructorProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const instructor = await Instructor.findOne({ user: userId }).populate(
      "user",
      "name email phoneNumber role createdAt",
    );
    if (!instructor) {
      return res.status(404).json({ message: "Instructor profile not found" });
    }
    res.status(200).json({ success: true, instructor });
  } catch (error) {
    console.error("Get My Instructor Profile Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getInstructorById = async (req, res) => {
  try {
    const { id } = req.params;
    const instructor = await Instructor.findById(id).populate(
      "user",
      "name email role phoneNumber createdAt",
    );
    if (!instructor) {
      return res.status(404).json({ message: "Instructor not found" });
    }
    res.status(200).json({ success: true, instructor });
  } catch (error) {
    console.error("Get Instructor By Id Error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
