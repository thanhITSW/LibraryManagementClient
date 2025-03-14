import React, { useState } from 'react';
import '../assets/css/Login.css';
import { jwtDecode } from "jwt-decode"
import AlertMessage from "../utils/AlertMessage"
import { getErrorMessage } from "../utils/ErrorHandler";
import { Calendar } from 'primereact/calendar';
import api from "../services/api";
import { useNavigate } from 'react-router-dom';
import { FaCalendarDay, FaPhone, FaUserPlus } from "react-icons/fa";

import user_icon from '../assets/image/person.png';
import password_icon from '../assets/image/password.png';
import email_icon from '../assets/image/email.png';

export const Login = () => {
    const [action, setAction] = useState("Login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [dob, setDob] = useState("");
    const [phone, setPhone] = useState("");
    const [code, setCode] = useState(0);
    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);
    const navigate = useNavigate();

    const showAlert = (message, type = "success") => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 3000);
    };

    const handleLogin = async () => {
        try {
            setLoading(true);
            const response = await api.post('/common/auth/login', {
                email,
                password
            });


            if (response.status === 200) {
                const token = response.data.access_token;

                if (response.data.firstLogin === true) {
                    navigate('/force-change-password')
                    localStorage.setItem('token', token);
                    localStorage.setItem("firstLogin", true);
                    return;
                }

                if (token) {
                    const decoded = jwtDecode(token);
                    localStorage.setItem('role', decoded.scope);
                    localStorage.setItem('isLoggedIn', true);
                }
                localStorage.setItem('token', token);
                localStorage.setItem('refresh_token', response.data.refresh_token);
                window.location.href = "/";
            }
        } catch (error) {
            setLoading(false);
            setCode(error.response.data.code);
            const { message, statusMessage } = getErrorMessage(error.response);
            showAlert(message, statusMessage);
        }
    };

    const handleRegister = async () => {
        try {
            setLoading(true);
            const response = await api.post('/common/accounts', {
                firstName,
                lastName,
                dob,
                phone,
                email,
                password
            });

            if (response.status === 201) {
                setLoading(false);
                showAlert("Register successfully! Please check email to active account", "success");
                setAction("Login");
            }
        } catch (error) {
            setLoading(false);

            const { message, statusMessage } = getErrorMessage(error.response);
            showAlert(message, statusMessage);
        }
    };

    const handleLostPassword = async () => {
        try {
            setLoading(true);
            const response = await api.post('/common/accounts/reset-pass', { email });

            if (response.status === 200) {
                setLoading(false);
                showAlert("The password reset request has been sent! Please check your email.", "success");
                setAction("Login");
            }
        } catch (error) {
            setLoading(false);

            const { message, statusMessage } = getErrorMessage(error.response);
            showAlert(message, statusMessage);
        }
    };

    const handleResendActiveAccount = async () => {
        try {
            setLoading(true);
            const response = await api.post('/common/accounts/resend-link-active-account', { email });

            if (response.status === 200) {
                setLoading(false);
                showAlert("The active account request has been sent! Please check your email.", "success");
            }
        } catch (error) {
            setLoading(false);

            const { message, statusMessage } = getErrorMessage(error.response);
            showAlert(message, statusMessage);
        }
    }

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <>
            <div className='container'>
                <div className="header">
                    <div className="text">{action}</div>
                    <div className="underline"></div>
                </div>

                <div className="inputs">
                    {action === "Sign Up" && (
                        <>
                            <div className="input">
                                <img src={user_icon} alt="" />
                                <input type="text" placeholder='First Name' value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)} />
                            </div>

                            <div className="input">
                                <FaUserPlus className="custom-icon" />
                                <input type="text" placeholder='Last Name' value={lastName}
                                    onChange={(e) => setLastName(e.target.value)} />
                            </div>

                            <div className="input">
                                <FaCalendarDay className="custom-icon" />
                                <Calendar dateFormat='yy-mm-dd' placeholder='Date of birth'
                                    value={dob} onChange={(e) => setDob(e.target.value)} />
                            </div>

                            <div className="input">
                                <FaPhone className="custom-icon" />
                                <input type="text" placeholder='Phone' value={phone}
                                    onChange={(e) => setPhone(e.target.value)} />
                            </div>
                        </>
                    )}

                    {(action === "Login" || action === "Sign Up") && (
                        <>
                            <div className="input">
                                <img src={email_icon} alt="" />
                                <input type="email" placeholder='Email' value={email}
                                    onChange={(e) => setEmail(e.target.value)} />
                            </div>

                            <div className="input">
                                <img src={password_icon} alt="" />
                                <input type="password" placeholder='Password' value={password}
                                    onChange={(e) => setPassword(e.target.value)} />
                            </div>
                        </>
                    )}

                    {alert && <AlertMessage message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}

                    {action === "Lost Password" && (
                        <div className="input">
                            <img src={email_icon} alt="" />
                            <input type="email" placeholder='Email' value={email}
                                onChange={(e) => setEmail(e.target.value)} />
                        </div>
                    )}
                </div>

                {action === "Login" && (
                    <>
                        <div className="forgot-password" onClick={() => setAction("Lost Password")}>
                            Lost Password? <span>Click Here!</span>
                        </div>

                        {code === 1014 && (
                            <div className="forgot-password" onClick={handleResendActiveAccount}>
                                Resend active account? <span>Click Here!</span>
                            </div>
                        )}
                    </>
                )}

                <div className="submit-container">
                    {action === "Lost Password" ? (
                        <>
                            <div className="submit" onClick={handleLostPassword} >Send Request</div>
                            <div className="submit gray" onClick={() => setAction("Login")}>Back</div>
                        </>
                    ) : (
                        <>
                            <div className={action === "Login" ? "submit gray" : "submit"}
                                onClick={() => {
                                    setAction("Sign Up");
                                    if (action === "Sign Up") {
                                        handleRegister();
                                    }
                                }}>Sign Up</div>

                            <div className={action === "Sign Up" ? "submit gray" : "submit"}
                                onClick={() => {
                                    setAction("Login");
                                    if (action === "Login") {
                                        handleLogin();
                                    }
                                }}>Login</div>
                        </>
                    )}
                </div>
            </div>
        </>
    )
}