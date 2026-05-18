
export const nodeEnv = process.env.NODE_ENV ?? 'development';
export const isProduction = nodeEnv === 'production';
export const isDevelopment = !isProduction;

export function runtimeLabel() {
  return isProduction ? 'production' : 'development';
}

export function corsAllowOrigin() {
  if (!isProduction) return '*';
  const origin = process.env.CORS_ORIGIN?.trim();
  return origin || '*';
}
