const jwt = require("jsonwebtoken");
const User = require("../models/users/userModel");

const generateToken = async (user) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  });
  if (!token) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }
  user.tokens.push(token);
  await user.save();
  return token;
};

// Middleware to Verify Access Token
const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ message: "Unauthorized: No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: "Unauthorized: User not found" });
    }

    // if token will be expire then remove token from database
    if (decoded.exp <= Math.floor(Date.now() / 1000)) {
      user.tokens = user.tokens.filter((t) => t !== token);
      await user.save();
      return res
        .status(402)
        .json({ message: "Session expired, please login again" });
    }

    req.user = user;
    req.token = token;
    next();
  } catch (error) {
    return res
      .status(401)
      .json({ message: "Unauthorized: Invalid or expired token" });
  }
};

module.exports = { generateToken, verifyToken };
