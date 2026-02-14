import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Dashboard.css'; // Reuse dashboard layout styles
import './ProductList.css'; // Custom styles for product list
import './POS.css'; // Styles for POS section
import AutoSuggest from './AutoSuggest';

const ProductList = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // POS State
    const [product, setProduct] = useState('');
    const [rate, setRate] = useState('');
    const [qty, setQty] = useState('');
    const [cart, setCart] = useState([]);
    const [extraDiscount, setExtraDiscount] = useState(0);

    const userData = JSON.parse(localStorage.getItem('user')) || { username: 'Guest' };

    const handleAdd = () => {
        if (!product || !rate || !qty) return;
        const total = parseFloat(rate) * parseFloat(qty);
        setCart([...cart, { product, rate, qty, total }]);
        setProduct('');
        setRate('');
        setQty('');
    };

    const handleReset = () => {
        setCart([]);
        setProduct('');
        setRate('');
        setQty('');
        setExtraDiscount(0);
    };

    const totalAmount = cart.reduce((acc, item) => acc + item.total, 0);
    const finalTotal = totalAmount - extraDiscount;

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    const fetchSuggestions = async (query) => {
        if (!query) return [];
        const lowerQuery = query.toLowerCase();
        return products
            .filter(item => item.ItemName.toLowerCase().includes(lowerQuery))
            .map(item => ({
                name: item.ItemName,
                ...item
            }));
    };

    const handleProductSelect = (suggestion) => {
        setProduct(suggestion.name);
        setRate(suggestion.ItemRate);
        // Focus quantity input if needed, or leave it to user
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Assuming backend is running on localhost:3000
                const response = await fetch(
                    //    'http://localhost:3000/api/products'
                    "https://storebackendapp.vercel.app/api/products",
                );
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                const data = await response.json();
                setProducts(data);
            } catch (err) {
                console.error("Error fetching products:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    return (
        <div className="dashboard-container">
            <div className={`sidebar-overlay ${isSidebarOpen ? 'active' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>
            {/* <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
                <div className="sidebar-header">
                    <h2>Store<span>Admin</span></h2>
                </div>
                <nav className="sidebar-nav">
                    <Link to="/dashboard">Dashboard</Link>
                    <Link to="/products" className="active">Products</Link>
                    <Link to="#">Orders</Link>
                    <Link to="#">Customers</Link>
                    <Link to="#">Analytics</Link>
                    <Link to="#">Settings</Link>
                </nav>
                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-btn">Logout</button>
                </div>
            </aside> */}

            <main className="main-content">
                {/* <header className="top-bar">
                    <button className="menu-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        ☰
                    </button>
                    <div className="welcome-text">
                        <h1>Product Inventory</h1>
                        <p>Manage your store's products efficiently.</p>
                    </div>
                    <div className="user-profile">
                        <div className="avatar">{userData.username ? userData.username[0].toUpperCase() : 'G'}</div>
                    </div>
                </header> */}



                {loading ? (
                    <div className="loading-container">Loading products...</div>
                ) : error ? (
                    <div className="error-message">Error: {error}</div>
                ) : (
                    <div className="pos-container small">
                        <h1 className="title">Smple Data From Windows</h1>
                        <div className="table-container">
                            <table className="product-table">
                                <thead>
                                    <tr>
                                        <th>ID</th>
                                        <th>Product Name</th>
                                        <th>Stock</th>
                                        {/* <th className="text-right">Actions</th> */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => (
                                        <tr key={product._id}>
                                            <td className="product-id">#{product.ItemKey}</td>
                                            <td className="product-name">**{product.ItemName}**</td>
                                            <td className="product-price">₹{product.ItemRate}</td>
                                            {/* <td className="product-actions text-right">
            <button className="action-btn edit-btn">Edit</button>
            <button className="action-btn delete-btn">Delete</button>
          </td> */}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};

export default ProductList;
