import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Dashboard.css'; // Reuse dashboard layout styles
import './ProductList.css'; // Custom styles for product list

const ProductList = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const userData = JSON.parse(localStorage.getItem('user')) || { username: 'Guest' };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
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
            <aside className="sidebar">
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
            </aside>

            <main className="main-content">
                <header className="top-bar">
                    <div className="welcome-text">
                        <h1>Product Inventory</h1>
                        <p>Manage your store's products efficiently.</p>
                    </div>
                    <div className="user-profile">
                        <div className="avatar">{userData.username ? userData.username[0].toUpperCase() : 'G'}</div>
                    </div>
                </header>

                {loading ? (
                    <div className="loading-container">Loading products...</div>
                ) : error ? (
                    <div className="error-message">Error: {error}</div>
                ) : (
                    <div className="product-grid">
                        {products.map((product) => (
                            <div key={product._id} className="product-card">
                                <div className="product-header">
                                    <span className="product-id">#{product.ItemKey}</span>
                                </div>
                                <h3 className="product-name">{product.ItemName}</h3>
                                <div className="product-price">₹{product.ItemRate}</div>
                                <div className="product-actions">
                                    <button className="action-btn edit-btn">Edit</button>
                                    <button className="action-btn delete-btn">Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default ProductList;
