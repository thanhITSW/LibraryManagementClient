import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import '../assets/css/ManageActivityLog.css';

import api from "../services/api";
import AlertMessage from "../utils/AlertMessage";
import React, { useState, useEffect, useRef } from "react";
import { getErrorMessage } from '../utils/ErrorHandler';

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Paginator } from 'primereact/paginator';
import { Button } from 'primereact/button';
import { FaSearch } from 'react-icons/fa';
import { InputText } from 'primereact/inputtext';
import ActivityLogDetails from "../components/ActivityLogDetails";

const SearchBox = ({ searchTerm, setSearchTerm }) => {
    const inputRef = useRef(null);
    const [tempSearch, setTempSearch] = useState(searchTerm);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            setSearchTerm(tempSearch);
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [tempSearch, setSearchTerm]);

    return (
        <div className="search-box">
            <FaSearch className="search-icon" />
            <input
                ref={inputRef}
                type="text"
                placeholder="Search activity log..."
                value={tempSearch}
                onChange={(e) => setTempSearch(e.target.value)}
            />
        </div>
    );
};

export const ManageActivityLog = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);
    const [totalRecords, setTotalRecords] = useState(0);
    const [first, setFirst] = useState(0);
    const rowsPerPage = 5;

    const [selectedLogIdDetails, setSelectedLogIdDetails] = useState(null);
    const [isModalOpenDetails, setIsModalOpenDetails] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [actionFilter, setActionFilter] = useState("");

    const token = localStorage.getItem("token");

    const showAlert = (message, type = "success") => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 3000);
    };

    const sortLogsByTimestamp = (data) => {
        return [...data].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    };

    useEffect(() => {
        if (!token) {
            return showAlert("You need to login", "warning");
        }

        setLoading(true);
        api.get(`/admin/activity-log`, { requiresAuth: true })
            .then(response => {
                const data = response.data;
                const sortedData = sortLogsByTimestamp(data); // Sort data by timestamp
                setLogs(sortedData);
                setFilteredLogs(sortedData);
                setTotalRecords(sortedData.length);
                setLoading(false);
            })
            .catch(error => {
                setLoading(false);
                const { message, statusMessage } = getErrorMessage(error.response);
                showAlert(message, statusMessage);
            });
    }, [token]);

    useEffect(() => {
        setLoading(true);
        setFirst(0);

        const params = new URLSearchParams();

        if (searchTerm.trim() !== "") {
            params.append("performedBy.contains", searchTerm);
        }

        const url = searchTerm.trim() !== "" ? `/admin/activity-log/search?${params.toString()}` : `/admin/activity-log`;

        api.get(url, { requiresAuth: true })
            .then(response => {
                const data = response.data.content || response.data || [];
                const sortedData = sortLogsByTimestamp(data); // Sort data by timestamp
                setLogs(sortedData);
                setLoading(false);
            })
            .catch(error => {
                setLoading(false);
                const { message, statusMessage } = getErrorMessage(error.response);
                showAlert(message, statusMessage);
            });

    }, [token, searchTerm]);

    const onPageChange = (event) => {
        setFirst(event.first);
    };

    const viewDetails = (rowData) => {
        setSelectedLogIdDetails(rowData.id);
        setIsModalOpenDetails(true);
    };

    const closeModalDetails = () => {
        setIsModalOpenDetails(false);
    };

    const detailsBodyTemplate = (rowData) => {
        return <Button label="View" className="p-button-sm p-button-info" onClick={() => viewDetails(rowData)} />;
    };

    const applyActionFilter = (data, filterValue) => {
        const filtered = filterValue
            ? data.filter(log => log.action.toLowerCase().includes(filterValue.toLowerCase()))
            : data;
        setFilteredLogs(filtered);
        setTotalRecords(filtered.length);
    };

    // Handle action filter input change
    const onActionFilterChange = (e) => {
        const value = e.target.value;
        setActionFilter(value);
        applyActionFilter(logs, value); // Filter the full dataset
    };

    const actionFilterHeader = (
        <InputText
            value={actionFilter}
            onChange={onActionFilterChange}
            placeholder="Filter by Action"
            style={{ width: '100%' }}
        />
    );

    const onFilter = (e) => {
        const filterValue = e.filters.action?.value || "";
        setActionFilter(filterValue);
        applyActionFilter(logs, filterValue);
    };

    if (loading) return <div className="loading-spinner"></div>;
    return (
        <>
            <div className="products">

                <SearchBox searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

                {logs.length === 0 ? (
                    <p>No members available.</p>
                ) : (
                    <>
                        <DataTable value={filteredLogs.slice(first, first + rowsPerPage)} paginator={false} responsiveLayout="scroll"
                            onFilter={onFilter}
                            filters={{
                                action: { value: actionFilter, matchMode: 'contains' }
                            }}
                        >
                            <Column field="performedBy" header="Perform By" sortable />
                            <Column
                                field="action"
                                header="Action"
                                sortable
                                filter
                                filterMatchMode="contains"
                                filterElement={actionFilterHeader}
                                showFilterMenu={true}
                            />
                            <Column field="description" header="Description" />
                            <Column field="timestamp" header="Time Stamp" sortable />
                            <Column body={detailsBodyTemplate} header="Details" />
                        </DataTable>
                    </>
                )}

                <Paginator
                    first={first}
                    rows={rowsPerPage}
                    totalRecords={totalRecords}
                    onPageChange={onPageChange}
                />

                <ActivityLogDetails
                    visible={isModalOpenDetails}
                    logId={selectedLogIdDetails}
                    onClose={closeModalDetails}
                />

                {alert && <AlertMessage message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
            </div>
        </>
    );
};