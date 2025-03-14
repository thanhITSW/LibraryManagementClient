import { useEffect, useState, useRef } from "react";
import api from "../services/api";
import '../assets/css/Home.css';
import { FaSearch } from "react-icons/fa";
import BookDetails from "../components/BookDetails";
import AlertMessage from "../utils/AlertMessage"
import { getErrorMessage } from "../utils/ErrorHandler";
import { useLocation } from 'react-router-dom';
import { FaCartPlus } from 'react-icons/fa';

import { Paginator } from 'primereact/paginator';

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

const CategoryFilter = ({ categorys, selectedCategory, setSelectedCategory }) => (
    <div className="brand-filter">
        <label>Category:</label>
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            {categorys.map((category, index) => (
                <option key={index} value={category}>{category}</option>
            ))}
        </select>
    </div>
);


const BookCard = ({ product, onAddToCart, onClick }) => (
    <div className="product-card" onClick={() => onClick(product.id)}>
        <img src={product.imageUrl} alt={product.title} className="product-image" />
        <h2 className="product-name">{product.title}</h2>
        <p className="product-brand">{product.category}</p>
        <button className="add-to-cart-button" onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product.id);
        }}>
            <FaCartPlus />
        </button>
    </div>
);

export const Home = () => {

    const location = useLocation();
    const alertMessage = location.state?.alertMessage;
    const alertMessageStatus = location.state?.statusMessage;

    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [category, setCategory] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProductId, setSelectedProductId] = useState(null);

    const [totalRecords, setTotalRecords] = useState(0);
    const [first, setFirst] = useState(0);
    const rowsPerPage = 8;

    const [loading, setLoading] = useState(true);

    const [alert, setAlert] = useState(null);

    const showAlert = (message, type = "success") => {
        setAlert({ message, type });
        setTimeout(() => setAlert(null), 3000);
    };

    useEffect(() => {

        if (alertMessage) {
            showAlert(alertMessage, alertMessageStatus)
        }

        api.get("/common/books")
            .then(response => {
                const result = response.data;
                const productList = Array.isArray(result) ? result : [];
                setProducts(productList);
                setFilteredProducts(productList);
                setTotalRecords(result.length);

                const uniqueCategories = ["All", ...new Set(productList.map(product => product.category))] || [];
                setCategory(uniqueCategories);

                setLoading(false);
            })
            .catch(error => {
                setLoading(false);

                const { message, statusMessage } = getErrorMessage(error.response);
                showAlert(message, statusMessage);
                setCategory(["All"])
            });

    }, [alertMessage, alertMessageStatus]);

    useEffect(() => {
        if (selectedCategory === "All") {
            setFilteredProducts(products);
        } else {
            const filtered = products.filter(product => product.category === selectedCategory);
            setFilteredProducts(filtered);
        }
    }, [selectedCategory, products]);

    useEffect(() => {

        setLoading(true);
        setFirst(0)

        const params = new URLSearchParams();

        if (searchTerm.trim() !== "") {
            params.append("title.contains", searchTerm);
        }

        api.get(`/common/books/search?${params.toString()}`)
            .then(response => {
                const result = response.data;
                const productList = Array.isArray(result.content) ? result.content : [];
                setFilteredProducts(prevFilteredProducts => {
                    if (selectedCategory !== "All") {
                        if (searchTerm.trim() !== "") {
                            return productList.filter(product =>
                                prevFilteredProducts.some(filteredProduct => filteredProduct.id === product.id)
                            );
                        } else {
                            return productList.filter(product => product.category === selectedCategory);
                        }
                    } else {
                        return productList;
                    }
                });
                setTotalRecords(productList.length);

                setLoading(false);
            })
            .catch(error => {
                setLoading(false);

                const { message, statusMessage } = getErrorMessage(error.response);
                showAlert(message, statusMessage);
            });

    }, [searchTerm, selectedCategory]);

    const onPageChange = (event) => {
        setFirst(event.first);
    };

    const handleAddToCart = (productId) => {
        const token = localStorage.getItem("token");

        if (!token) {
            showAlert("You need to log in", "warning");
            return;
        }

        api.post(`/user/borrowing/borrow`, { bookId: productId }, { requiresAuth: true })
            .then(response => {
                showAlert(response.data.message, "success");
            })
            .catch(error => {
                const { message, statusMessage } = getErrorMessage(error.response);
                showAlert(message, statusMessage);
            });
    };

    const handleProductClick = (id) => {
        setSelectedProductId(id);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const currentProducts = filteredProducts.slice(first, first + rowsPerPage);

    if (loading) return <div className="loading-spinner"></div>;

    return (
        <>
            <div className="shop-container">
                <div className="filter-container">
                    <SearchBox searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
                    <CategoryFilter categorys={category} selectedCategory={selectedCategory} setSelectedCategory={setSelectedCategory} />
                </div>

                <div className="product-grid">
                    {currentProducts.length > 0 ? (
                        <>
                            {currentProducts.map((product) => (
                                <BookCard
                                    key={product.title}
                                    product={product}
                                    onAddToCart={handleAddToCart}
                                    onClick={handleProductClick}
                                />
                            ))}

                        </>
                    ) : (
                        <div className="no-products">
                            <p>There are no matching products.</p>
                        </div>
                    )}
                </div>

                {filteredProducts.length > 0 &&
                    <Paginator
                        first={first}
                        rows={rowsPerPage}
                        totalRecords={totalRecords}
                        onPageChange={onPageChange}
                    />}

                <BookDetails
                    visible={isModalOpen}
                    productId={selectedProductId}
                    onClose={closeModal}
                />
            </div>

            {alert && <AlertMessage message={alert.message} type={alert.type} onClose={() => setAlert(null)} />}
        </>
    );
};