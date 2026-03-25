import { useAuthSafe as useAuth } from "../components/pages/login/useAuthSafe";

/**
 * Custom hook that returns an object of HTTP headers including the Authorization bearer token
 * if the user is logged in. Use this to include authentication in API requests.
 *
 * @returns {Object} Headers object with Authorization and Content-Type
 *
 * @example
 * const headers = useAuthHeaders();
 * const response = await fetch(url, { headers });
 */
export default function useAuthHeaders() {
  const auth = useAuth();
  // Get the access token from the auth userData
  const token = auth?.userData?.access_token;

  // Build headers object
  const headers = {
    "Content-Type": "application/json",
  };

  // If user is authenticated, add the Authorization header with Bearer token
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}
