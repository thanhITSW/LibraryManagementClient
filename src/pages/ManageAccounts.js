import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import '../assets/css/ManageProducts.css';

import api from "../services/api";
import AlertMessage from "../utils/AlertMessage";
import React, { useState, useEffect, useRef } from "react";
import { getErrorMessage } from '../utils/ErrorHandler';
import AddAccount from "../components/ManageAccounts/AddAccount";
import EditAccount from "../components/ManageAccounts/EditAccount";

import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Paginator } from 'primereact/paginator';
import { Button } from 'primereact/button';
import { FaTrash, FaEdit, FaSearch } from 'react-icons/fa';

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
                placeholder="Search member..."
                value={tempSearch}
                onChange={(e) => setTempSearch(e.target.value)}
            />
        </div>
    );
};

export const ManageAccounts = () => {
    const [accounts, setAccounts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);
    const [totalRecords, setTotalRecords] = useState(0);
    const [first, setFirst] = useState(0);
    const rowsPerPage = 5;

    const [isModalOpenEdit, setIsModalOpenEdit] = useState(false);
    const [selectedAccountIdEdit, setSelectedAccountIdEdit] = useState(null);

    const [isModalOpenAdd, setIsModalOpenAdd] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");

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
        api.get(`/admin/accounts`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                setAccounts(response.data);
                setTotalRecords(response.data.length);
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
            params.append("email.contains", searchTerm);
        }

        const url = searchTerm.trim() !== "" ? `/admin/accounts/search?${params.toString()}` : `/admin/accounts`;

        api.get(url, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                const data = response.data.content || response.data || [];
                setAccounts(data);
                setTotalRecords(data.length);
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

    const addAccountModel = () => {
        setIsModalOpenAdd(true)
    };

    const closeModalAdd = (isAdded = false, message = "", addedAccount = null) => {

        if (isAdded === true) {
            setAccounts(prevAccounts => {
                const updatedAccounts = [...prevAccounts, addedAccount];
                setTotalRecords(prev => prev + 1);
                return updatedAccounts;
            });

            showAlert(message, "success");
        }

        setIsModalOpenAdd(false);
    };

    const editAccount = (rowData) => {
        setSelectedAccountIdEdit(rowData.id);
        setIsModalOpenEdit(true);
    };

    const closeModalEdit = (isUpdated = false, message = "", updatedAccount = null) => {

        if (isUpdated === true) {
            setAccounts(prevAccounts =>
                prevAccounts.map(account =>
                    account.id === updatedAccount.id ? updatedAccount : account
                )
            );

            showAlert(message, "success");
        }

        setIsModalOpenEdit(false);
    };

    const deleteAccount = (rowData) => {
        if (!window.confirm("Are you sure you want to delete this book?")) return;

        if (!token) {
            showAlert("You need to login", "warning");
            return;
        }

        api.delete(
            `/admin/accounts/${rowData.id}`,
            { headers: { Authorization: `Bearer ${token}` } }
        )
            .then(response => {
                setAccounts(prevAccounts =>
                    prevAccounts.filter(account => account.id !== rowData.id)
                );

                setTotalRecords(prev => prev - 1);

                showAlert(response.data.message, "success");
            })
            .catch(error => {
                const { message, statusMessage } = getErrorMessage(error.response);
                showAlert(message, statusMessage);
            });
    };


    const actionBodyTemplate = (rowData) => {
        return (
            <div className="action-buttons">
                <Button className="p-button-sm p-button-warning" onClick={() => editAccount(rowData)} ><FaEdit /></Button>
                <Button className="p-button-sm p-button-danger" onClick={() => deleteAccount(rowData)} ><FaTrash /></Button>
            </div>
        );
    };

    if (loading) return <div className="loading-spinner"></div>;
    return (
        <>
            <div className="products">

                <SearchBox searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

                <AddAccount
                    visible={isModalOpenAdd}
                    onClose={closeModalAdd}
                />

                <EditAccount
                    visible={isModalOpenEdit}
                    accountId={selectedAccountIdEdit}
                    onClose={closeModalEdit}
                />

                <div className="button-group">
                    <Button label="Add New Member" className="p-button-sm p-button-success add-button" onClick={() => addAccountModel()} />
                </div>

                {accounts.length === 0 ? (
                    <p>No members available.</p>
                ) : (
                    <>
                        <DataTable value={accounts.slice(first, first + rowsPerPage)} paginator={false} responsiveLayout="scroll">
                            <Column field="email" header="email" sortable />
                            <Column field="firstName" header="First Name" sortable />
                            <Column field="lastName" header="Last Name" sortable />
                            <Column field="dob" header="Day of birth" sortable />
                            <Column field="phone" header="Phone" sortable />
                            <Column field="active" header="Active" sortable />
                            <Column body={actionBodyTemplate} header="Action" />
                        </DataTable>
                    </>
                )}

                <Paginator
                    first={first}
                    rows={rowsPerPage}
                    totalRecords={totalRecords}
                    onPageChange={onPageChange}
                />

                {alert && <AlertMessage message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
            </div>
        </>
    );
};