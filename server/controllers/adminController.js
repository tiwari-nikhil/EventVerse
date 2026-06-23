import User from '../models/User.js';
import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import OrganizerRequest from '../models/OrganizerRequest.js';
import Organization from '../models/Organization.js';
import Certificate from '../models/Certificate.js';
import Notification from '../models/Notification.js';

// GET /api/admin/stats
export const getPlatformStats = async (req, res) => {
  try {
    const [
      totalUsers, totalStudents, totalOrganizers, totalEvents,
      publishedEvents, totalRegistrations, totalCertificates, pendingRequests
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ roles: 'student' }),
      User.countDocuments({ roles: 'organizer' }),
      Event.countDocuments(),
      Event.countDocuments({ status: 'published' }),
      Registration.countDocuments(),
      Certificate.countDocuments(),
      OrganizerRequest.countDocuments({ status: 'pending' }),
    ]);

    res.json({
      success: true,
      stats: {
        totalUsers, totalStudents, totalOrganizers, totalEvents,
        publishedEvents, totalRegistrations, totalCertificates, pendingRequests
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/users
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, role, search } = req.query;
    const filter = {};
    if (role) filter.roles = role;
    if (search) filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ];
    const skip = (Number(page) - 1) * Number(limit);
    const [users, total] = await Promise.all([
      User.find(filter).sort('-createdAt').skip(skip).limit(Number(limit)),
      User.countDocuments(filter),
    ]);
    res.json({ success: true, users, total });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/admin/users/:id/toggle
export const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/organizer-requests
export const getOrganizerRequests = async (req, res) => {
  try {
    const { status = 'pending' } = req.query;
    const requests = await OrganizerRequest.find({ status })
      .populate('user', 'name email avatar institution')
      .sort('-createdAt');
    res.json({ success: true, requests });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/admin/organizer-requests
export const submitOrganizerRequest = async (req, res) => {
  try {
    const existing = await OrganizerRequest.findOne({ user: req.user._id, status: 'pending' });
    if (existing) return res.status(409).json({ success: false, message: 'You already have a pending request' });

    const request = await OrganizerRequest.create({ ...req.body, user: req.user._id });
    res.status(201).json({ success: true, request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/admin/organizer-requests/:id/approve
export const approveOrganizerRequest = async (req, res) => {
  try {
    const request = await OrganizerRequest.findById(req.params.id).populate('user');
    if (!request) return res.status(404).json({ success: false, message: 'Request not found' });

    // Create organization
    const org = await Organization.create({
      name: request.organizationName,
      type: request.organizationType,
      category: request.category,
      description: request.description,
      institution: request.institution,
      website: request.website,
      owner: request.user._id,
      isVerified: true,
    });

    // Update user roles
    const user = await User.findById(request.user._id);
    if (!user.roles.includes('organizer')) user.roles.push('organizer');
    user.organization = org._id;
    await user.save();

    // Update request
    request.status = 'approved';
    request.reviewedBy = req.user._id;
    request.reviewedAt = new Date();
    request.createdOrganization = org._id;
    await request.save();

    // Notify user
    await Notification.create({
      recipient: request.user._id,
      type: 'organizer_approved',
      title: 'Organizer Request Approved! 🎉',
      message: `Your organization "${org.name}" has been verified. You can now create events.`,
      link: '/organizer/dashboard',
    });

    res.json({ success: true, organization: org, request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/admin/organizer-requests/:id/reject
export const rejectOrganizerRequest = async (req, res) => {
  try {
    const { reviewNote } = req.body;
    const request = await OrganizerRequest.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', reviewedBy: req.user._id, reviewedAt: new Date(), reviewNote },
      { new: true }
    ).populate('user');

    await Notification.create({
      recipient: request.user._id,
      type: 'organizer_rejected',
      title: 'Organizer Request Rejected',
      message: reviewNote || 'Your organizer request was not approved at this time.',
    });

    res.json({ success: true, request });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/admin/events
export const getAllEvents = async (req, res) => {
  try {
    const events = await Event.find()
      .populate('organizer', 'name email')
      .sort('-createdAt')
      .limit(50);
    res.json({ success: true, events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
