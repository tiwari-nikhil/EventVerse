import Registration from '../models/Registration.js';
import Event from '../models/Event.js';
import Notification from '../models/Notification.js';
import QRCode from 'qrcode';

// POST /api/registrations
export const registerForEvent = async (req, res) => {
  try {
    const { eventId, teamName, teamMembers } = req.body;
    const userId = req.user._id;

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });
    if (event.status !== 'published') {
      return res.status(400).json({ success: false, message: 'Event is not open for registration' });
    }
    if (event.registeredCount >= event.capacity) {
      return res.status(400).json({ success: false, message: 'Event is full' });
    }
    if (event.registrationDeadline && new Date() > event.registrationDeadline) {
      return res.status(400).json({ success: false, message: 'Registration deadline passed' });
    }

    const existing = await Registration.findOne({ user: userId, event: eventId });
    if (existing) return res.status(409).json({ success: false, message: 'Already registered for this event' });

    // Generate QR data
    const qrData = JSON.stringify({
      userId: userId.toString(),
      eventId: eventId.toString(),
      timestamp: Date.now(),
    });

    // Generate QR code image (base64)
    const qrCode = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2,
      color: { dark: '#1e1b4b', light: '#f5f3ff' },
    });

    const registration = await Registration.create({
      user: userId,
      event: eventId,
      qrCode,
      qrData,
      teamName,
      teamMembers,
    });

    // Increment event count
    await Event.findByIdAndUpdate(eventId, { $inc: { registeredCount: 1 } });

    // Notification
    await Notification.create({
      recipient: userId,
      type: 'event_registered',
      title: `Registered for ${event.title}`,
      message: `Your spot is confirmed! Show your QR pass at the event.`,
      link: `/registrations/${registration._id}/qr`,
      relatedEvent: eventId,
    });

    res.status(201).json({ success: true, registration });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ success: false, message: 'Already registered' });
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/registrations/my
export const getMyRegistrations = async (req, res) => {
  try {
    const registrations = await Registration.find({ user: req.user._id })
      .populate('event', 'title banner category startDate endDate status venue mode')
      .sort('-createdAt');
    res.json({ success: true, registrations });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/registrations/:id
export const getRegistration = async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.id)
      .populate('event', 'title banner category startDate endDate venue mode organizer')
      .populate('user', 'name email avatar');
    if (!reg) return res.status(404).json({ success: false, message: 'Registration not found' });
    if (reg.user._id.toString() !== req.user._id.toString() && !req.user.roles.includes('admin')) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    res.json({ success: true, registration: reg });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// DELETE /api/registrations/:id (cancel)
export const cancelRegistration = async (req, res) => {
  try {
    const reg = await Registration.findById(req.params.id);
    if (!reg) return res.status(404).json({ success: false, message: 'Not found' });
    if (reg.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    reg.status = 'cancelled';
    reg.cancelledAt = new Date();
    await reg.save();
    await Event.findByIdAndUpdate(reg.event, { $inc: { registeredCount: -1 } });
    res.json({ success: true, message: 'Registration cancelled' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
