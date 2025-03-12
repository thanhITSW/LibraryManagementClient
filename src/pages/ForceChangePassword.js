import React, { useState } from 'react';
import { Card } from 'primereact/card';
import { InputText } from 'primereact/inputtext'; // Thay Password bằng InputText
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import api from "../services/api";
import AlertMessage from "../utils/AlertMessage";
import '../assets/css/ForceChangePassword.css';

export const ForceChangePassword = () => {
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [alert, setAlert] = useState(null);
    const navigate = useNavigate();

    const showAlert = (message, type = "success") => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 3000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!newPassword || !confirmPassword) {
            showAlert("Please fill in all fields", "warning");
            return;
        }
        if (newPassword !== confirmPassword) {
            showAlert("Passwords do not match", "warning");
            return;
        }
        if (newPassword.length < 6) {
            showAlert("Password must be at least 5 characters long", "warning");
            return;
        }

        const token = localStorage.getItem("token");
        if (!token) {
            showAlert("You need to login", "warning");
            return;
        }

        try {
            const response = await api.post(
                '/user/accounts/change-password-first-login',
                { newPassword },
                { requiresAuth: true }
            );
            if (response.status === 200) {
                showAlert("Password changed successfully!", "success");
                localStorage.clear();
                setTimeout(() => navigate('/login'), 2000);
            }
        } catch (error) {
            showAlert(error.response?.data?.message || "Failed to change password", "error");
        }
    };

    return (
        <div className="change-password-container">
            <Card className="change-password-card">
                <div className="p-text-center">
                    <i className="pi pi-lock" style={{ fontSize: '3rem', color: '#007ad9', marginBottom: '1.5rem' }}></i>
                    <h1 className="p-mb-2">Change Your Password</h1>
                    <p className="p-mb-4 subtitle">
                        Since this is your first login, please set a new password.
                    </p>

                    <form onSubmit={handleSubmit}>
                        <div className="p-field p-mb-3">
                            <span className="p-float-label">
                                <InputText
                                    id="newPassword"
                                    type="password" // Vẫn giữ type="password" để ẩn ký tự
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="p-inputtext-lg"
                                />
                                <label htmlFor="newPassword">New Password</label>
                            </span>
                        </div>

                        <div className="p-field p-mb-4">
                            <span className="p-float-label">
                                <InputText
                                    id="confirmPassword"
                                    type="password" // Vẫn giữ type="password" để ẩn ký tự
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="p-inputtext-lg"
                                />
                                <label htmlFor="confirmPassword">Confirm Password</label>
                            </span>
                        </div>

                        <Button
                            label="Submit"
                            icon="pi pi-check"
                            className="p-button-raised p-button-primary p-button-lg"
                            type="submit"
                        />
                    </form>
                </div>
            </Card>
            {alert && <AlertMessage message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
        </div>
    );
};