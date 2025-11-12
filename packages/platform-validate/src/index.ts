import { z } from 'zod';

/**
 * OAuth callback query parameters schema
 */
export const OAuthCallbackSchema = z.object({
  code: z.string().min(1, 'Authorization code is required'),
  state: z.string().min(1, 'State parameter is required'),
  shop: z.string().optional(),
  hmac: z.string().optional(),
  timestamp: z.string().optional(),
});

export type OAuthCallback = z.infer<typeof OAuthCallbackSchema>;

/**
 * Validate OAuth callback parameters
 */
export function validateOAuthCallback(params: unknown): OAuthCallback {
  try {
    return OAuthCallbackSchema.parse(params);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new Error(`OAuth callback validation failed: ${details}`);
    }
    throw error;
  }
}

/**
 * Shopify webhook payload schema (basic structure)
 */
export const ShopifyWebhookSchema = z.object({
  id: z.number().optional(),
  shop: z.string().optional(),
  topic: z.string().optional(),
  data: z.unknown().optional(),
});

export type ShopifyWebhook = z.infer<typeof ShopifyWebhookSchema>;

/**
 * Validate Shopify webhook payload
 */
export function validateWebhookPayload(payload: unknown): ShopifyWebhook {
  try {
    return ShopifyWebhookSchema.parse(payload);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new Error(`Webhook payload validation failed: ${details}`);
    }
    throw error;
  }
}

/**
 * Generic validation helper with typed errors
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const details = error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join(', ');
      throw new Error(`Validation failed: ${details}`);
    }
    throw error;
  }
}

