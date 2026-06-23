import mongoose from 'mongoose';

const registrationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
    },
    qrCode: {
      type: String, // base64 or URL
      default: '',
    },
    qrData: {
      type: String, // the encoded JSON string inside QR
      default: '',
    },
    status: {
      type: String,
      enum: ['registered', 'attended', 'cancelled', 'waitlisted'],
      default: 'registered',
    },
    registeredAt: {
      type: Date,
      default: Date.now,
    },
    cancelledAt: {
      type: Date,
    },
    teamName: {
      type: String,
      default: '',
    },
    teamMembers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

// Unique per user per event
registrationSchema.index({ user: 1, event: 1 }, { unique: true });

export default mongoose.model('Registration', registrationSchema);
