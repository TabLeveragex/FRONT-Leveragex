import {
  AUTH_KEYS,
  ADMIN_AUTH_KEYS,
  clearAuthStorage,
  clearAdminStorage,
} from './authStorage';

export const TRADER_ADMIN_CONFLICT_MESSAGE =
  'Please log out of the Trader Dashboard before attempting to access the Admin Portal.';

export const ADMIN_TRADER_CONFLICT_MESSAGE =
  'Please log out of the Admin Portal before accessing the Trader Dashboard.';

export const TRADER_SESSION_CLEARED_FLAG = 'leveragex_trader_session_cleared_for_admin';

export const ADMIN_PATHS = ['/admin', '/admin/login', '/dashboard', '/putbalance'];

export const TRADER_SESSION_EVENT = 'leveragex:trader-session-cleared';
export const ADMIN_SESSION_EVENT = 'leveragex:admin-session-cleared';

export function isAdminPath(pathname = '') {
  return ADMIN_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );
}

export function hasTraderSession() {
  return Boolean(localStorage.getItem('token'));
}

export function hasAdminSession() {
  return Boolean(localStorage.getItem('adminToken'));
}

export function hasConcurrentSessions() {
  return hasTraderSession() && hasAdminSession();
}

function clearSessionStorageByPrefix(prefix) {
  const keysToRemove = [];
  for (let i = 0; i < sessionStorage.length; i += 1) {
    const key = sessionStorage.key(i);
    if (key && key.startsWith(prefix)) {
      keysToRemove.push(key);
    }
  }
  keysToRemove.forEach((key) => sessionStorage.removeItem(key));
}

export function clearTraderSessionFully() {
  clearAuthStorage();
  localStorage.removeItem('adminTrendControlsEnabled');
  clearSessionStorageByPrefix('leveragex_trader_');
  window.dispatchEvent(new CustomEvent(TRADER_SESSION_EVENT));
}

export function clearAdminSessionFully() {
  if (hasAdminSession()) {
    import('../config/adminApi').then((module) => {
      module.default.post('/auth/admin/logout').catch(() => {});
    });
  }
  clearAdminStorage();
  sessionStorage.removeItem(TRADER_SESSION_CLEARED_FLAG);
  clearSessionStorageByPrefix('leveragex_admin_');
  window.dispatchEvent(new CustomEvent(ADMIN_SESSION_EVENT));
}

export function consumeTraderSessionClearedFlag() {
  const wasCleared = sessionStorage.getItem(TRADER_SESSION_CLEARED_FLAG) === 'true';
  sessionStorage.removeItem(TRADER_SESSION_CLEARED_FLAG);
  return wasCleared;
}

export function markTraderSessionClearedForAdmin() {
  sessionStorage.setItem(TRADER_SESSION_CLEARED_FLAG, 'true');
}

export function terminateTraderSessionForAdminPortal() {
  const hadTraderSession = hasTraderSession();
  if (!hadTraderSession) {
    return { hadTraderSession: false };
  }

  clearTraderSessionFully();
  markTraderSessionClearedForAdmin();
  return { hadTraderSession: true };
}

export function terminateAdminSessionForTraderPortal() {
  const hadAdminSession = hasAdminSession();
  if (!hadAdminSession) {
    return { hadAdminSession: false };
  }

  clearAdminSessionFully();
  return { hadAdminSession: true };
}

export function assertNoTraderSessionForAdmin() {
  if (hasTraderSession()) {
    terminateTraderSessionForAdminPortal();
    return { blocked: true, message: TRADER_ADMIN_CONFLICT_MESSAGE };
  }
  return { blocked: false };
}

export function assertNoAdminSessionForTrader() {
  if (hasAdminSession()) {
    terminateAdminSessionForTraderPortal();
    return { blocked: true, message: ADMIN_TRADER_CONFLICT_MESSAGE };
  }
  return { blocked: false };
}
