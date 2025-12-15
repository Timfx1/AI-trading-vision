const RENDER_URL = "https://ai-trading-vision-1.onrender.com";
const LOCAL_URL = "http://127.0.0.1:5000";

/**
 * Decide backend at runtime:
 * - In production → Render
 * - In local dev → localhost
 * - If Render is unreachable → fallback to localhost
 */
export const BACKEND_URL =
  process.env.NODE_ENV === "production"
    ? RENDER_URL
    : LOCAL_URL;
