const API_BASE = "http://localhost:5000";

function getToken() {
  return localStorage.getItem("unipulse_token");
}

export async function apiRequest(path, { method = "GET", body, headers = {} } = {}) {
  const token = getToken();

  const options = {
    method,
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  };

  if (body instanceof FormData) {
    options.body = body;
    // remove content-type so browser sets boundary
    if (options.headers['Content-Type']) delete options.headers['Content-Type'];
  } else if (body) {
    options.headers['Content-Type'] = 'application/json';
    options.body = JSON.stringify(body);
  }

  try {
    const res = await fetch(`${API_BASE}${path}`, options);

    let data = null;
    const text = await res.text();
    if (text) {
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Failed to parse JSON:', text);
      }
    }

    if (!res.ok) {
      const msg = data?.message || `Request failed (${res.status})`;
      const err = new Error(msg);
      err.status = res.status;
      err.data = data;
      throw err;
    }

    return data;
  } catch (err) {
    // Log network errors
    if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
      console.error('Network error: Server might be down or CORS issue.');
    }
    throw err;
  }
}
