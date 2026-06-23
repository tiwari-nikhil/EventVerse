import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, role = 'student', institution, department, year } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
    }

    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ success: false, message: 'Email already registered' });

    const roles = [role];
    if (!['student', 'organizer', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role' });
    }

    const user = await User.create({
      name,
      email,
      password,
      roles,
      activeRole: role,
      institution,
      department,
      year,
    });

    // Welcome notification
    await Notification.create({
      recipient: user._id,
      type: 'system',
      title: 'Welcome to EventVerse! 🎉',
      message: 'Start exploring events and building your portfolio.',
      link: '/events',
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        activeRole: user.activeRole,
        avatar: user.avatar,
        interests: user.interests,
        achievementPoints: user.achievementPoints,
        onboardingComplete: user.onboardingComplete,
        institution: user.institution,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.password) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const match = await user.matchPassword(password);
    if (!match) return res.status(401).json({ success: false, message: 'Invalid credentials' });

    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        roles: user.roles,
        activeRole: user.activeRole,
        avatar: user.avatar,
        interests: user.interests,
        achievementPoints: user.achievementPoints,
        onboardingComplete: user.onboardingComplete,
        institution: user.institution,
        organization: user.organization,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('organization');
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/auth/interests
export const updateInterests = async (req, res) => {
  try {
    const { interests } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { interests, onboardingComplete: true },
      { new: true }
    );
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/auth/profile
export const updateProfile = async (req, res) => {
  try {
    const { name, bio, institution, department, year, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, bio, institution, department, year, avatar },
      { new: true }
    );
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/auth/switch-role
export const switchRole = async (req, res) => {
  try {
    const { role } = req.body;
    if (!req.user.roles.includes(role)) {
      return res.status(403).json({ success: false, message: 'You do not have this role' });
    }
    const user = await User.findByIdAndUpdate(req.user._id, { activeRole: role }, { new: true });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
