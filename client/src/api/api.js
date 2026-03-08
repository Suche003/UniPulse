const API_BASE = "http://localhost:5000";

function getToken() {
  return localStorage.getItem("unipulse_token");
}

/**
 * Generic request helper with JWT
 */
export async function apiRequest(path, { method = "GET", body, headers } = {}) {
  const token = getToken();

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers || {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  // If backend returns empty body sometimes, this avoids crash
  const text = await res.text();
  const data = text ? JSON.parse(text) : null;

  if (!res.ok) {
    const msg =
      data?.message ||
      (data?.errors ? data.errors.map((e) => e.msg).join(", ") : "") ||
      `Request failed (${res.status})`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}