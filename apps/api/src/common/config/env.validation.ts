import { z } from 'zod';

export const EnvSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().default(4000),
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid PostgreSQL connection URL'),
  REDIS_URL: z.string().min(1, 'REDIS_URL is required'),
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.coerce.number().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  WEB_ORIGIN: z.string().default('http://localhost:3000'),

  // Cryptography & Security
  PASSWORD_PEPPER: z
    .string()
    .min(32, 'PASSWORD_PEPPER must be at least 32 characters'),
  LOGIN_HMAC_KEY: z
    .string()
    .min(32, 'LOGIN_HMAC_KEY must be at least 32 characters'),
  LOGIN_ENC_KEY: z
    .string()
    .min(32, 'LOGIN_ENC_KEY must be at least 32 hex characters (16-32 bytes)'),
  JWT_SECRET: z
    .string()
    .min(32, 'JWT_SECRET must be at least 32 characters'),
  COOKIE_SECRET: z
    .string()
    .min(32, 'COOKIE_SECRET must be at least 32 characters'),

  SEED_DIRECTOR_PASSWORD: z.string().optional(),
  SEED_ZAVUCH_PASSWORD: z.string().optional(),
  SEED_TEACHER_PASSWORD: z.string().optional(),

  THROTTLE_TTL: z.coerce.number().default(60000),
  THROTTLE_LIMIT: z.coerce.number().default(100),
  SESSION_IDLE_TIMEOUT_SECONDS: z.coerce.number().default(1800),
  SESSION_ABSOLUTE_TIMEOUT_SECONDS: z.coerce.number().default(43200),
  MAX_SESSIONS_PER_USER: z.coerce.number().default(3),
});

export type EnvConfig = z.infer<typeof EnvSchema>;

export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const result = EnvSchema.safeParse(config);

  if (!result.success) {
    const errors = result.error.format();
    console.error('❌ FATAL: Environment validation failed:');
    console.error(JSON.stringify(errors, null, 2));
    throw new Error('Invalid environment variables. Application cannot start.');
  }

  return result.data;
}
