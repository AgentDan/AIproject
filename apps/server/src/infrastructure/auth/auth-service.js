import bcrypt from 'bcryptjs';
import { isMongoReady } from '../db/connect-mongo.js';
import {
  isDevMemoryAuthEnabled,
  memoryLoginUser,
  memoryRegisterUser
} from './auth-memory-store.js';
import { signAccessToken } from './jwt.js';
import { USER_ROLES, User } from './user-model.js';

export function isAuthReady() {
  return isMongoReady() || isDevMemoryAuthEnabled();
}

export async function registerUser({ nickname, password, role = 'user' }) {
  if (!nickname || !password) {
    const err = new Error('Nickname and password are required');
    err.status = 400;
    throw err;
  }

  const trimmedNickname = String(nickname).trim();
  if (!trimmedNickname) {
    const err = new Error('Nickname is required');
    err.status = 400;
    throw err;
  }

  if (String(password).length < 1) {
    const err = new Error('Password must be at least 1 character');
    err.status = 400;
    throw err;
  }

  if (!USER_ROLES.includes(role)) {
    const err = new Error('Invalid role');
    err.status = 400;
    throw err;
  }

  if (isDevMemoryAuthEnabled()) {
    await memoryRegisterUser({ nickname: trimmedNickname, password, role });
    return;
  }

  const existing = await User.findOne({ nickname: trimmedNickname });
  if (existing) {
    const err = new Error('User with this nickname already exists');
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(String(password), 10);
  await User.create({ nickname: trimmedNickname, passwordHash, role });
}

export async function loginUser({ nickname, password }) {
  if (!nickname || !password) {
    const err = new Error('Nickname and password are required');
    err.status = 400;
    throw err;
  }

  let userRecord;

  if (isDevMemoryAuthEnabled()) {
    const { user } = await memoryLoginUser({ nickname, password });
    userRecord = user;
  } else {
    const user = await User.findOne({ nickname: String(nickname).trim() });
    if (!user) {
      const err = new Error('Invalid nickname or password');
      err.status = 401;
      throw err;
    }

    const match = await bcrypt.compare(String(password), user.passwordHash);
    if (!match) {
      const err = new Error('Invalid nickname or password');
      err.status = 401;
      throw err;
    }

    user.lastLoginAt = new Date();
    await user.save();
    userRecord = {
      id: user._id.toString(),
      nickname: user.nickname,
      role: user.role
    };
  }

  return {
    user: userRecord,
    token: signAccessToken({
      id: userRecord.id,
      nickname: userRecord.nickname,
      role: userRecord.role
    })
  };
}
