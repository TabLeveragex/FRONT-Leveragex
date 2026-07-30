import { Navigate, useLocation } from 'react-router-dom';
import {
  assertNoAdminSessionForTrader,
  hasTraderSession,
  ADMIN_TRADER_CONFLICT_MESSAGE,
} from '../utils/sessionManager';

function TraderPortalGate({ element }) {
  const location = useLocation();
  const adminConflict = assertNoAdminSessionForTrader();

  if (adminConflict.blocked) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          adminSessionCleared: true,
          message: ADMIN_TRADER_CONFLICT_MESSAGE,
          from: location.pathname,
        }}
      />
    );
  }

  if (!hasTraderSession()) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return element;
}

export default TraderPortalGate;
