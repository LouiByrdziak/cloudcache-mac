/**
 * Verify HMAC signature (e.g., for Shopify webhooks)
 * Uses Web Crypto API for Cloudflare Workers compatibility
 */
export async function verifyHMAC(
  payload: string | ArrayBuffer,
  signature: string,
  secret: string,
  algorithm: string = "SHA-256"
): Promise<boolean> {
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const payloadData = typeof payload === "string" ? encoder.encode(payload) : payload;

    const key = await crypto.subtle.importKey(
      "raw",
      keyData,
      { name: "HMAC", hash: algorithm },
      false,
      ["sign"]
    );

    const signatureBuffer = await crypto.subtle.sign("HMAC", key, payloadData);
    const expectedSignature = arrayBufferToHex(signatureBuffer);

    // Use timing-safe comparison
    return timingSafeEqual(signature.toLowerCase(), expectedSignature.toLowerCase());
  } catch {
    return false;
  }
}

/**
 * Convert ArrayBuffer to hex string
 */
function arrayBufferToHex(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Timing-safe string comparison
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

/**
 * Generate a random nonce (for OAuth state)
 * Uses Web Crypto API
 */
export function generateNonce(length: number = 32): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Validate nonce format
 */
export function validateNonce(nonce: string, minLength: number = 16): boolean {
  return typeof nonce === "string" && nonce.length >= minLength && /^[a-f0-9]+$/i.test(nonce);
}

/**
 * Generate PKCE code verifier and challenge
 */
export interface PKCEPair {
  codeVerifier: string;
  codeChallenge: string;
  codeChallengeMethod: "S256";
}

/**
 * Generate PKCE code verifier (43-128 characters, URL-safe)
 * Uses Web Crypto API
 */
export function generateCodeVerifier(length: number = 43): string {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  // Convert to base64url
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/**
 * Generate PKCE code challenge from verifier
 * Uses Web Crypto API
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const bytes = new Uint8Array(hashBuffer);
  // Convert to base64url
  return btoa(String.fromCharCode(...bytes))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

/**
 * Generate PKCE pair (verifier + challenge)
 */
export async function generatePKCE(): Promise<PKCEPair> {
  const codeVerifier = generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);

  return {
    codeVerifier,
    codeChallenge,
    codeChallengeMethod: "S256",
  };
}

/**
 * Clock skew tolerance helper
 * Check if timestamp is within acceptable range (±5 minutes by default)
 */
export function isWithinClockSkew(timestamp: number, toleranceMinutes: number = 5): boolean {
  const now = Date.now();
  const toleranceMs = toleranceMinutes * 60 * 1000;
  const diff = Math.abs(now - timestamp);
  return diff <= toleranceMs;
}

/**
 * Validate timestamp with clock skew tolerance
 */
export function validateTimestamp(
  timestamp: number | string,
  toleranceMinutes: number = 5
): boolean {
  const ts = typeof timestamp === "string" ? parseInt(timestamp, 10) : timestamp;
  if (isNaN(ts)) {
    return false;
  }
  return isWithinClockSkew(ts, toleranceMinutes);
}
