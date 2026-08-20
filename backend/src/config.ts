export interface Config {
  port: number;
  nodeEnv: string;
  openaiApiKey: string;
  openaiModel: string;
  deviceTokenSecret: string;
  tokenTtl: number;
  corsOrigins: string;
  logLevel: string;
}

export class ConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ConfigError';
  }
}

function requireEnv(env: Record<string, string | undefined>, name: string): string {
  const value = env[name];
  if (!value) {
    throw new ConfigError(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function loadConfig(env: Record<string, string | undefined> = process.env): Config {
  return {
    port: parseInt(env.PORT || '3000', 10),
    nodeEnv: env.NODE_ENV || 'development',
    openaiApiKey: requireEnv(env, 'OPENAI_API_KEY'),
    openaiModel: env.OPENAI_MODEL || 'gpt-4o',
    deviceTokenSecret: requireEnv(env, 'DEVICE_TOKEN_SECRET'),
    tokenTtl: parseInt(env.TOKEN_TTL_SECONDS || '86400', 10),
    corsOrigins: env.CORS_ORIGINS || '*',
    logLevel: env.LOG_LEVEL || 'info',
  };
}
