import React, { useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Button } from 'primereact/button';
import '../assets/css/AddProduct.css';
import AlertMessage from "../utils/AlertMessage";
import api from "../services/api";
import { getErrorMessage } from '../utils/ErrorHandler';

const AddProductModel = ({ visible, onClose }) => {
    const [productDetails, setProductDetails] = useState({
        title: '',
        author: '',
        category: '',
        totalCopies: 0,
        availableCopies: 0,
        url_image: ''
    });
    
    const [selectedImage, setSelectedImage] = useState(null);

    const [loading, setLoading] = useState(false);
    const [alert, setAlert] = useState(null);

    const showAlert = (message, type = "success") => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 3000);
    };

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

        const data = {
            title: productDetails.title,
            author: productDetails.author,
            category: productDetails.category,
            totalCopies: productDetails.totalCopies,
            availableCopies: productDetails.availableCopies,
        }

        setLoading(true)
        api.post(`/admin/books`, data, { requiresAuth: true }, {
            headers: {
                "Content-Type": "application/json"
            }
        })
            .then(response => {
                setLoading(false)
                const addProduct = response.data;

                const formData = new FormData();

                if (selectedImage) {   
                    formData.append("file", selectedImage);
                    api.post(`/admin/books/${addProduct.id}/upload`, formData, { requiresAuth: true }, {
                        headers: {
                            "Content-Type": "multipart/form-data"
                        }
                    })
                }

                onClose(true, "Add books successfully", addProduct);
            })
            .catch(error => {
                setLoading(false)
                const { message, statusMessage } = getErrorMessage(error.response);
                showAlert(message, statusMessage);
            });
    };

    if (loading) return <div className="loading-spinner"></div>;

    return (
        <Dialog
            visible={visible}
            onHide={onClose}
            header="Add Book"
            style={{ width: '50vw' }}
        >
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
            {alert && <AlertMessage message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
        </Dialog>
    );
};

export default AddProductModel;
