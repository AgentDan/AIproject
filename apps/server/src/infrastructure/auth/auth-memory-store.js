import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import { isProduction } from '../config/runtime.js';
import { USER_ROLES } from './user-model.js';

const __dirnameAuth = path.dirname(fileURLToPath(import.meta.url));
const serverPackageRoot = path.resolve(__dirnameAuth, '..', '..', '..');

function resolveDevUsersFilePath() {
  const raw = process.env.SERVER_STORAGE_DIR?.trim();
  const storageRoot = raw
    ? path.isAbsolute(raw)
      ? path.normalize(raw)
      : path.resolve(serverPackageRoot, raw)
    : path.join(serverPackageRoot, 'data');
  return path.join(storageRoot, 'dev-users.json');
}

/** @type {Map<string, { id: string, nickname: string, passwordHash: string, role: string, lastLoginAt: string | null }>} */
const usersByNickname = new Map();
let loaded = false;

export function isDevMemoryAuthEnabled() {
  return !isProduction && !process.env.MONGO_URI?.trim();
}

async function persistUsers() {
  const filePath = resolveDevUsersFilePath();
  await mkdir(path.dirname(filePath), { recursive: true });
  const users = Array.from(usersByNickname.values()).map((user) => ({
    id: user.id,
    nickname: user.nickname,
    passwordHash: user.passwordHash,
    role: user.role,
    lastLoginAt: user.lastLoginAt
  }));
  await writeFile(filePath, JSON.stringify({ users }, null, 2), 'utf8');
}

async function ensureLoaded() {
  if (loaded || !isDevMemoryAuthEnabled()) {
    return;
  }
  loaded = true;

  const filePath = resolveDevUsersFilePath();
  try {
    const raw = await readFile(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    for (const user of parsed?.users || []) {
      if (user?.nickname && user?.passwordHash && user?.role) {
        usersByNickname.set(user.nickname, {
          id: user.id || `dev-${user.nickname}`,
          nickname: user.nickname,
          passwordHash: user.passwordHash,
          role: user.role,
          lastLoginAt: user.lastLoginAt || null
        });
      }
    }
  } catch (err) {
    if (err?.code !== 'ENOENT') {
      console.warn('[auth] Failed to load dev-users.json:', err.message);
    }
  }

  if (!usersByNickname.has('admin')) {
    const passwordHash = bcrypt.hashSync('admin', 10);
    usersByNickname.set('admin', {
      id: 'dev-admin',
      nickname: 'admin',
      passwordHash,
      role: 'administrator',
      lastLoginAt: null
    });
    await persistUsers();
    console.warn(
      '[auth] Dev memory store (no MONGO_URI). Default user admin/admin. Users saved to dev-users.json.'
    );
  }
}

export async function memoryRegisterUser({ nickname, password, role = 'user' }) {
  await ensureLoaded();
  const trimmedNickname = String(nickname).trim();
  if (usersByNickname.has(trimmedNickname)) {
    const err = new Error('User with this nickname already exists');
    err.status = 409;
    throw err;
  }
  if (!USER_ROLES.includes(role)) {
    const err = new Error('Invalid role');
    err.status = 400;
    throw err;
  }
  const passwordHash = await bcrypt.hash(String(password), 10);
  usersByNickname.set(trimmedNickname, {
    id: `dev-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    nickname: trimmedNickname,
    passwordHash,
    role,
    lastLoginAt: null
  });
  await persistUsers();
}

export async function memoryListUsers() {
  await ensureLoaded();
  return Array.from(usersByNickname.values()).map((user) => ({
    id: user.id,
    nickname: user.nickname,
    role: user.role,
    createdAt: null,
    lastLoginAt: user.lastLoginAt
  }));
}

export async function memoryLoginUser({ nickname, password }) {
  await ensureLoaded();
  const user = usersByNickname.get(String(nickname).trim());
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
  user.lastLoginAt = new Date().toISOString();
  await persistUsers();
  return {
    user: {
      id: user.id,
      nickname: user.nickname,
      role: user.role
    }
  };
}
