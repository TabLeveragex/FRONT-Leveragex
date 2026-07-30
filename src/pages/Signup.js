import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../utils';
import { getApiErrorMessage } from '../utils/apiErrors';
import api from "../config/api";
import { clearAuthStorage } from "../utils/authStorage";
import '../styles/Signup.css';
import '../styles/Login.css';

function Signup() {
    const [signupInfo, setSignupInfo] = useState({
        fullName: '',
        email: '',
        mobile: '',
        aadhaar: '',
        pan: '',
        password: ''
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSignupInfo((prevState) => ({ ...prevState, [name]: value }));
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        const { fullName, email, mobile, aadhaar, pan, password } = signupInfo;

        if (!fullName || !email || !mobile || !aadhaar || !pan || !password) {
            return handleError('All fields are required');
        }

        if (!/^[0-9]{10}$/.test(String(mobile).trim())) {
            return handleError('Mobile number must be exactly 10 digits');
        }

        try {
            const response = await api.post('/auth/signup', signupInfo);
            const result = response.data;
            if (result.success) {
                clearAuthStorage();
                localStorage.setItem('userMobile', String(mobile).trim());
                handleSuccess(result.message);
                setTimeout(() => navigate('/login'), 1000);
            } else {
                handleError(result.message || 'Something went wrong.');
            }
        } catch (err) {
            handleError(getApiErrorMessage(err, 'Signup failed. Please try again.'));
        }
    };

    return (
        <div className="signup-page">
            <div className="auth-card glass-card signup-card">
                <div className="auth-header">
                    <p className="auth-eyebrow">Get started</p>
                    <h1>Create your account</h1>
                    <p className="auth-subtitle">Join LeverageX and start trading with funded capital.</p>
                </div>

                <form onSubmit={handleSignup} className="auth-form signup-form">
                    <div className="form-grid">
                        <div className="input-data">
                            <label htmlFor="fullName">Full Name</label>
                            <input onChange={handleChange} type="text" name="fullName" placeholder="Full name" value={signupInfo.fullName} />
                        </div>
                        <div className="input-data">
                            <label htmlFor="email">Email</label>
                            <input onChange={handleChange} type="email" name="email" placeholder="Email address" value={signupInfo.email} />
                        </div>
                        <div className="input-data">
                            <label htmlFor="mobile">Mobile</label>
                            <input onChange={handleChange} type="tel" name="mobile" placeholder="10-digit mobile number" maxLength={10} inputMode="numeric" value={signupInfo.mobile} />
                        </div>
                        <div className="input-data">
                            <label htmlFor="aadhaar">Aadhaar</label>
                            <input onChange={handleChange} type="text" name="aadhaar" placeholder="Aadhaar number" value={signupInfo.aadhaar} />
                        </div>
                        <div className="input-data">
                            <label htmlFor="pan">PAN</label>
                            <input onChange={handleChange} type="text" name="pan" placeholder="PAN number" value={signupInfo.pan} />
                        </div>
                        <div className="input-data">
                            <label htmlFor="password">Password</label>
                            <input onChange={handleChange} type="password" name="password" placeholder="Create password" value={signupInfo.password} />
                        </div>
                    </div>
                    <button className="btn-primary auth-submit" type="submit">Create Account</button>
                    <span className="redirect-signup">
                        Already have an account? <Link to="/login">Login</Link>
                    </span>
                </form>
            </div>
            <ToastContainer />
        </div>
    );
}

export default Signup;
