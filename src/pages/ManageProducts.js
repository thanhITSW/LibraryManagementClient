import 'primereact/resources/themes/lara-light-blue/theme.css';
import 'primereact/resources/primereact.min.css';
import '../assets/css/ManageProducts.css';

import api from "../services/api";
import AlertMessage from "../utils/AlertMessage";
import React, { useState, useEffect, useRef } from "react";
import { getErrorMessage } from '../utils/ErrorHandler';
import AddProduct from "../components/AddProduct";
import EditProduct from "../components/EditProduct";
import { FileUpload } from 'primereact/fileupload';

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
                placeholder="Search book..."
                value={tempSearch}
                onChange={(e) => setTempSearch(e.target.value)}
            />
        </div>
    );
};

export const ManageProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);
    const [totalRecords, setTotalRecords] = useState(0);
    const [first, setFirst] = useState(0);
    const rowsPerPage = 5;

    const [isModalOpenEdit, setIsModalOpenEdit] = useState(false);
    const [selectedProductIdEdit, setSelectedProductIdEdit] = useState(null);

    const [isModalOpenAdd, setIsModalOpenAdd] = useState(false);

    const [searchTerm, setSearchTerm] = useState("");
    let dt = useRef(null);
    const fileUploadRef = useRef(null);

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
        api.get(`/admin/books`, { requiresAuth: true })
            .then(response => {
                setProducts(response.data);
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
            params.append("title.contains", searchTerm);
        }

        const url = searchTerm.trim() !== "" ? `/admin/books/search?${params.toString()}` : `/admin/books`;

        api.get(url, { requiresAuth: true })
            .then(response => {
                const data = response.data.content || response.data || [];
                setProducts(data);
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

    const imageBodyTemplate = (rowData) => {
        return <img src={rowData.imageUrl} alt={rowData.title} style={{ width: '50px', borderRadius: '5px' }} />;
    };


    const addProductModel = () => {
        setIsModalOpenAdd(true)
    };

    const closeModalAdd = (isAdded = false, message = "", addedProduct = null) => {

        if (isAdded === true) {
            setProducts(prevProducts => {
                const updatedProducts = [...prevProducts, addedProduct];
                setTotalRecords(prev => prev + 1);
                return updatedProducts;
            });

            showAlert(message, "success");
        }

        setIsModalOpenAdd(false);
    };

    const editProduct = (rowData) => {
        setSelectedProductIdEdit(rowData.id);
        setIsModalOpenEdit(true);
    };

    const closeModalEdit = (isUpdated = false, message = "", updatedProduct = null) => {

        if (isUpdated === true) {
            setProducts(prevProducts =>
                prevProducts.map(product =>
                    product.id === updatedProduct.id ? updatedProduct : product
                )
            );

            showAlert(message, "success");
        }

        setIsModalOpenEdit(false);
    };

    const deleteProduct = (rowData) => {
        if (!window.confirm("Are you sure you want to delete this book?")) return;

        if (!token) {
            showAlert("You need to login", "warning");
            return;
        }

        api.delete(
            `/admin/books/${rowData.id}`,
            { requiresAuth: true }
        )
            .then(response => {
                setProducts(prevProducts =>
                    prevProducts.filter(product => product.id !== rowData.id)
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
                <Button className="p-button-sm p-button-warning" onClick={() => editProduct(rowData)} ><FaEdit /></Button>
                <Button className="p-button-sm p-button-danger" onClick={() => deleteProduct(rowData)} ><FaTrash /></Button>
            </div>
        );
    };

    const handleUpload = async (event) => {
        if (!event.files.length) return;

        const file = event.files[0];
        const formData = new FormData();
        formData.append("file", file);

        try {
            const response = await api.post("/admin/books/import-csv", formData, { requiresAuth: true }, 
                {headers: {
                    "Content-Type": "multipart/form-data"
                }}
            );

            if(response.status === 200){
                showAlert(response.data.message, "success");
                fileUploadRef.current.clear();
            }

        } catch (error) {
            const { message, statusMessage } = getErrorMessage(error.response);
            showAlert(message, statusMessage);
            fileUploadRef.current.clear();
        }
    };

    if (loading) return <div className="loading-spinner"></div>;
    return (
        <>
            <div className="products">

                <SearchBox searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

                <AddProduct
                    visible={isModalOpenAdd}
                    onClose={closeModalAdd}
                />

                <EditProduct
                    visible={isModalOpenEdit}
                    productId={selectedProductIdEdit}
                    onClose={closeModalEdit}
                />

                <div className="button-group">
                    <Button label="Add New Book" className="p-button-sm p-button-success add-button" onClick={() => addProductModel()} />
                    <Button label="Export CSV" className="p-button-sm p-button-info export-button" onClick={() => dt.exportCSV()} />
                    <FileUpload
                        ref={fileUploadRef}
                        name="csvFile"
                        accept=".csv"
                        mode="basic"
                        chooseLabel="Import CSV"
                        customUpload
                        uploadHandler={handleUpload}
                        className="import-button"
                    />
                </div>

                {products.length === 0 ? (
                    <p>No products available.</p>
                ) : (
                    <>
                        <DataTable ref={(el) => (dt = el)} value={products.slice(first, first + rowsPerPage)} paginator={false} responsiveLayout="scroll">
                            <Column field="title" header="Title" sortable />
                            <Column body={imageBodyTemplate} header="Image" />
                            <Column field="author" header="Author" sortable />
                            <Column field="category" header="Category" sortable />
                            <Column field="totalCopies" header="Total Copies" sortable />
                            <Column field="availableCopies" header="Available Copies" sortable />
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