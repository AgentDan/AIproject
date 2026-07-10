import mongoose from 'mongoose';

export const USER_ROLES = Object.freeze(['user', 'administrator']);

const userSchema = new mongoose.Schema(
  {
    nickname: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: USER_ROLES, default: 'user' },
    lastLoginAt: { type: Date, default: null }
  },
  { timestamps: true, collection: 'users' }
);

export const User =
  mongoose.models.User || mongoose.model('User', userSchema);
