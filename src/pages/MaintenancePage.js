import React from 'react';
import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';
import '../assets/css/MaintenancePage.css';

export const MaintenancePage = () => {
    const header = (
        <div className="maintenance-header">
            <i className="pi pi-cog spin-icon" style={{ fontSize: '3rem' }}></i>
            <h1>System Under Maintenance</h1>
        </div>
    );

    return (
        <div className="maintenance-container">
            <Card
                header={header}
                className="maintenance-card-common"
            >
                <div className="maintenance-content">
                    <ProgressSpinner
                        style={{ width: '50px', height: '50px' }}
                        strokeWidth="4"
                        animationDuration="2s"
                    />
                    <p className="maintenance-message">
                        We are upgrading our system to provide you with a better experience. Please come back later!
                    </p>
                </div>
            </Card>
        </div>
    );
};