import { z } from "zod";

/**
 * Environment schema for APP module (Hono Worker)
 */
export const AppEnvSchema = z
  .object({
    APP_KV: z.any(), // KV Namespace binding
    SHOPIFY_API_KEY: z.string().min(1, "SHOPIFY_API_KEY is required"),
    SHOPIFY_API_SECRET: z.string().min(1, "SHOPIFY_API_SECRET is required"),
    CF_ACCESS_CLIENT_ID: z.string().min(1, "CF_ACCESS_CLIENT_ID is required"),
    CF_ACCESS_CLIENT_SECRET: z.string().min(1, "CF_ACCESS_CLIENT_SECRET is required"),
    CF_API_TOKEN: z.string().optional(),
    CF_ACCOUNT_ID: z.string().optional(),
    CF_ZONE_ID: z.string().optional(),
  })
  .passthrough();

export type AppEnv = z.infer<typeof AppEnvSchema>;

/**
 * Environment schema for ADMIN module (Hono Worker)
 */
export const AdminEnvSchema = z
  .object({
    CF_ACCESS_CLIENT_ID: z.string().min(1, "CF_ACCESS_CLIENT_ID is required"),
    CF_ACCESS_CLIENT_SECRET: z.string().min(1, "CF_ACCESS_CLIENT_SECRET is required"),
  })
  .passthrough();

export type AdminEnv = z.infer<typeof AdminEnvSchema>;

/**
 * Environment schema for APEX module (Astro Pages SSR)
 */
export const ApexEnvSchema = z
  .object({
    CF_ACCESS_CLIENT_ID: z.string().min(1, "CF_ACCESS_CLIENT_ID is required"),
    CF_ACCESS_CLIENT_SECRET: z.string().min(1, "CF_ACCESS_CLIENT_SECRET is required"),
  })
  .passthrough();

export type ApexEnv = z.infer<typeof ApexEnvSchema>;

/**
 * Get and validate environment variables against a schema
 * Fails fast on boot if required bindings are missing
 */
export function getEnv<T>(schema: z.ZodSchema<T>, env: unknown): T {
  try {
    return schema.parse(env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missing = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
      throw new Error(`Environment validation failed: ${missing}`);
    }
    throw error;
  }
}

/**
 * Safe getEnv that returns undefined instead of throwing
 */
export function getEnvSafe<T>(schema: z.ZodSchema<T>, env: unknown): T | undefined {
  try {
    return schema.parse(env);
  } catch {
    return undefined;
  }
}
