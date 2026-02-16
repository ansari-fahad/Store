import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ProductList from './components/ProductList';
import SalesOrder from './components/SalesOrder';
import SalesFinal from './components/SalesFinal';

function App() {
  return (
    <Router>
      <div className="background-glow"></div>
      <div className="background-glow-2"></div>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/products" element={<ProductList />} />
        <Route path="/salesorder" element={<SalesOrder />} />
        <Route path="/salesfinal" element={<SalesFinal />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App
