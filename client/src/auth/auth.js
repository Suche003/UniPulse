export function getToken() {
  return localStorage.getItem("unipulse_token");
}

export function getRole() {
  return localStorage.getItem("unipulse_role");
}

export function getUser() {
  const raw = localStorage.getItem("unipulse_user");
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function isLoggedIn() {
  return Boolean(getToken());
}

export function logout() {
  localStorage.removeItem("unipulse_token");
  localStorage.removeItem("unipulse_role");
  localStorage.removeItem("unipulse_user");
}