import Attendance from '../models/Attendance.js';
import Registration from '../models/Registration.js';
import Event from '../models/Event.js';
import Certificate from '../models/Certificate.js';
import Notification from '../models/Notification.js';
import { v4 as uuidv4 } from 'uuid';

// POST /api/attendance/scan
export const scanQR = async (req, res) => {
  try {
    const { qrData, eventId } = req.body;

    let parsed;
    try {
      parsed = JSON.parse(qrData);
    } catch {
      return res.status(400).json({ success: false, message: 'Invalid QR code' });
    }

    const { userId, eventId: qrEventId } = parsed;

    if (qrEventId !== eventId) {
      return res.status(400).json({ success: false, message: 'QR code does not match this event' });
    }

    const registration = await Registration.findOne({ user: userId, event: eventId });
    if (!registration) {
      return res.status(404).json({ success: false, message: 'Registration not found' });
    }
    if (registration.status === 'attended') {
      return res.status(409).json({ success: false, message: 'Already marked as attended' });
    }

    // Create attendance
    const attendance = await Attendance.create({
      registration: registration._id,
      event: eventId,
      user: userId,
      scannedBy: req.user._id,
    });

    // Update registration status
    registration.status = 'attended';
    await registration.save();

    // Increment event attended count
    await Event.findByIdAndUpdate(eventId, { $inc: { attendedCount: 1 } });

    // Auto-generate certificate
    const verificationCode = `EVT-${uuidv4().slice(0, 8).toUpperCase()}`;
    const cert = await Certificate.create({
      user: userId,
      event: eventId,
      registration: registration._id,
      verificationCode,
    });

    // Notification to student
    await Notification.create({
      recipient: userId,
      type: 'certificate_ready',
      title: 'Certificate Ready! 🎓',
      message: 'Your participation certificate is ready to download.',
      link: `/portfolio`,
      relatedEvent: eventId,
    });

    res.json({ success: true, attendance, certificate: cert });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ success: false, message: 'Already attended' });
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/attendance/:eventId
export const getEventAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.find({ event: req.params.eventId })
      .populate('user', 'name email avatar institution department')
      .sort('-scannedAt');
    res.json({ success: true, attendance, total: attendance.length });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/attendance/manual
export const manualAttendance = async (req, res) => {
  try {
    const { userId, eventId } = req.body;
    const registration = await Registration.findOne({ user: userId, event: eventId });
    if (!registration) return res.status(404).json({ success: false, message: 'Registration not found' });

    const attendance = await Attendance.create({
      registration: registration._id,
      event: eventId,
      user: userId,
      scannedBy: req.user._id,
      method: 'manual',
    });

    registration.status = 'attended';
    await registration.save();
    await Event.findByIdAndUpdate(eventId, { $inc: { attendedCount: 1 } });

    res.json({ success: true, attendance });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ success: false, message: 'Already attended' });
    res.status(500).json({ success: false, message: err.message });
  }
};
