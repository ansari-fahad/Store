import React from 'react';
import './Dashboard.css';

import { useNavigate, Link } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    const userData = JSON.parse(localStorage.getItem('user')) || { username: 'Guest' };

    const handleLogout = () => {
        localStorage.removeItem('user');
        navigate('/');
    };

    return (
        <div className="dashboard-container">
            <aside className="sidebar">
                <div className="sidebar-header">
                    <h2>Store<span>Admin</span></h2>
                </div>
                <nav className="sidebar-nav">
                    <Link to="/dashboard" className="active">Dashboard</Link>
                    <Link to="/products">Products</Link>
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
                        <h1>Welcome back, {userData.username}!</h1>
                        <p>Here's what's happening with your store today.</p>
                    </div>
                    <div className="user-profile">
                        <div className="avatar">{userData.username[0].toUpperCase()}</div>
                    </div>
                </header>

                <div className="stats-grid">
                    <div className="stat-card">
                        <h3>Total Sales</h3>
                        <p className="value">$12,345</p>
                        <span className="trend positive">+15% from last month</span>
                    </div>
                    <div className="stat-card">
                        <h3>Active Orders</h3>
                        <p className="value">45</p>
                        <span className="trend neutral">Currently processing</span>
                    </div>
                    <div className="stat-card">
                        <h3>Total Customers</h3>
                        <p className="value">1,234</p>
                        <span className="trend positive">+5% new users</span>
                    </div>
                    <div className="stat-card">
                        <h3>Revenue</h3>
                        <p className="value">$45.2k</p>
                        <span className="trend negative">-2% from last week</span>
                    </div>
                </div>

                <div className="recent-activity">
                    <h2>Recent Activity</h2>
                    <div className="activity-list">
                        <div className="activity-item">
                            <span className="dot"></span>
                            <p>New order #1023 placed by <strong>John Doe</strong></p>
                            <span className="time">5m ago</span>
                        </div>
                        <div className="activity-item">
                            <span className="dot"></span>
                            <p>Stock update: <strong>Nike Air Max</strong> low on stock</p>
                            <span className="time">2h ago</span>
                        </div>
                        <div className="activity-item">
                            <span className="dot"></span>
                            <p>New user registered: <strong>Sarah Smith</strong></p>
                            <span className="time">4h ago</span>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
