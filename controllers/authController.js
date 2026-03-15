const User = require("../models/user");
const Doctor = require("../models/doctor");
const Pharmacy = require("../models/pharmacy");
const Laboratory = require("../models/laboratory");
const generateToken = require("../utils/generateToken");
const bcrypt = require("bcryptjs");

exports.registerUser = async (req, res) => {
  try {
    console.log("Register request:", req.body);

    const { name, email, password, role, phoneNumber } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Please add all required fields",
      });
    }
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: role || "user",
      phoneNumber: phoneNumber || "",
    });

    console.log("User created:", user._id);

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    console.error("Register error:", error);
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password))) {
    console.log("✅ USER LOGGED IN:");
    console.log("   Name:", user.name);
    console.log("   Email:", user.email);
    console.log("   Role:", user.role);
    console.log("   Time:", new Date().toLocaleString());
    console.log("-----------------------------------");

    res.json({
      _id: user.id,
      name: user.name,
      email: user.email,
      token: generateToken(user.id),
    });
  } else {
    console.log("❌ LOGIN FAILED:", email);
    res.status(401).json({ message: "Invalid credentials" });
  }
};

exports.forgetPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid Email" });
    }
    const otp = Math.floor(100000 + Math.random() * 900000);
    user.resetOTP = otp;
    user.otpExpiry = Date.now() + 10 * 60 * 1000;
    await user.save();

    return res.json({
      message: "OTP sent to your email",
      body: user,
      otp: otp,
    });
  } catch (error) {
    console.error("Error in forgetPassword:", error);
    if (!res.headersSent) {
      return res.status(500).json({ error: "Internal Server Error" });
    }
  }
};

exports.conformationPassword = async (req, res) => {
  try {
    const { code, email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid Email" });
    }
    if (!user.resetOTP) {
      return res
        .status(400)
        .json({ error: "OTP not generated for this email" });
    }
    if (parseInt(code) !== user.resetOTP) {
      return res.status(400).json({ error: "Invalid OTP" });
    }
    if (Date.now() > user.otpExpiry) {
      return res.status(400).json({ error: "OTP has expired" });
    }
    return res.json({ message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error in checkCode:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
exports.resetPassword = async (req, res) => {
  try {
    const { email, password, confirmpassword } = req.body;

    if (password !== confirmpassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: "Invalid Email" });
    }

    user.password = password;
    user.resetOTP = undefined;
    user.otpExpiry = undefined;

    await user.save();

    console.log("✅ PASSWORD RESET SUCCESSFUL:");
    console.log("   Email:", user.email);
    console.log("   Time:", new Date().toLocaleString());
    console.log("-----------------------------------");

    return res.json({ message: "Reset Password Successfully" });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};
