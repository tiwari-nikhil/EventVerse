import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import Notification from '../models/Notification.js';

// GET /api/events
export const getEvents = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      mode,
      status = 'published',
      search,
      sort = '-createdAt',
      interests,
    } = req.query;

    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (mode) filter.mode = mode;
    if (search) filter.$text = { $search: search };
    if (interests) {
      const interestArr = interests.split(',');
      filter.tags = { $in: interestArr };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [events, total] = await Promise.all([
      Event.find(filter)
        .populate('organizer', 'name avatar')
        .populate('organization', 'name logo')
        .sort(sort)
        .skip(skip)
        .limit(Number(limit)),
      Event.countDocuments(filter),
    ]);

    res.json({ success: true, events, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/events/:id
export const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate('organizer', 'name avatar email institution')
      .populate('organization', 'name logo description');
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    res.json({ success: true, event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/events
export const createEvent = async (req, res) => {
  try {
    const event = await Event.create({ ...req.body, organizer: req.user._id, status: 'draft' });
    res.status(201).json({ success: true, event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/events/:id
export const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    const isOwner = event.organizer.toString() === req.user._id.toString();
    const isAdmin = req.user.roles.includes('admin');
    if (!isOwner && !isAdmin) return res.status(403).json({ success: false, message: 'Not authorized' });

    const updated = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, event: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/events/:id/publish
export const publishEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    const isOwner = event.organizer.toString() === req.user._id.toString();
    const isAdmin = req.user.roles.includes('admin');
    if (!isOwner && !isAdmin) return res.status(403).json({ success: false, message: 'Not authorized' });

    event.status = 'published';
    await event.save();
    res.json({ success: true, event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/events/:id
export const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    const isOwner = event.organizer.toString() === req.user._id.toString();
    const isAdmin = req.user.roles.includes('admin');
    if (!isOwner && !isAdmin) return res.status(403).json({ success: false, message: 'Not authorized' });

    await event.deleteOne();
    res.json({ success: true, message: 'Event deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/events/organizer/my
export const getOrganizerEvents = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user._id }).sort('-createdAt');
    res.json({ success: true, events });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/events/:id/participants
export const getEventParticipants = async (req, res) => {
  try {
    const registrations = await Registration.find({ event: req.params.id })
      .populate('user', 'name email avatar institution department year');
    res.json({ success: true, registrations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PATCH /api/events/:id/complete
export const completeEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndUpdate(req.params.id, { status: 'completed' }, { new: true });
    res.json({ success: true, event });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
