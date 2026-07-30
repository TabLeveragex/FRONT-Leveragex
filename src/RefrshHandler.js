import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from './config/api';
import { clearAuthStorage, validateSession } from './utils/authStorage';
import {
  isAdminPath,
  terminateTraderSessionForAdminPortal,
} from './utils/sessionManager';

function RefrshHandler({ setIsAuthenticated }) {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const checkSession = async () => {
      if (isAdminPath(location.pathname)) {
        if (localStorage.getItem('token')) {
          terminateTraderSessionForAdminPortal();
          setIsAuthenticated(false);
        }
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        setIsAuthenticated(false);
        return;
      }

      const isValid = await validateSession(api);
      setIsAuthenticated(isValid);

      if (!isValid) {
        return;
      }

      if (
        location.pathname === '/' ||
        location.pathname === '/login' ||
        location.pathname === '/signup'
      ) {
        navigate('/home', { replace: false });
      }
    };

    checkSession().catch(() => {
      clearAuthStorage();
      setIsAuthenticated(false);
    });
  }, [location, navigate, setIsAuthenticated]);

  return null;
}

export default RefrshHandler;
