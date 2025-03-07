import React, { useEffect, useState } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Message } from 'primereact/message';
import { useLocation, useNavigate } from 'react-router-dom';
import api from "../services/api";
import '../assets/css/EmailVerificationSuccess.css';

export const EmailVerificationSuccess = () => {
    const [verificationStatus, setVerificationStatus] = useState(null);
    const [countdown, setCountdown] = useState(10); // State để đếm ngược
    const location = useLocation();
    const navigate = useNavigate();

    useEffect(() => {
        const verifyEmail = async () => {
            const query = new URLSearchParams(location.search);
            const token = query.get('token');

            if (!token) {
                setVerificationStatus({ success: false, message: 'Token not found' });
                return;
            }

            try {
                const response = await api.get(`/common/auth/active?token=${token}`);
                setVerificationStatus(response.data);
            } catch (error) {
                setVerificationStatus({
                    success: false,
                    message: error.response?.data?.message || 'Email verification failed',
                });
            }
        };

        verifyEmail();
    }, [location.search]);

    useEffect(() => {
        // Đếm ngược và chuyển hướng khi xác nhận thành công
        if (verificationStatus?.success) {
            const interval = setInterval(() => {
                setCountdown((prev) => {
                    if (prev <= 1) {
                        clearInterval(interval);
                        navigate('/');
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000); // Giảm mỗi 1 giây

            // Cleanup interval khi component unmount
            return () => clearInterval(interval);
        }
    }, [verificationStatus, navigate]);

    const handleContinue = () => {
        navigate('/');
    };

    if (verificationStatus === null) {
        return (
            <div className="verification-container">
                <Card>
                    <p>Verifying...</p>
                </Card>
            </div>
        );
    }

    if (!verificationStatus.success) {
        return (
            <div className="verification-container">
                <Card>
                    <Message severity="error" text={verificationStatus.message} />
                    <Button
                        label="Go Back"
                        icon="pi pi-arrow-left"
                        className="p-button-secondary p-mt-3"
                        onClick={() => navigate('/')}
                    />
                </Card>
            </div>
        );
    }

    return (
        <div className="verification-container">
            <Card className="verification-card">
                <div className="p-text-center">
                    <i
                        className="pi pi-check-circle"
                        style={{ fontSize: '4rem', color: '#4CAF50', marginBottom: '1rem' }}
                    ></i>
                    <h1 className="p-mb-3" style={{ color: '#333' }}>
                        Email Verified Successfully!
                    </h1>
                    <Message
                        severity="success"
                        text={`Your email has been successfully verified. You can now use all features of the application. Redirecting in ${countdown} seconds...`}
                        className="p-mb-4"
                    />
                    <Button
                        label="Continue"
                        icon="pi pi-arrow-right"
                        className="p-button-success"
                        onClick={handleContinue}
                    />
                </div>
            </Card>
        </div>
    );
};