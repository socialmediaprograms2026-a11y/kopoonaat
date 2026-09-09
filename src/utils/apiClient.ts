import { auth } from "../lib/firebase";

const ADMIN_KEY_STORAGE_KEY = "admin_api_key";

export function getStoredAdminKey(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(ADMIN_KEY_STORAGE_KEY) || localStorage.getItem(ADMIN_KEY_STORAGE_KEY) || null;
  } catch {
    return null;
  }
}

export function setStoredAdminKey(key: string, persistInLocalStorage = false): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(ADMIN_KEY_STORAGE_KEY, key.trim());
    if (persistInLocalStorage) {
      localStorage.setItem(ADMIN_KEY_STORAGE_KEY, key.trim());
    }
  } catch (err) {
    console.warn("Could not save admin key to storage:", err);
  }
}

export function clearStoredAdminKey(): void {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(ADMIN_KEY_STORAGE_KEY);
    localStorage.removeItem(ADMIN_KEY_STORAGE_KEY);
  } catch (err) {
    console.warn("Could not clear admin key from storage:", err);
  }
}

/**
 * Authenticated Fetch wrapper for Admin API requests.
 * Automatically injects `Authorization: Bearer <Firebase_ID_Token>` or `x-admin-key: <Key>`.
 */
export async function adminFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const options: RequestInit = { ...init };
  const headers = new Headers(options.headers || {});

  let hasAuth = false;

  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const idToken = await currentUser.getIdToken();
      if (idToken) {
        headers.set("Authorization", `Bearer ${idToken}`);
        hasAuth = true;
      }
    }
  } catch (err) {
    console.warn("Could not acquire Firebase auth token for admin request:", err);
  }

  // If no Firebase ID token, check if user provided an Admin Key
  if (!hasAuth) {
    const storedKey = getStoredAdminKey();
    if (storedKey) {
      headers.set("x-admin-key", storedKey);
      headers.set("Authorization", `Bearer ${storedKey}`);
    }
  }

  // Ensure JSON content-type if body is object or string and not set
  if (options.body && typeof options.body === "string" && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  options.headers = headers;
  return fetch(input, options);
}

/**
 * Helper to fetch JSON with automatic auth token injection
 */
export async function adminFetchJson<T = any>(input: RequestInfo | URL, init?: RequestInit): Promise<T> {
  const response = await adminFetch(input, init);
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = errorBody?.message || errorBody?.error || `HTTP error ${response.status}`;
    const error = new Error(message);
    (error as any).status = response.status;
    (error as any).response = response;
    throw error;
  }
  return response.json();
}
