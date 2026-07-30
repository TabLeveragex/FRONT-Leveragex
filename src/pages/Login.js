import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { handleError, handleSuccess } from "../utils";
import { getApiErrorMessage } from "../utils/apiErrors";
import api from "../config/api";
import { setAuthSession } from "../utils/authStorage";
import {
    assertNoAdminSessionForTrader,
    hasAdminSession,
    terminateAdminSessionForTraderPortal,
    ADMIN_TRADER_CONFLICT_MESSAGE,
} from "../utils/sessionManager";
import "../styles/Login.css";

function Login() {
    const [loginInfo, setLoginInfo] = useState({
        email: "",
        password: "",
    });
    const [sessionNotice, setSessionNotice] = useState("");

    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        const conflict = assertNoAdminSessionForTrader();
        if (conflict.blocked || location.state?.adminSessionCleared) {
            setSessionNotice(ADMIN_TRADER_CONFLICT_MESSAGE);
        }
    }, [location.state]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLoginInfo((prev) => ({ ...prev, [name]: value }));
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        const { email, password } = loginInfo;
        if (!email || !password) {
            return handleError("Email and password are required");
        }

        if (hasAdminSession()) {
            terminateAdminSessionForTraderPortal();
            setSessionNotice(ADMIN_TRADER_CONFLICT_MESSAGE);
            return handleError(ADMIN_TRADER_CONFLICT_MESSAGE);
        }

        try {
            const response = await api.post("/auth/login", loginInfo);
            const { success, message, jwtToken, fullName, userId, mobile } = response.data;

            if (success) {
                handleSuccess(message);
                setAuthSession({
                    token: jwtToken,
                    userId,
                    email: loginInfo.email,
                    fullName,
                    mobile,
                });
                setTimeout(() => navigate("/plans"), 1000);
            } else {
                handleError(message);
            }
        } catch (err) {
            handleError(getApiErrorMessage(err, "Login failed. Please try again."));
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card glass-card">
                <div className="auth-header">
                    <p className="auth-eyebrow">Welcome back</p>
                    <h1>Sign in to LeverageX</h1>
                    <p className="auth-subtitle">Access your trading dashboard and manage your portfolio.</p>
                </div>

                {sessionNotice && (
                    <p className="session-conflict-notice" role="alert">
                        {sessionNotice}
                    </p>
                )}

                <form onSubmit={handleLogin} className="auth-form">
                    <div className="input-data">
                        <label htmlFor="email">Email</label>
                        <input
                            onChange={handleChange}
                            type="email"
                            name="email"
                            placeholder="you@example.com"
                            value={loginInfo.email}
                        />
                    </div>
                    <div className="input-data">
                        <label htmlFor="password">Password</label>
                        <input
                            onChange={handleChange}
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={loginInfo.password}
                        />
                    </div>
                    <button type="submit" className="btn-primary auth-submit">
                        Login
                    </button>
                    <span className="redirect-signup">
                        Don&apos;t have an account? <Link to="/signup">Create one</Link>
                    </span>
                </form>
            </div>
            <ToastContainer />
        </div>
    );
}

export default Login;
