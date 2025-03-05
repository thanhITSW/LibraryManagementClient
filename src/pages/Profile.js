import React, { useState, useEffect } from "react";
import '../assets/css/Profile.css';
import api from "../services/api";
import AlertMessage from "../utils/AlertMessage";
import { getErrorMessage } from "../utils/ErrorHandler";
import ChangePassword from "../components/ChangePassword";

export const Profile = () => {

    const token = localStorage.getItem("token");

    const [user, setUser] = useState({
        lastName: "",
        firstName: "",
        phone: "",
        dob: "",
        email: ""
    });
    
    const [alert, setAlert] = useState(null);
    const [isModalOpenPassword, setIsModalOpenPassword] = useState(false);

    const showAlert = (message, type = "success") => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 3000);
    };
    
    useEffect(() => {
        const token = localStorage.getItem("token");
        const fetchUserData = async () => {
            try {
                const response = await api.get("/common/accounts/my-info",
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setUser(response.data);
            } catch (error) {
                const { message, statusMessage } = getErrorMessage(error.response);
                showAlert(message, statusMessage);
            }
        };
        fetchUserData();
    }, []);

    const handleUpdateProfile = async () => {

        const { name, phone, address, email, url_avatar } = user;

        if (!name || !phone || !address || !email || !url_avatar) {
            showAlert("Please fill in all fields!", "warning");
            return; 
        }

        try {
            await api.patch("", user,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setAlert({ type: "success", message: "Profile updated successfully!" });
        } catch (error) {
            const { message, statusMessage } = getErrorMessage(error.response);
            showAlert(message, statusMessage);
        }
    };

    const PasswordModel = () => {
        setIsModalOpenPassword(true)
    };

    const closeModalPassword = (isAdded = false, message = "") => {

        if (isAdded === true) {
            showAlert(message, "success");
        }

        setIsModalOpenPassword(false);
    };

    const handleLogout = async () => {
        const response = await api.post("/common/auth/logout", {token})
        if (response.status === 204) {
            localStorage.clear();
            window.location.href = "/";
        }
    };
    
    return (
        <>
            {alert && <AlertMessage message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
            <div className="profile-container">
                <ChangePassword
                    visible={isModalOpenPassword}
                    onClose={closeModalPassword}
                />
                <h2>Profile</h2>
                <div className="profile-avatar">
                    <img src="https://static.vecteezy.com/system/resources/previews/009/292/244/non_2x/default-avatar-icon-of-social-media-user-vector.jpg" alt="Avatar" />
                </div>
                <div className="profile-info">
                    <label>Email:</label>
                    <input type="text" value={user.email} onChange={(e) => setUser({ ...user, email: e.target.value })} />
                    <label>First Name:</label>
                    <input type="text" value={user.firstName} onChange={(e) => setUser({ ...user, firstName: e.target.value })} />
                    <label>Last Name:</label>
                    <input type="text" value={user.lastName} onChange={(e) => setUser({ ...user, lastName: e.target.value })} />
                    <label>Day of birth:</label>
                    <input type="text" value={user.dob}  onChange={(e) => setUser({ ...user, dob: e.target.value})} />
                    <label>Phone:</label>
                    <input type="text" value={user.phone} onChange={(e) => setUser({ ...user, phone: e.target.value })} />
                    <button onClick={handleUpdateProfile}>Update Information</button>
                </div>
                <button className="change-password-btn" onClick={() => PasswordModel()}>
                    Change Password
                </button>
                <button className="logout-btn" onClick={handleLogout}>
                    Logout
                </button>
            </div>
        </>
    );
};