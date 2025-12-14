import { BACKEND_URL } from "../config/backend";

const LOCAL_URL = "http://127.0.0.1:5000";

export async function backendFetch(path, options) {
  try {
    const res = await fetch(`${BACKEND_URL}${path}`, options);
    if (!res.ok) throw new Error("Render backend failed");
    return res;
  } catch (err) {
    // fallback to local backend (dev/testing only)
    const res = await fetch(`${LOCAL_URL}${path}`, options);
    return res;
  }
}
