export function saveToken(token) {
  localStorage.setItem('token', token);
}

export function getToken() {
  return localStorage.getItem('token');
}

export function removeToken() {
  localStorage.removeItem('token');
}

export function decodeToken(token) {
  try {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

export function getUserFromToken() {
  const t = getToken();
  return t ? decodeToken(t) : null;
}

export function isAuthenticated() {
  return !!getToken();
}

export const getUsersByRole = async (api, role) => {
  const res = await api.get(`/api/profile/roles/${role}`);
  return res.data;
}