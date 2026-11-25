import { Schema, model } from 'mongoose';

const urlSchema = new Schema(
  {
    originalUrl: {
      type: String,
      required: [true, 'Original URL is required'],
      trim: true,
    },
    title: {
      type: String,
      trim: true,
      maxlength: 100,
      default: '',
    },
    shortId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customAlias: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    userId: {
      type: String,
      index: true,
      default: null,
    },
    clicks: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    analytics: [
      {
        clickedAt: {
          type: Date,
          default: Date.now,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
        referrer: {
          type: String,
          default: 'Direct / None',
        },
        device: {
          type: String,
          default: 'Desktop',
        },
        userAgent: {
          type: String,
        },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default model('Url', urlSchema);

