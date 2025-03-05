import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Dropdown } from "primereact/dropdown";
import '../../assets/css/EditProduct.css';
import AlertMessage from "../../utils/AlertMessage";
import api from "../../services/api";
import { Calendar } from 'primereact/calendar';
import { getErrorMessage } from '../../utils/ErrorHandler';

const EditAccountModel = ({ visible, accountId, onClose }) => {
    const [AccountDetails, setAccountDetails] = useState(null);

    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);

    const showAlert = (message, type = "success") => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 3000);
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (accountId) {
            setLoading(true);
            api.get(`/admin/accounts/${accountId}`, 
                { headers: { Authorization: `Bearer ${token}` } }
            )
                .then(response => {
                    const data = response.data
                    setAccountDetails({
                        ...data,
                        dob: data.dob ? new Date(data.dob) : null
                    });
                    setLoading(false);
                })
                .catch(error => {
                    setLoading(false);
                    const { message, statusMessage } = getErrorMessage(error.response);
                    showAlert(message, statusMessage);
                });
        }
    }, [accountId, visible]);

    const handleChange = (e, field) => {
        setAccountDetails(prevState => ({
            ...prevState,
            [field]: e.target.value
        }));
    };

    const handleDateChange = (e, field) => {
        setAccountDetails(prevState => ({
            ...prevState,
            [field]: e.value
        }));
    };


    const handleSave = () => {
        if (!AccountDetails) return;

        if (!AccountDetails.email || 
            !AccountDetails.firstName || 
            !AccountDetails.lastName || 
            !AccountDetails.phone || 
            !AccountDetails.dob ||
            AccountDetails.active === null) {
            showAlert("Please fill in all fields.", "warning");
            return;
        }

        const token = localStorage.getItem("token");
        
        if (!token) {
            showAlert("You need to login", "warning");
            return;
        }

        const requestData = {
            email: AccountDetails.email,
            firstName: AccountDetails.firstName,
            lastName: AccountDetails.lastName,
            dob: AccountDetails.dob,
            phone: AccountDetails.phone,
            roles: ["USER"],
            active: AccountDetails.active
        };

        setLoading(true);
        api.put(`/admin/accounts/${accountId}`, requestData, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            setLoading(false);
            const editAccount = response.data;
            onClose(true, "Edit account member successfully", editAccount);
        })
        .catch(error => {
            setLoading(false);
            const { message, statusMessage } = getErrorMessage(error.response);
            showAlert(message, statusMessage);
        });
    };


    return (
        <Dialog
            visible={visible}
            onHide={onClose}
            header="Edit Account"
            style={{ width: '50vw' }}
        >
            {loading ? (
                <div className="loading-spinner"></div>
            ) : AccountDetails ? (
                <div className="account-edit-form">
                    <h3>Account Information</h3>
                    <div className="p-field">
                        <label>Email</label>
                        <InputText value={AccountDetails.email} onChange={(e) => handleChange(e, "email")} />
                    </div>
                    <div className="p-field">
                        <label>First Name</label>
                        <InputText value={AccountDetails.firstName} onChange={(e) => handleChange(e, "firstName")} />
                    </div>
                    <div className="p-field">
                        <label>Last Name</label>
                        <InputText value={AccountDetails.lastName} onChange={(e) => handleChange(e, "lastName")} />
                    </div>
                    <div className='p-field'>
                        <label>Day of birth</label>
                        <Calendar value={AccountDetails.dob} onChange={e => handleDateChange(e, 'dob')} showIcon dateFormat='yy-mm-dd' />
                    </div>
                    <div className="p-field">
                        <label>Phone</label>
                        <InputText value={AccountDetails.phone} onChange={(e) => handleChange(e, "phone")} />
                    </div>
                    <div className="p-field">
                        <label>Active</label>
                        <Dropdown 
                            value={AccountDetails.active} 
                            options={[{ label: "True", value: true }, { label: "False", value: false }]} 
                            onChange={(e) => handleChange(e, "active")} 
                        />
                    </div>
        
                    <div className="p-dialog-footer">
                        <Button label="Save" className="p-button-success" onClick={handleSave} />
                        <Button label="Cancel" className="p-button-secondary" onClick={onClose} />
                    </div>
                </div>
            ) : (
                <p>Account not found</p>
            )}

            {alert && <AlertMessage message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
        </Dialog>
    );
};

export default EditAccountModel;