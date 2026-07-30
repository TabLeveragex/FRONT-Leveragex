import { Navigate, useLocation } from 'react-router-dom';
import {
  assertNoTraderSessionForAdmin,
  hasAdminSession,
  TRADER_ADMIN_CONFLICT_MESSAGE,
} from '../utils/sessionManager';

function AdminPortalGate({ element }) {
  const location = useLocation();
  const traderConflict = assertNoTraderSessionForAdmin();

  if (traderConflict.blocked) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{
          traderSessionCleared: true,
          message: TRADER_ADMIN_CONFLICT_MESSAGE,
          from: location.pathname,
        }}
      />
    );
  }

  if (!hasAdminSession()) {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return element;
}

export default AdminPortalGate;
