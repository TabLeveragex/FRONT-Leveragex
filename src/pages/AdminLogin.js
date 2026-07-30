import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../utils';
import { getApiErrorMessage } from '../utils/apiErrors';
import adminApi from '../config/adminApi';
import { setAdminSession } from '../utils/authStorage';
import {
  assertNoTraderSessionForAdmin,
  consumeTraderSessionClearedFlag,
  hasTraderSession,
  terminateTraderSessionForAdminPortal,
  TRADER_ADMIN_CONFLICT_MESSAGE,
} from '../utils/sessionManager';
import CaptchaField from '../components/CaptchaField';
import '../styles/Login.css';

function AdminLogin() {
  const [hcaptchaToken, setHcaptchaToken] = useState('');
  const [captchaReset, setCaptchaReset] = useState(0);
  const [loginInfo, setLoginInfo] = useState({
    loginId: '',
    password: '',
  });
  const [otpStep, setOtpStep] = useState(false);
  const [challengeToken, setChallengeToken] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSentTo, setOtpSentTo] = useState('');
  const [sessionNotice, setSessionNotice] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const conflict = assertNoTraderSessionForAdmin();
    if (conflict.blocked || location.state?.traderSessionCleared) {
      setSessionNotice(TRADER_ADMIN_CONFLICT_MESSAGE);
    }
  }, [location.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginInfo((prev) => ({ ...prev, [name]: value }));
  };

  const ensureNoTraderSession = () => {
    if (hasTraderSession()) {
      terminateTraderSessionForAdminPortal();
      setSessionNotice(TRADER_ADMIN_CONFLICT_MESSAGE);
      handleError(TRADER_ADMIN_CONFLICT_MESSAGE);
      return false;
    }
    return true;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { loginId, password } = loginInfo;
    if (!loginId || !password) {
      return handleError('Email/username and password are required');
    }

    if (!hcaptchaToken) {
      return handleError('Please complete the captcha verification');
    }

    if (!ensureNoTraderSession()) {
      return;
    }

    const traderSessionWasActive = consumeTraderSessionClearedFlag();

    try {
      const response = await adminApi.post('/auth/admin/login', {
        loginId,
        password,
        traderSessionWasActive,
        hcaptchaToken,
      });
      const { success, message, requiresOtp, challengeToken: token, otpSentTo: sentTo } = response.data;

      if (success && requiresOtp && token) {
        const inbox = sentTo || 'your admin email';
        handleSuccess(message || `Verification code sent to ${inbox}.`);
        setOtpSentTo(sentTo || '');
        setChallengeToken(token);
        setOtp('');
        setOtpStep(true);
        return;
      }

      if (success) {
        handleError('Unexpected login response. Please try again.');
      } else {
        handleError(message);
        setCaptchaReset((n) => n + 1);
      }
    } catch (err) {
      setCaptchaReset((n) => n + 1);
      handleError(getApiErrorMessage(err, 'Admin login failed. Please try again.'));
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!challengeToken) {
      return handleError('Session expired. Please sign in again.');
    }
    if (!/^\d{6}$/.test(otp.trim())) {
      return handleError('Enter the 6-digit code from your email.');
    }

    if (!ensureNoTraderSession()) {
      return;
    }

    const traderSessionWasActive = consumeTraderSessionClearedFlag();

    try {
      const response = await adminApi.post('/auth/admin/verify-otp', {
        challengeToken,
        otp: otp.trim(),
        traderSessionWasActive,
      });
      const { success, message, jwtToken, adminId, email, username, fullName } = response.data;

      if (success) {
        handleSuccess(message);
        setAdminSession({
          token: jwtToken,
          adminId,
          email,
          username,
          fullName,
        });
        const redirectTo = location.state?.from || '/dashboard';
        setTimeout(() => navigate(redirectTo, { replace: true }), 500);
      } else {
        handleError(message);
      }
    } catch (err) {
      handleError(getApiErrorMessage(err, 'Verification failed. Please try again.'));
    }
  };

  const handleBackToLogin = () => {
    setOtpStep(false);
    setChallengeToken('');
    setOtp('');
    setOtpSentTo('');
    setCaptchaReset((n) => n + 1);
  };

  return (
    <div className="auth-page">
      <div className="auth-card glass-card">
        <div className="auth-header">
          <p className="auth-eyebrow">Admin access</p>
          <h1>{otpStep ? 'Enter verification code' : 'Sign in to Admin Dashboard'}</h1>
          <p className="auth-subtitle">
            {otpStep
              ? `Enter the 6-digit code sent to ${otpSentTo || 'your admin Gmail inbox'} (check Spam). It expires in 10 minutes.`
              : 'Manage users, stocks, trends, and payouts.'}
          </p>
        </div>

        {sessionNotice && (
          <p className="session-conflict-notice" role="alert">
            {sessionNotice}
          </p>
        )}

        {otpStep ? (
          <form onSubmit={handleVerifyOtp} className="auth-form">
            <div className="input-data">
              <label htmlFor="otp">Verification code</label>
              <input
                id="otp"
                type="text"
                name="otp"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                maxLength={6}
              />
            </div>
            <button type="submit" className="btn-primary auth-submit">
              Verify and sign in
            </button>
            <button type="button" className="btn-secondary auth-submit" onClick={handleBackToLogin}>
              Back to sign in
            </button>
          </form>
        ) : (
          <form onSubmit={handleLogin} className="auth-form">
            <div className="input-data">
              <label htmlFor="loginId">Email or username</label>
              <input
                onChange={handleChange}
                type="text"
                name="loginId"
                placeholder="admin@leveragex.com or admin"
                value={loginInfo.loginId}
                autoComplete="username"
              />
            </div>
            <div className="input-data">
              <label htmlFor="password">Password</label>
              <input
                onChange={handleChange}
                type="password"
                name="password"
                placeholder="Enter admin password"
                value={loginInfo.password}
                autoComplete="current-password"
              />
            </div>
            <CaptchaField onChange={setHcaptchaToken} resetSignal={captchaReset} />
            <button type="submit" className="btn-primary auth-submit">
              Admin Login
            </button>
          </form>
        )}
      </div>
      <ToastContainer />
    </div>
  );
}

export default AdminLogin;
