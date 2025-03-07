import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { Tag } from 'primereact/tag';
import '../assets/css/ActivityLogDetails.css';
import api from "../services/api";
import AlertMessage from "../utils/AlertMessage";
import { getErrorMessage } from '../utils/ErrorHandler';

const ActivityLogModal = ({ visible, logId, onClose }) => {
    const [logDetails, setLogDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);

    const showAlert = (message, type = "success") => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 3000);
    };

    const formatTimestamp = (timestamp) => {
        return new Date(timestamp).toLocaleString('vi-VN', {
            dateStyle: 'medium',
            timeStyle: 'short'
        });
    };

    const getActionSeverity = (action) => {
        switch (action) {
            case 'UPDATE': return 'warning';
            case 'CREATE': return 'success';
            case 'DELETE': return 'danger';
            default: return 'info';
        }
    };

    useEffect(() => {
        if (logId) {
            setLoading(true);
            api.get(`/admin/activity-log/${logId}`, { requiresAuth: true })
                .then(response => {
                    setLogDetails(response.data);
                    setLoading(false);
                })
                .catch(error => {
                    setLoading(false);
                    const { message, statusMessage } = getErrorMessage(error.response);
                    showAlert(message, statusMessage);
                });
        }
    }, [logId, visible]);

    return (
        <Dialog
            visible={visible}
            onHide={onClose}
            header="Activity Log Details"
            style={{ width: '60vw' }}
            className="activity-log-modal"
        >
            {loading ? (
                <p>Loading...</p>
            ) : logDetails ? (
                <Card className="activity-log-card">
                    <div className="log-header">
                        <Tag 
                            value={logDetails.action} 
                            severity={getActionSeverity(logDetails.action)}
                            className="action-tag"
                        />
                        <span className="timestamp">
                            {formatTimestamp(logDetails.timestamp)}
                        </span>
                    </div>

                    <Divider />

                    <div className="log-content">
                        <div className="log-info">
                            <p><strong>Performed By:</strong> {logDetails.performedBy}</p>
                            <p><strong>Entity Type:</strong> {logDetails.entityType}</p>
                            <p><strong>Entity ID:</strong> {logDetails.entityId}</p>
                            <p><strong>Description:</strong> {logDetails.description}</p>
                        </div>

                        <Divider />

                        <div className="data-changes">
                            <div className="old-data">
                                <h4>Old Data</h4>
                                {logDetails.oldData && Object.keys(logDetails.oldData).length > 0 ? (
                                    <pre>{JSON.stringify(logDetails.oldData, null, 2)}</pre>
                                ) : (
                                    <p>No previous data</p>
                                )}
                            </div>
                            <div className="new-data">
                                <h4>New Data</h4>
                                {logDetails.newData && Object.keys(logDetails.newData).length > 0 ? (
                                    <pre>{JSON.stringify(logDetails.newData, null, 2)}</pre>
                                ) : (
                                    <p>No new data</p>
                                )}
                            </div>
                        </div>
                    </div>
                </Card>
            ) : (
                <p>Log not found</p>
            )}

            {alert && <AlertMessage message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
        </Dialog>
    );
};

export default ActivityLogModal;