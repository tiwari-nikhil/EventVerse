import mongoose from 'mongoose';

const organizerRequestSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    organizationName: {
      type: String,
      required: true,
    },
    organizationType: {
      type: String,
      enum: ['club', 'society', 'cell', 'department', 'ngo', 'other'],
      default: 'club',
    },
    category: {
      type: String,
      enum: ['technical', 'cultural', 'sports', 'social', 'academic', 'other'],
      default: 'technical',
    },
    description: {
      type: String,
      required: true,
    },
    institution: {
      type: String,
      required: true,
    },
    website: {
      type: String,
      default: '',
    },
    socialLinks: {
      instagram: { type: String, default: '' },
      linkedin: { type: String, default: '' },
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reviewedAt: {
      type: Date,
    },
    reviewNote: {
      type: String,
      default: '',
    },
    createdOrganization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model('OrganizerRequest', organizerRequestSchema);
