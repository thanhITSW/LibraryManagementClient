import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import '../assets/css/AddProduct.css';
import AlertMessage from "../utils/AlertMessage";
import api from "../services/api";
import { getErrorMessage } from '../utils/ErrorHandler';

const ChangePassword = ({ visible, onClose }) => {
    const [PasswordDetails, setPasswordDetails] = useState({
        oldPassword: '',
        newPassword : '',
    });
    

    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);

    const showAlert = (message, type = "success") => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 3000);
    };

    const handleChange = (e, field) => {
        setPasswordDetails(prevState => ({
            ...prevState,
            [field]: e.target.value
        }));
    };


    const handleSave = () => {
        if (!PasswordDetails) return;

        if (!PasswordDetails.oldPassword || !PasswordDetails.newPassword) {
            showAlert("Please fill in all fields.", "warning");
            return;
        }

        const token = localStorage.getItem("token");
        
        if (!token) {
            showAlert("You need to login", "warning");
            return;
        }

        const requestData = {
            oldPassword: PasswordDetails.oldPassword,
            newPassword: PasswordDetails.newPassword
        };

        setLoading(true);
        api.put("/user/accounts/change-password", requestData, 
            { headers: { Authorization: `Bearer ${token}` } })
        .then(response => {
            setLoading(false);
            onClose(true, response.data.message);
            setPasswordDetails({
                oldPassword: '',
                newPassword: '',
            });
        })
        .catch(error => {
            setLoading(false);
            const { message, statusMessage } = getErrorMessage(error.response);
            showAlert(message, statusMessage);
        });
    };


    if (loading) return <div className="loading-spinner"></div>;

    return (
        <Dialog
            visible={visible}
            onHide={onClose}
            header="Change Password"
            style={{ width: '50vw' }}
        >
            <div className="account-edit-form">
                {/* <h3>Change Password</h3> */}
                <div className="p-field">
                    <label>Old Password</label>
                    <InputText value={PasswordDetails.oldPassword} onChange={(e) => handleChange(e, "oldPassword")} type='password' />
                </div>
                <div className="p-field">
                    <label>New Password</label>
                    <InputText value={PasswordDetails.newPassword} onChange={(e) => handleChange(e, "newPassword")} type='password' />
                </div>
    
                <div className="p-dialog-footer">
                    <Button label="Save" className="p-button-success" onClick={handleSave} />
                    <Button label="Cancel" className="p-button-secondary" onClick={onClose} />
                </div>
            </div>
            {alert && <AlertMessage message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
        </Dialog>
    );    
};

export default ChangePassword;