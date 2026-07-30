export const AUTH_KEYS = [
  'token',
  'userId',
  'userEmail',
  'userMobile',
  'loggedInUser',
  'watchlistType',
];
export const ADMIN_AUTH_KEYS = [
  'adminToken',
  'adminId',
  'adminEmail',
  'adminUsername',
  'loggedInAdmin',
];

export function clearAuthStorage() {
  AUTH_KEYS.forEach((key) => localStorage.removeItem(key));
}

export function clearAdminStorage() {
  ADMIN_AUTH_KEYS.forEach((key) => localStorage.removeItem(key));
}

export async function logoutAdminSession(adminApiClient) {
  try {
    if (adminApiClient) {
      await adminApiClient.post('/auth/admin/logout');
    }
  } catch {
    // Still clear local session if network fails.
  }
  clearAdminStorage();
  sessionStorage.removeItem('leveragex_trader_session_cleared_for_admin');
  const keysToRemove = [];
  for (let i = 0; i < sessionStorage.length; i += 1) {
    const key = sessionStorage.key(i);
    if (key && key.startsWith('leveragex_admin_')) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => sessionStorage.removeItem(key));
  window.dispatchEvent(new CustomEvent('leveragex:admin-session-cleared'));
}

export function setAdminSession({ token, adminId, email, username, fullName }) {
  clearAuthStorage();
  clearAdminStorage();
  localStorage.setItem('adminToken', token);
  localStorage.setItem('adminId', String(adminId));
  localStorage.setItem('adminEmail', email);
  if (username) {
    localStorage.setItem('adminUsername', username);
  }
  localStorage.setItem('loggedInAdmin', fullName || username || email);
}

export async function validateAdminSession(adminApiClient) {
  const token = localStorage.getItem('adminToken');
  if (!token) {
    return false;
  }

  try {
    const response = await adminApiClient.get('/auth/admin/me');
    const { adminId, email, username, fullName } = response.data;
    localStorage.setItem('adminId', String(adminId));
    localStorage.setItem('adminEmail', email);
    if (username) {
      localStorage.setItem('adminUsername', username);
    }
    localStorage.setItem('loggedInAdmin', fullName || username || email);
    return true;
  } catch {
    clearAdminStorage();
    return false;
  }
}

export function setAuthSession({ token, userId, email, fullName, mobile }) {
  clearAdminStorage();
  clearAuthStorage();
  localStorage.setItem('token', token);
  localStorage.setItem('userId', String(userId));
  localStorage.setItem('userEmail', email);
  localStorage.setItem('loggedInUser', fullName);
  localStorage.setItem('watchlistType', '1');
  if (mobile) {
    localStorage.setItem('userMobile', mobile);
  }
}

export async function validateSession(api) {
  const token = localStorage.getItem('token');
  if (!token) {
    return false;
  }

  try {
    const response = await api.get('/auth/me');
    const { userId, email, fullName, mobile } = response.data;

    localStorage.setItem('userId', String(userId));
    localStorage.setItem('userEmail', email);
    localStorage.setItem('loggedInUser', fullName);
    if (mobile) {
      localStorage.setItem('userMobile', mobile);
    }

    return true;
  } catch {
    clearAuthStorage();
    return false;
  }
}
