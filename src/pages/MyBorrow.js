import '../assets/css/MyBorrow.css';
import api from "../services/api";
import AlertMessage from "../utils/AlertMessage";
import React, { useState, useEffect } from "react";
import { getErrorMessage } from '../utils/ErrorHandler';
import BookDetails from "../components/BookDetails";
import { ConfirmDialog } from 'primereact/confirmdialog';

export const MyBorrow = () => {
    const [books, setBooks] = useState([]);
    const token = localStorage.getItem("token");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedBorrowId, setSelectedBorrowId] = useState(null);

    const [loading, setLoading] = useState(true);
    const [alert, setAlert] = useState(null);

    const [visible, setVisible] = useState(false);
    const [pendingBorrowId, setPendingBorrowId] = useState(null);

    const showAlert = (message, type = "success") => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 3000);
    };

    useEffect(() => {
        setLoading(true);
        api.get(`/user/borrowing/borrowed-books`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(response => {
                setBooks(Array.isArray(response.data) ? response.data : []);
                setLoading(false);
            })
            .catch(error => {
                setLoading(false);
                const { message, statusMessage } = getErrorMessage(error.response);
                showAlert(message, statusMessage);
            });
    }, [token]);

    const confirmReturnBorrow = (bookId) => {
        setPendingBorrowId(bookId);
        setVisible(true);
    };

    const handleCancelBorrow = () => {
        api.post(
            `/user/borrowing/return`, { bookId: pendingBorrowId },
            { headers: { Authorization: `Bearer ${token}` } }
        )
            .then(response => {
                showAlert(response.data.message, "success");

                setBooks(prevBooks => {
                    return prevBooks.map(book =>
                        book.bookId === pendingBorrowId
                            ? { ...book, returnDate: new Date().toISOString().split('T')[0], returned: true }
                            : book
                    ).sort((a, b) => a.returned - b.returned);
                });
            })
            .catch(error => {
                const { message, statusMessage } = getErrorMessage(error.response);
                showAlert(message, statusMessage);
            });
    };

    const handleViewBorrowClick = (id) => {
        setSelectedBorrowId(id);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    if (loading) return <div className="loading">Loading books...</div>;

    return (
        <div className="my-borrows">
            <h2>My list borrow books</h2>

            {books.length === 0 ? (
                <p>You have no books yet.</p>
            ) : (
                <table className="borrows-table">
                    <thead>
                        <tr>
                            <th>Details</th>
                            <th>Book</th>
                            <th>Borrow Date</th>
                            <th>Return Date</th>
                            <th>Returned</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                    {[...books]
                        .sort((a, b) => a.returned - b.returned)
                        .map(book => (
                            <tr key={book.bookId}>
                                <td>
                                    <button className="details-button" onClick={() => handleViewBorrowClick(book.bookId)}>
                                        View
                                    </button>
                                </td>
                                <td>{book.title}</td>
                                <td>{book.borrowDate}</td>
                                <td>{book.returnDate}</td>
                                <td>{book.returned ? "Yes" : "No"}</td>
                                {/* <td>{new Date(book.creation_date).toLocaleDateString()}</td> */}
                                <td>
                                    {(!book.returned) && (
                                        <button className="cancel-button" onClick={() => confirmReturnBorrow(book.bookId)}>
                                            Return
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>

                </table>

            )}

            <ConfirmDialog
                visible={visible}
                onHide={() => setVisible(false)}
                message="Are you sure you want to return this book?"
                header="Return Confirmation"
                icon="pi pi-exclamation-triangle"
                accept={handleCancelBorrow}
                reject={() => setVisible(false)}
                style={{ width: '50vw' }}
                breakpoints={{ '1100px': '75vw', '960px': '100vw' }}
            />

            <BookDetails
                visible={isModalOpen}
                productId={selectedBorrowId}
                onClose={closeModal}
            />

            {alert && <AlertMessage message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
        </div>
    );
};