const express = require("express");
const router = express.Router();
const User = require("../../models/users/userModel");
const bcrypt = require("bcryptjs");
const {
  generateToken,
  verifyToken,
} = require("../../authentication/generateToken");
const {
  registerSchema,
  loginSchema,
  updateSchema,
} = require("../../authentication/authentication");
const sendOtpToEmail = require("../../smtp/otp");

router.post("/register", async (req, res) => {
  try {
    const { username, email, password, confirmPassword, role } = req.body;
    const result = registerSchema.safeParse({
      username,
      email,
      password,
      confirmPassword,
      role,
    });
    if (!result.success) {
      // Extract individual error messages
      const errors = result.error.errors.map((err) => ({
        field: err.path[0],
        message: err.message,
      }));
      return res.status(400).json({ message: errors[0].message });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email is already in use" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Passwords do not match" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      username,
      email,
      password: hashedPassword,
      role,
      tokens: [],
    });

    const token = await generateToken(user);
    await user.save();

    return res.status(201).json({
      message: "User registered successfully",
      user: { username, email, role },
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = loginSchema.safeParse({ email, password });
    if (!result.success) {
      // Extract individual error messages
      const errors = result.error.errors.map((err) => ({
        field: err.path[0],
        message: err.message,
      }));
      return res.status(400).json({ message: errors[0].message });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res
        .status(401)
        .json({ message: "Email or password is incorrect" });
    }

    const token = await generateToken(user);
    await user.save();

    return res.status(200).json({
      message: "User logged in successfully",
      user: { username: user.username, email: user.email, role: user.role },
      token,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.put("/update", verifyToken, async (req, res) => {
  try {
    const { username, email, password, phone, image } = req.body;
    const result = updateSchema.safeParse({
      username,
      email,
      password,
      phone,
      image,
    });
    if (!result.success) {
      // Extract individual error messages
      const errors = result.error.errors.map((err) => ({
        field: err.path[0],
        message: err.message,
      }));
      return res.status(400).json({ message: errors[0].message });
    }
    const hashPassword = await bcrypt.hash(password, 10);
    const user = await User.findOneAndUpdate(
      { email },
      { username, password: hashPassword, phone, image },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    await user.save();
    return res.status(200).json({
      message: "User data update successfully",
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post("/logout", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.tokens = user.tokens.filter((t) => t !== req.token);
    await user.save();
    return res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/me", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({
      message: "User fetched successfully",
      user: {
        _id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        phone: user.phone,
        image: user.image,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

// get all users
router.get("/allusers", verifyToken, async (req, res) => {
  try {
    const users = await User.find();
    if (!users) {
      return res.status(404).json({ message: "Users not found" });
    }
    const filterStudents = users.filter((user) => user.role === "student");
    const filterTeachers = users.filter((user) => user.role === "teacher");
    return res.status(200).json({
      message: "Users fetched successfully",
      students: filterStudents,
      teachers: filterTeachers,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post("/forgetpassword", async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Email not found" });
    }

    const otp = generateOtp();
    user.otp = otp;
    user.otpExpires = Date.now() + 5 * 60 * 1000; // expires in 5 mins
    await user.save();
    await sendOtpToEmail(email, otp);
    console.log("User updated with OTP:", email);

    return res.status(200).json({
      message: "OTP sent to email for password reset",
      otp: user.otp,
      otpExpires: user.otpExpires,
    });
  } catch (error) {
    console.error("Forget password error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

const generateOtp = () => {
  let otp = '';
  for (let i = 0; i < 4; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
};

// update password with new password
router.put("/updatepassword", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.password = await bcrypt.hash(password, 10);
    user.otp = null;
    user.otpExpires = null;
    await user.save();
    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

module.exports = router;
