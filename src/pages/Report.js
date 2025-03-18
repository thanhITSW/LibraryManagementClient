import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import React, { useState } from 'react';
import { Chart } from 'primereact/chart';
import { Calendar } from 'primereact/calendar';
import { Button } from 'primereact/button';
import { Dropdown } from 'primereact/dropdown';
import { Card } from 'primereact/card';
import api from "../services/api";
import AlertMessage from "../utils/AlertMessage";
import { getErrorMessage } from '../utils/ErrorHandler';

export const Report = () => {
    const [data, setData] = useState({
        totalUsers: 0,
        borrowedBooks: {},
        totalBooks: 0,
    });

    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const [quickOption, setQuickOption] = useState(null);
    const [alert, setAlert] = useState(null);
    const [loading, setLoading] = useState(false);

    const showAlert = (message, type = "success") => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 3000);
    };

    const quickOptions = [
        { label: 'Today', value: 'today' },
        { label: 'Yesterday', value: 'yesterday' },
        { label: 'This Month', value: 'thisMonth' },
        { label: 'This Year', value: 'thisYear' },
    ];

    const handleQuickOptionChange = (e) => {
        const value = e.value;
        setQuickOption(value);

        const today = new Date();
        let start, end;

        switch (value) {
            case 'today':
                start = new Date(today);
                end = new Date(today);
                break;
            case 'yesterday':
                start = new Date(today);
                start.setDate(today.getDate() - 1);
                end = new Date(start);
                break;
            case 'thisMonth':
                start = new Date(today.getFullYear(), today.getMonth(), 1);
                end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
                break;
            case 'thisYear':
                start = new Date(today.getFullYear(), 0, 1);
                end = new Date(today.getFullYear(), 11, 31);
                break;
            default:
                start = null;
                end = null;
        }

        setStartDate(start);
        setEndDate(end);
    };

    const loadData = async () => {
        if (!startDate || !endDate) {
            return;
        }

        try {
            setLoading(true);
            const start = startDate.toISOString().split('T')[0];
            const end = endDate.toISOString().split('T')[0];

            const response = await api.post(
                `/admin/borrowing/report`, { fromDate: start, toDate: end },
                { requiresAuth: true }
            )
            setData(response.data);
            if (response.data.totalBooks === 0) {
                showAlert("No data found", "info");
            }
            else {
                showAlert("Data loaded successfully", "success");
            }
            setLoading(false);
        } catch (error) {
            setLoading(false);
            const { message, statusMessage } = getErrorMessage(error.response);
            showAlert(message, statusMessage);
        }
    };

    const chartData = {
        labels: Object.keys(data.borrowedBooks),
        datasets: [
            {
                label: 'Borrow quantity',
                data: Object.values(data.borrowedBooks),
                backgroundColor: '#42A5F5',
            },
        ],
    };

    const chartOptions = {
        scales: {
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Quantity',
                },
                ticks: {
                    stepSize: 1,
                    precision: 0,
                },
            },
            x: {
                title: {
                    display: true
                },
            },
        },
    };

    if (loading) return <div className="loading-spinner"></div>;

    return (
        <div style={{ padding: '20px' }}>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <div>
                    <label>From date: </label>
                    <Calendar
                        value={startDate}
                        onChange={(e) => setStartDate(e.value)}
                        dateFormat="dd/mm/yy"
                        showIcon
                    />
                </div>
                <div>
                    <label>To date: </label>
                    <Calendar
                        value={endDate}
                        onChange={(e) => setEndDate(e.value)}
                        dateFormat="dd/mm/yy"
                        showIcon
                    />
                </div>
                <div>
                    <label>Quick options: </label>
                    <Dropdown
                        value={quickOption}
                        options={quickOptions}
                        onChange={handleQuickOptionChange}
                        placeholder="Options"
                    />
                </div>
                <Button label="Load Data" onClick={loadData} />
            </div>

            <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
                <Card title="Total number of users" style={{ width: '200px', textAlign: 'center' }}>
                    <h3>{data.totalUsers}</h3>
                </Card>
                <Card title="Total number of books borrowed" style={{ width: '200px', textAlign: 'center' }}>
                    <h3>{data.totalBooks}</h3>
                </Card>
            </div>

            {Object.keys(data.borrowedBooks).length > 0 && (
                <Chart
                    type="bar"
                    data={chartData}
                    options={chartOptions}
                    style={{ width: '100%', marginBottom: '50px' }}
                />
            )}

            {alert && <AlertMessage message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
        </div>
    );
};