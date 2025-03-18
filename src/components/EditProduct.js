import React, { useState, useEffect } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import '../assets/css/EditProduct.css';
import AlertMessage from "../utils/AlertMessage";
import api from "../services/api";
import { getErrorMessage } from '../utils/ErrorHandler';

const EditProductModel = ({ visible, productId, onClose }) => {
    const [productDetails, setProductDetails] = useState(null);
    const [selectedImage, setSelectedImage] = useState(null);

    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);

    const showAlert = (message, type = "success") => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 3000);
    };

    useEffect(() => {
        if (productId) {
            setLoading(true);
            api.get(`/common/books/${productId}`)
                .then(response => {
                    setProductDetails(response.data);
                    setLoading(false);
                })
                .catch(error => {
                    setLoading(false);
                    const { message, statusMessage } = getErrorMessage(error.response);
                    showAlert(message, statusMessage);
                });
        }
    }, [productId, visible]);

    const handleChange = (e, field) => {
        setProductDetails(prevState => ({
            ...prevState,
            [field]: e.target.value
        }));
    };


    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
        }
    };

    const handleSave = () => {
        if (!productDetails) return;

        if (
            !productDetails.title ||
            !productDetails.author ||
            !productDetails.category ||
            !productDetails.totalCopies ||
            !productDetails.availableCopies
        ) {
            showAlert("Please fill in all fields.", "warning");
            return;
        }

        if (
            productDetails.totalCopies <= 0 ||
            productDetails.availableCopies <= 0
        ) {
            showAlert("Total Copies and available copies must be greater than 0.", "warning");
            return;
        }

        const token = localStorage.getItem("token");

        if (!token) {
            showAlert("You need to login", "warning");
            return;
        }

        const formData = new FormData();

        const data = {
            title: productDetails.title,
            author: productDetails.author,
            category: productDetails.category,
            totalCopies: productDetails.totalCopies,
            availableCopies: productDetails.availableCopies,
        }

        if (selectedImage) {
            formData.append("image", selectedImage);
        }

        setLoading(true)
        api.put(`/admin/books/${productId}`, data, { requiresAuth: true },
            {
                headers: {
                    "Content-Type": "application/json"
                }
            })
            .then(response => {
                setLoading(false)
                const updatedProduct = response.data;
                if (selectedImage) {
                    formData.append("file", selectedImage);

                    api.post(`/admin/books/${updatedProduct.id}/upload`, formData,
                        {
                            headers: {
                                "Content-Type": "multipart/form-data",
                                Authorization: `Bearer ${token}`
                            }
                        })
                }

                onClose(true, "Update Book successfully", updatedProduct);
            })
            .catch(error => {
                setLoading(false)
                const { message, statusMessage } = getErrorMessage(error.response);
                showAlert(message, statusMessage);
            });
    };

    return (
        <Dialog
            visible={visible}
            onHide={onClose}
            header="Edit Book"
            style={{ width: '50vw' }}
        >
            {loading ? (
                <div className="loading-spinner"></div>
            ) : productDetails ? (
                <div className="product-edit-form">
                    <h3>Basic Information</h3>
                    <div className="p-field">
                        <label>Title</label>
                        <InputText value={productDetails.title} onChange={(e) => handleChange(e, "title")} />
                    </div>
                    <div className="p-field">
                        <label>Author</label>
                        <InputText value={productDetails.author} onChange={(e) => handleChange(e, "author")} />
                    </div>
                    <div className="p-field">
                        <label>Category</label>
                        <InputText value={productDetails.category} onChange={(e) => handleChange(e, "category")} />
                    </div>
                    <div className="p-field">
                        <label>Total Copies</label>
                        <InputNumber value={productDetails.totalCopies} onValueChange={(e) => handleChange(e, "totalCopies")} />
                    </div>
                    <div className="p-field">
                        <label>Available Copies</label>
                        <InputNumber value={productDetails.availableCopies} onValueChange={(e) => handleChange(e, "availableCopies")} />
                    </div>

                    <div className="p-field image-upload-container">
                        <label>Image</label>
                        <div className="image-preview">
                            {selectedImage ? (
                                <img src={URL.createObjectURL(selectedImage)} alt="Preview" className="image-preview-img" />
                            ) : productDetails?.imageUrl ? (
                                <img src={productDetails.imageUrl} alt="Current Product" className="image-preview-img" />
                            ) : (
                                <span className="image-placeholder">No image selected</span>
                            )}
                        </div>
                        <input type="file" accept="image/*" onChange={handleImageChange} className="image-upload-input" />
                    </div>

                    <div className="p-dialog-footer">
                        <Button label="Save" className="p-button-success" onClick={handleSave} />
                        <Button label="Cancel" className="p-button-secondary" onClick={onClose} />
                    </div>
                </div>
            ) : (
                <p>Product not found</p>
            )}

            {alert && <AlertMessage message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
        </Dialog>
    );
};

export default EditProductModel;
