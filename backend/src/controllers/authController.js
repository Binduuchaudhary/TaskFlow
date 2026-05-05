const User = require("../models/User");
const asyncHandler = require("../utils/asyncHandler");
const generateToken = require("../utils/generateToken");

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  createdAt: user.createdAt
});

const signup = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    res.status(409);
    throw new Error("Email already registered");
  }

  const user = await User.create({
    name,
    email,
    password,
    role: role || "member"
  });

  res.status(201).json({
    user: sanitizeUser(user),
    token: generateToken(user._id)
  });
});

const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.matchPassword(password))) {
    res.status(401);
    throw new Error("Invalid email or password");
  }

  res.json({
    user: sanitizeUser(user),
    token: generateToken(user._id)
  });
});

const me = asyncHandler(async (req, res) => {
  res.json({ user: sanitizeUser(req.user) });
});


const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select("+password");

  if (!user) {
    res.status(404);
    throw new Error("User not found");
  }

  const isMatch = await user.matchPassword(currentPassword);

  if (!isMatch) {
    res.status(400);
    throw new Error("Current password is incorrect");
  }

  if (currentPassword === newPassword) {
    res.status(400);
    throw new Error("New password must be different from current password");
  }

  user.password = newPassword;
  await user.save();

  res.json({ message: "Password changed successfully" });
});


module.exports = { changePassword, login, me, signup };

