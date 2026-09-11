import { z } from "zod";

/**
 * Environment configuration schema for RUXS.
 * Validates required configuration with sensible fallbacks for development.
 */
export const EnvSchema = z.object({
  APP_ENV: z.enum(["development", "staging", "production"]).default("development"),
  PRIMARY_DOMAIN: z.string().default("ruxs.in"),
  DEFAULT_TIMEZONE: z.string().default("Asia/Kolkata"),
  
  // Database configuration (optional in local dev before step 03)
  DATABASE_URL: z.string().url().optional(),
  
  // Redis configuration for locks & idempotency
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().min(1).optional(),
  
  // WhatsApp Meta Cloud API
  WHATSAPP_ACCESS_TOKEN: z.string().min(1).optional(),
  WHATSAPP_APP_SECRET: z.string().min(1).optional(),
  WHATSAPP_PHONE_NUMBER_ID: z.string().min(1).optional(),
  
  // Authentication
  JWT_SIGNING_SECRET: z.string().min(16).default("dev-secret-key-must-be-at-least-16-chars"),
});

export type EnvConfig = z.infer<typeof EnvSchema>;

let cachedEnv: EnvConfig | null = null;

export function getEnv(overrideEnv?: Record<string, string | undefined>): EnvConfig {
  if (cachedEnv && !overrideEnv) return cachedEnv;

  const rawEnv = overrideEnv || (typeof process !== "undefined" ? process.env : {});
  const parsed = EnvSchema.safeParse(rawEnv);

  if (!parsed.success) {
    console.error("Environment Configuration Validation Failed:", parsed.error.format());
    throw new Error("Invalid runtime environment configuration");
  }

  if (!overrideEnv) {
    cachedEnv = parsed.data;
  }

  return parsed.data;
}
