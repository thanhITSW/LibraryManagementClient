import 'primereact/resources/themes/saga-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

import React, { useState, useEffect } from "react";
import '../assets/css/Profile.css';
import api from "../services/api";
import AlertMessage from "../utils/AlertMessage";
import { getErrorMessage } from "../utils/ErrorHandler";
import { InputOtp } from 'primereact/inputotp'
import { Dialog } from 'primereact/dialog';

export const Profile = () => {

    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    const [user, setUser] = useState({
        lastName: "",
        firstName: "",
        phone: "",
        dob: "",
        email: ""
    });

    const [PasswordDetails, setPasswordDetails] = useState({
        currentPassword: '',
        newPassword: '',
    });

    const [newContact, setNewContact] = useState({
        email: "",
        phone: ""
    });
    
    const [alert, setAlert] = useState(null);
    const [activeMenu, setActiveMenu] = useState("profile");
    const [showOtpDialog, setShowOtpDialog] = useState(false);
    const [otpValue, setOtpValue] = useState("");
    const [otpType, setOtpType] = useState("");
    const [loading, setLoading] = useState(true);

    const showAlert = (message, type = "success") => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 3000);
    };
    
    useEffect(() => {
        setLoading(true);
        const fetchUserData = async () => {
            try {
                const response = await api.get("/common/accounts/my-info",
                    { requiresAuth: true }
                );
                setUser(response.data);
                setLoading(false);
            } catch (error) {
                const { message, statusMessage } = getErrorMessage(error.response);
                showAlert(message, statusMessage);
                setLoading(false);
            }
        };
        fetchUserData();
    }, []);

    const handleRequestOtp = async (type) => {
        try {
            setLoading(true);
            const endpoint = type === "email" ? "/user/accounts/request-change-mail" : "/user/accounts/request-change-phone";
            const payload = type === "email" ? { email: newContact.email } : { phone: newContact.phone };

            if (!payload.email && !payload.phone) {
                showAlert(`Please enter a new ${type}`, "warning");
                return;
            }

            await api.post(endpoint, payload, { requiresAuth: true });

            setOtpType(type);
            setShowOtpDialog(true);
            showAlert(`OTP has been sent to your ${type}`, "success");
            setLoading(false);
        } catch (error) {
            setLoading(false);
            const { message, statusMessage } = getErrorMessage(error.response);
            showAlert(message, statusMessage);
        }
    };

    const handleVerifyOtp = async () => {
        try {
            setLoading(true);
            const endpoint = otpType === "email" ? "/user/accounts/verify-change-mail" : "/user/accounts/verify-change-phone";
            const payload = {
                [otpType]: otpType === "email" ? newContact.email : newContact.phone,
                otp: otpValue
            };

            const response = await api.post(endpoint, payload, { requiresAuth: true });

            if(response.status === 200) {
                setUser(prev => ({
                    ...prev,
                    [otpType]: payload[otpType]
                }));
                
                setShowOtpDialog(false);
                setNewContact({
                    email: "",
                    phone: ""
                });
                setOtpValue("");
                showAlert(`${otpType} updated successfully!`, "success");
                setLoading(false);
            }
        } catch (error) {
            setLoading(false);
            const { message, statusMessage } = getErrorMessage(error.response);
            showAlert(message, statusMessage);
        }
    };

    const handleChangeFieldPassword = (e, field) => {
        setPasswordDetails(prevState => ({
            ...prevState,
            [field]: e.target.value
        }));
    };

    const handleChangePassword = async () => {
        setLoading(true);
        if (!PasswordDetails) return;

        if (!PasswordDetails.currentPassword || !PasswordDetails.newPassword) {
            showAlert("Please fill in all fields.", "warning");
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            showAlert("You need to login", "warning");
            return;
        }

        const requestData = {
            oldPassword: PasswordDetails.currentPassword,
            newPassword: PasswordDetails.newPassword
        };

        api.put("/user/accounts/change-password", requestData, 
            { requiresAuth: true })
        .then(response => {
            showAlert(response.data.message, "success");
            setPasswordDetails({
                currentPassword: '',
                newPassword: '',
            });
            setLoading(false);
        })
        .catch(error => {
            const { message, statusMessage } = getErrorMessage(error.response);
            showAlert(message, statusMessage);
            setLoading(false);
        });
    };


    const handleLogout = async () => {
        setLoading(true);
        const response = await api.post("/common/auth/logout", {token})
        if (response.status === 204) {
            setLoading(false);
            localStorage.clear();
            window.location.href = "/";
        }
    };
    
    const renderContent = () => {
        switch(activeMenu) {
            case "profile":
                return (
                    <div className="profile-info">
                        <h2>Profile</h2>
                        <div className="profile-avatar">
                            <img src="https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg" alt="Avatar" />
                        </div>
                        <label>Email:</label>
                        <input type="text" value={user.email} disabled/>
                        <label>First Name:</label>
                        <input type="text" value={user.firstName} disabled />
                        <label>Last Name:</label>
                        <input type="text" value={user.lastName} disabled />
                        <label>Day of birth:</label>
                        <input type="text" value={user.dob} disabled />
                        <label>Phone:</label>
                        <input type="text" value={user.phone} disabled />
                    </div>
                );
            case "change-password":
                return (
                    <div className="profile-info">
                        <h2>Change Password</h2>
                        <label>Current Password:</label>
                        <input 
                            type="password" 
                            value={PasswordDetails.currentPassword}
                            onChange={(e) => handleChangeFieldPassword(e, "currentPassword")}
                        />
                        <label>New Password:</label>
                        <input 
                            type="password" 
                            value={PasswordDetails.newPassword}
                            onChange={(e) => handleChangeFieldPassword(e, "newPassword")}
                        />
                        <button onClick={handleChangePassword}>Change Password</button>
                    </div>
                );
            case "change-email":
                return (
                    <div className="profile-info">
                        <h2>Change Email</h2>
                        <label>New Email:</label>
                        <input 
                            type="email" 
                            value={newContact.email}
                            onChange={(e) => setNewContact({...newContact, email: e.target.value})} 
                        />
                        <button onClick={() => handleRequestOtp("email")}>
                            Change Email
                        </button>
                    </div>
                );
            case "change-phone":
                return (
                    <div className="profile-info">
                        <h2>Change Phone</h2>
                        <label>New Phone:</label>
                        <input 
                            type="tel" 
                            value={newContact.phone}
                            onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                        />
                        <button onClick={() => handleRequestOtp("phone")}>
                            Change Phone
                        </button>
                    </div>
                );
            case "logout":
                handleLogout();
                return null;
            default:
                return null;
        }
    };

    if (loading) return <div className="loading-spinner"></div>;

    return (
        <>
            {alert && <AlertMessage message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
            <div className="profile-wrapper">
                <div className="sidebar">
                    <ul className="sidebar-menu">
                        <li 
                            className={activeMenu === "profile" ? "active" : ""}
                            onClick={() => setActiveMenu("profile")}
                        >
                            Profile
                        </li>
                        {role === "ROLE_USER" && (
                            <>
                                <li 
                                    className={activeMenu === "change-password" ? "active" : ""}
                                    onClick={() => setActiveMenu("change-password")}
                                >
                                    Change Password
                                </li>
                                <li 
                                    className={activeMenu === "change-email" ? "active" : ""}
                                    onClick={() => setActiveMenu("change-email")}
                                >
                                    Change Email
                                </li>
                                <li 
                                    className={activeMenu === "change-phone" ? "active" : ""}
                                    onClick={() => setActiveMenu("change-phone")}
                                >
                                    Change Phone
                                </li>
                            </>
                        )}
                        <li 
                            className={activeMenu === "logout" ? "active" : ""}
                            onClick={() => setActiveMenu("logout")}
                        >
                            Logout
                        </li>
                    </ul>
                </div>
                <div className="profile-container">
                    {renderContent()}
                </div>
            </div>

            <Dialog 
                header={`Enter OTP for ${otpType}`} 
                visible={showOtpDialog} 
                style={{ width: '30vw' }}
                className="custom-otp-dialog"
                onHide={() => setShowOtpDialog(false)}
            >
                <div className="otp-container">
                    <InputOtp 
                        value={otpValue} 
                        onChange={(e) => setOtpValue(e.value)}
                        length={6}
                        integerOnly
                    />
                    <button 
                        onClick={handleVerifyOtp}
                        className="custom-otp-button"
                        style={{ marginTop: '1rem' }}
                    >
                        Verify OTP
                    </button>
                </div>
            </Dialog>
        </>
    );
};