import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    registration: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Registration',
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    scannedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    scannedAt: {
      type: Date,
      default: Date.now,
    },
    method: {
      type: String,
      enum: ['qr', 'manual'],
      default: 'qr',
    },
    location: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

attendanceSchema.index({ event: 1, user: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);
