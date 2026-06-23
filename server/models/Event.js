import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    banner: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: [
        'hackathon',
        'workshop',
        'seminar',
        'webinar',
        'competition',
        'cultural',
        'sports',
        'volunteer',
        'networking',
        'other',
      ],
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    mode: {
      type: String,
      enum: ['online', 'offline', 'hybrid'],
      default: 'offline',
    },
    venue: {
      type: String,
      default: '',
    },
    meetLink: {
      type: String,
      default: '',
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    registrationDeadline: {
      type: Date,
    },
    capacity: {
      type: Number,
      default: 100,
    },
    registeredCount: {
      type: Number,
      default: 0,
    },
    attendedCount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['draft', 'pending', 'published', 'ongoing', 'completed', 'cancelled'],
      default: 'draft',
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
    },
    prizes: {
      type: [String],
      default: [],
    },
    certificateTemplate: {
      type: String,
      default: 'default',
    },
    requiresTeam: {
      type: Boolean,
      default: false,
    },
    teamSize: {
      min: { type: Number, default: 1 },
      max: { type: Number, default: 1 },
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    rating: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Index for search
eventSchema.index({ title: 'text', description: 'text', tags: 'text' });
eventSchema.index({ category: 1, status: 1, startDate: 1 });

export default mongoose.model('Event', eventSchema);
