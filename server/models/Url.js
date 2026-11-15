import { Schema, model } from 'mongoose';

const urlSchema = new Schema(
  {
    originalUrl: {
      type: String,
      required: [true, 'Original URL is required'],
      trim: true,
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
    clicks: {
      type: Number,
      default: 0,
    },
    analytics: [
      {
        timestamp: {
          type: Date,
          default: Date.now,
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

