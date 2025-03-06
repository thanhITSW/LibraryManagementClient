import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import '../assets/css/SystemConfig.css';

import { useState, useEffect } from "react";
import { Card } from "primereact/card";
import { ToggleButton } from "primereact/togglebutton";
import { ProgressSpinner } from "primereact/progressspinner";
import { Toast } from "primereact/toast";
import { useRef } from 'react';
import { getErrorMessage } from '../utils/ErrorHandler';
import AlertMessage from "../utils/AlertMessage";
import api from "../services/api";

export const SystemConfigs = () => {
    const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
    const [loading, setLoading] = useState(false);
    const toast = useRef(null);
    const [alert, setAlert] = useState(null);
    const token = localStorage.getItem("token");

    const showAlert = (message, type = "success") => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 3000);
    };

    useEffect(() => {
        if (!token) {
            return showAlert("You need to login", "warning");
        }

        setLoading(true);
        api.get(`/admin/system-config`, { requiresAuth: true })
            .then(response => {
                const data = response.data
                setIsMaintenanceMode(data.maintenanceMode);
                setLoading(false);
            })
            .catch(error => {
                setLoading(false);
                const { message, statusMessage } = getErrorMessage(error.response);
                showAlert(message, statusMessage);
            });
    }, [token]);

    const handleToggleMaintenance = async () => {
        setLoading(true);

        api.post(`/admin/system-config/maintenance`, {
            maintenanceMode: !isMaintenanceMode
        },{ requiresAuth: true })
            .then(response => {
                setIsMaintenanceMode(!isMaintenanceMode);
                setLoading(false);
                showAlert(`Maintenance mode ${!isMaintenanceMode ? 'enabled' : 'disabled'}`, "success");
            }
            )
            .catch(error => {
                setLoading(false);
                const { message, statusMessage } = getErrorMessage(error.response);
                showAlert(message, statusMessage);
            });
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
            <Toast ref={toast} />
            <Card className="w-full max-w-md shadow-xl bg-white rounded-2xl p-6 maintenance-card">
                <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                    🛠️ System Maintenance
                </h2>

                <div className="flex flex-col items-center gap-6">
                    {/* Status Display */}
                    <div className="flex flex-col items-center gap-3">
                        <span className="text-lg font-medium text-gray-700">
                            {isMaintenanceMode
                                ? "Maintenance Mode: ON ⚠️"
                                : "Maintenance Mode: OFF ✅"}
                        </span>
                        <div className={`status-indicator ${isMaintenanceMode ? 'maintenance-on' : 'maintenance-off'}`}>
                            {isMaintenanceMode ? 'Under Maintenance' : 'System Active'}
                        </div>
                    </div>

                    {/* Toggle Button */}
                    <ToggleButton
                        checked={isMaintenanceMode}
                        onChange={handleToggleMaintenance}
                        onLabel="Disable Maintenance"
                        offLabel="Enable Maintenance"
                        className={`w-48 p-3 text-lg rounded-lg transition-all duration-300 
                            ${isMaintenanceMode
                                ? 'bg-yellow-500 text-white border-yellow-500 hover:bg-yellow-600'
                                : 'bg-green-500 text-white border-green-500 hover:bg-green-600'}
                            ${loading ? 'opacity-50 pointer-events-none' : ''}`}
                        disabled={loading}
                    />

                    {/* Loading Indicator */}
                    {loading && (
                        <div className="flex items-center gap-2">
                            <ProgressSpinner style={{ width: '30px', height: '30px' }} />
                            <span className="text-gray-600">Updating...</span>
                        </div>
                    )}

                    <p className="text-sm text-gray-500 text-center">
                        {isMaintenanceMode
                            ? 'System is currently undergoing maintenance. Users may experience disruptions.'
                            : 'System is fully operational and accessible to all users.'}
                    </p>
                </div>
            </Card>
            {alert && <AlertMessage message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
        </div>
    );
};