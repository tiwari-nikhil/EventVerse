import Event from '../models/Event.js';
import Registration from '../models/Registration.js';
import Attendance from '../models/Attendance.js';
import Certificate from '../models/Certificate.js';

// GET /api/analytics/:eventId
export const getEventAnalytics = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ success: false, message: 'Event not found' });

    const [registrations, attendance, certificates] = await Promise.all([
      Registration.find({ event: eventId }),
      Attendance.find({ event: eventId }).populate('user', 'name department year'),
      Certificate.find({ event: eventId }),
    ]);

    const attendanceRate = registrations.length
      ? Math.round((attendance.length / registrations.length) * 100)
      : 0;

    // Breakdown by department
    const deptBreakdown = {};
    attendance.forEach((a) => {
      const dept = a.user?.department || 'Unknown';
      deptBreakdown[dept] = (deptBreakdown[dept] || 0) + 1;
    });

    // Breakdown by year
    const yearBreakdown = {};
    attendance.forEach((a) => {
      const year = a.user?.year || 'Unknown';
      yearBreakdown[year] = (yearBreakdown[year] || 0) + 1;
    });

    // Hourly scan pattern
    const hourlyScans = {};
    attendance.forEach((a) => {
      const hour = new Date(a.scannedAt).getHours();
      hourlyScans[hour] = (hourlyScans[hour] || 0) + 1;
    });
    const hourlyData = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i}:00`,
      scans: hourlyScans[i] || 0,
    }));

    res.json({
      success: true,
      analytics: {
        eventId,
        title: event.title,
        totalRegistrations: registrations.length,
        totalAttended: attendance.length,
        totalCertificates: certificates.length,
        attendanceRate,
        capacity: event.capacity,
        fillRate: Math.round((registrations.length / event.capacity) * 100),
        deptBreakdown: Object.entries(deptBreakdown).map(([dept, count]) => ({ dept, count })),
        yearBreakdown: Object.entries(yearBreakdown).map(([year, count]) => ({ year, count })),
        hourlyScans: hourlyData,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/analytics/organizer/summary
export const getOrganizerSummary = async (req, res) => {
  try {
    const events = await Event.find({ organizer: req.user._id });
    const eventIds = events.map((e) => e._id);

    const [totalRegs, totalAttended, totalCerts] = await Promise.all([
      Registration.countDocuments({ event: { $in: eventIds } }),
      Attendance.countDocuments({ event: { $in: eventIds } }),
      Certificate.countDocuments({ event: { $in: eventIds } }),
    ]);

    const eventsWithStats = events.map((e) => ({
      _id: e._id,
      title: e.title,
      status: e.status,
      startDate: e.startDate,
      registeredCount: e.registeredCount,
      attendedCount: e.attendedCount,
      capacity: e.capacity,
      category: e.category,
    }));

    res.json({
      success: true,
      summary: {
        totalEvents: events.length,
        publishedEvents: events.filter((e) => e.status === 'published').length,
        draftEvents: events.filter((e) => e.status === 'draft').length,
        completedEvents: events.filter((e) => e.status === 'completed').length,
        totalRegistrations: totalRegs,
        totalAttended,
        totalCertificates: totalCerts,
        events: eventsWithStats,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
