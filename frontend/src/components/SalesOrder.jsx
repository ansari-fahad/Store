import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css'; // Reuse dashboard layout styles
import './POS.css'; // Styles for POS section
import AutoSuggest from './AutoSuggest';

const SalesOrder = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Customer State
    const [customers, setCustomers] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [outstanding, setOutstanding] = useState(null);

    // POS State
    const [product, setProduct] = useState('');
    const [rate, setRate] = useState('');
    const [qty, setQty] = useState('');
    const [cart, setCart] = useState([]);
    const [extraDiscount, setExtraDiscount] = useState(0);

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

    const fetchCustomerSuggestions = async (query) => {
        if (!query) return [];
        const lowerQuery = query.toLowerCase();
        return customers
            .filter(item => item.PartyName && item.PartyName.toLowerCase().includes(lowerQuery))
            .map(item => ({
                name: item.PartyName,
                ...item
            }));
    };

    const handleCustomerSelect = (suggestion) => {
        setCustomerName(suggestion.name);
        setCustomerPhone(suggestion.Mobile || '');
        setOutstanding(suggestion.Outstanding || 0.00);
    };

    const handleProductSelect = (suggestion) => {
        setProduct(suggestion.name);
        setRate(suggestion.ItemRate);
        // Focus quantity input if needed
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await fetch("https://storebackendapp.vercel.app/api/products");
                if (!response.ok) throw new Error('Failed to fetch products');
                const data = await response.json();
                setProducts(data);
            } catch (err) {
                console.error("Error fetching products:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        const fetchCustomers = async () => {
            try {
                const response = await fetch("https://storebackendapp.vercel.app/api/parties");
                if (!response.ok) throw new Error('Failed to fetch customers');
                const data = await response.json();
                setCustomers(data);
            } catch (err) {
                console.error("Error fetching customers:", err);
            }
        };

        fetchProducts();
        fetchCustomers();
    }, []);

    return (
        <div className="dashboard-container">
            <main className="main-content">
                <div className="pos-container">
                    <h2 className="title">Sales Entry</h2>

                    {/* Customer Section */}
                    <div className="section customer-section" style={{ alignItems: 'flex-end' }}>
                        <div style={{ flex: 1.5, position: 'relative' }}>
                            {outstanding !== null && (
                                <div style={{
                                    position: 'absolute',
                                    top: '-25px',
                                    right: '0',
                                    color: '#ef4444',
                                    fontWeight: 'bold',
                                    fontSize: '0.9rem',
                                    background: 'rgba(0,0,0,0.4)',
                                    padding: '2px 8px',
                                    borderRadius: '4px'
                                }}>
                                    Outstanding: ₹ {Number(outstanding).toFixed(2)}
                                </div>
                            )}
                            <AutoSuggest
                                fetchSuggestions={fetchCustomerSuggestions}
                                onSelect={handleCustomerSelect}
                                inputValue={customerName}
                                setInputValue={setCustomerName}
                                Setclass="pos-input w-100"
                            />
                        </div>
                        <input
                            className="pos-input"
                            placeholder="Phone Number"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                        />
                    </div>

                    {/* Product Entry */}
                    <div className="section product-entry-section">
                        <div style={{ flex: 2 }}>
                            <AutoSuggest
                                fetchSuggestions={fetchSuggestions}
                                onSelect={handleProductSelect}
                                inputValue={product}
                                setInputValue={setProduct}
                                Setclass="pos-input product-name-input w-100"
                            />
                        </div>
                        <input
                            className="pos-input"
                            type="number"
                            placeholder="Rate"
                            value={rate}
                            onChange={(e) => setRate(e.target.value)}
                        />
                        <input
                            className="pos-input"
                            type="number"
                            placeholder="Qty"
                            value={qty}
                            onChange={(e) => setQty(e.target.value)}
                        />
                        <input
                            className="pos-input"
                            type="number"
                            placeholder="Total"
                            value={rate && qty ? rate * qty : ""}
                            readOnly
                        />
                        <button className="btn add" onClick={handleAdd}>Add</button>
                        <button className="btn reset" onClick={handleReset}>Reset</button>
                    </div>

                    {/* Product Grid */}
                    <table className="grid">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Product</th>
                                <th>Rate</th>
                                <th>Qty</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.map((p, index) => (
                                <tr key={index}>
                                    <td>{index + 1}</td>
                                    <td>{p.product}</td>
                                    <td>{p.rate}</td>
                                    <td>{p.qty}</td>
                                    <td>{p.total}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Total Section */}
                    <div className="summary">
                        <div>
                            <label>Extra Discount:</label>
                            <input
                                className="pos-input"
                                type="number"
                                value={extraDiscount}
                                onChange={(e) => setExtraDiscount(parseFloat(e.target.value) || 0)}
                            />
                        </div>
                        <h2>Total: ₹ {finalTotal.toFixed(2)}</h2>
                    </div>

                    {/* Action Buttons */}
                    <div className="actions">
                        <button className="btn save">Save</button>
                        <button className="btn reset" onClick={handleReset}>Reset</button>
                        {/* <button className="btn print">Print</button> */}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SalesOrder;
