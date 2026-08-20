function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  openaiApiKey: requireEnv('OPENAI_API_KEY'),
  openaiModel: process.env.OPENAI_MODEL || 'gpt-4o',
  deviceTokenSecret: requireEnv('DEVICE_TOKEN_SECRET'),
  tokenTtl: parseInt(process.env.TOKEN_TTL_SECONDS || '86400', 10),
  corsOrigins: process.env.CORS_ORIGINS || '*',
  logLevel: process.env.LOG_LEVEL || 'info',
};
