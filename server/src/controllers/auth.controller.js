const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

const safeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  phone: user.phone,
  address: user.address,
  role: user.role,
  createdAt: user.createdAt,
});

const createToken = (user) => jwt.sign(
  { id: user._id.toString(), email: user.email, role: user.role },
  process.env.JWT_SECRET || "development-secret-change-me",
  { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
);

const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, address } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }
    if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });

    const normalizedEmail = email.trim().toLowerCase();
    if (await User.findOne({ email: normalizedEmail })) {
      return res.status(409).json({ message: "Email is already registered" });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    // Public registration deliberately always creates a normal user.
    const user = await User.create({ name, email: normalizedEmail, password: hashedPassword, phone, address, role: "user" });
    return res.status(201).json({ token: createToken(user), user: safeUser(user) });
  } catch (error) { next(error); }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password are required" });
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Email or password is incorrect" });
    }
    return res.json({ token: createToken(user), user: safeUser(user) });
  } catch (error) { next(error); }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json({ user: safeUser(user) });
  } catch (error) { next(error); }
};

const createAdmin = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: "Name, email and password are required" });
    if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters" });
    const normalizedEmail = email.trim().toLowerCase();
    if (await User.findOne({ email: normalizedEmail })) return res.status(409).json({ message: "Email is already registered" });
    const user = await User.create({ name, email: normalizedEmail, password: await bcrypt.hash(password, 12), role: "admin" });
    return res.status(201).json({ user: safeUser(user) });
  } catch (error) { next(error); }
};

const adminDashboard = (req, res) => res.json({ message: "Welcome to the admin dashboard", user: req.user });

module.exports = { register, login, getMe, createAdmin, adminDashboard };
