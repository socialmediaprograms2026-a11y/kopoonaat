import { auth } from "../lib/firebase";

/**
 * Authenticated Fetch wrapper for Admin API requests.
 * Automatically injects `Authorization: Bearer <Firebase_ID_Token>` when a user is signed in.
 */
export async function adminFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const options: RequestInit = { ...init };
  const headers = new Headers(options.headers || {});

  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const idToken = await currentUser.getIdToken();
      if (idToken) {
        headers.set("Authorization", `Bearer ${idToken}`);
      }
    }
  } catch (err) {
    console.warn("Could not acquire Firebase auth token for admin request:", err);
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
