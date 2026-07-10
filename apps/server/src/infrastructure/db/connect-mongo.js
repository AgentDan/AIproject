import mongoose from 'mongoose';

let connected = false;

/** Подключение к MongoDB, если задан MONGO_URI (иначе auth/admin недоступны). */
export async function connectMongo() {
  const uri = process.env.MONGO_URI?.trim();
  if (!uri) {
    console.warn('[db] MONGO_URI не задан — /api/auth и /api/admin/users отключены');
    return false;
  }
  if (connected) {
    return true;
  }
  await mongoose.connect(uri);
  connected = true;
  console.log('[db] MongoDB подключена');
  return true;
}

export function isMongoReady() {
  return connected && mongoose.connection.readyState === 1;
}
