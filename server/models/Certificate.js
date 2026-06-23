import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const certificateSchema = new mongoose.Schema(
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
    registration: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Registration',
      required: true,
    },
    verificationCode: {
      type: String,
      unique: true,
      default: () => `EVT-${uuidv4().slice(0, 8).toUpperCase()}`,
    },
    issuedAt: {
      type: Date,
      default: Date.now,
    },
    downloadUrl: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      enum: ['participation', 'winner', 'volunteer', 'organizer', 'speaker'],
      default: 'participation',
    },
    position: {
      type: String,
      default: '',
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

certificateSchema.index({ user: 1, event: 1 }, { unique: true });

export default mongoose.model('Certificate', certificateSchema);
