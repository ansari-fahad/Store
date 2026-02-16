import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css'; // Reuse dashboard layout styles
import './POS.css'; // Styles for POS section
import AutoSuggest from './AutoSuggest';

const SalesFinal = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Customer State
    const [customers, setCustomers] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [outstanding, setOutstanding] = useState(null);

    // POS State
    const [product, setProduct] = useState('');
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [rate, setRate] = useState('');
    const [qty, setQty] = useState('');
    const [cart, setCart] = useState([]);
    const [extraDiscount, setExtraDiscount] = useState(0);

    const handleAdd = () => {
        if (!selectedProduct || !selectedProduct.ItemKey) {
            alert("Please select a valid product.");
            return;
        }
        if (!rate || parseFloat(rate) <= 0) {
            alert("Please enter a valid rate.");
            return;
        }
        if (!qty || parseFloat(qty) <= 0) {
            alert("Please enter a valid quantity.");
            return;
        }

        const total = parseFloat(rate) * parseFloat(qty);
        setCart([...cart, {
            product: selectedProduct.ItemName,
            productId: selectedProduct.ItemKey,
            rate: parseFloat(rate),
            qty: parseFloat(qty),
            total
        }]);
        setProduct('');
        setSelectedProduct(null);
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
            .filter(item => item.Name && item.Name.toLowerCase().includes(lowerQuery))
            .map(item => ({
                name: item.Name,
                ...item
            }));
    };

    const handleCustomerSelect = (suggestion) => {
        setCustomerName(suggestion.name);
        setCustomerPhone(suggestion.Phone1 || '');
        setSelectedCustomer(suggestion);
        setOutstanding(suggestion.PendingAmount || 0.00);
    };

    const handleProductSelect = (suggestion) => {
        setProduct(suggestion.name);
        setSelectedProduct(suggestion);
        setRate(suggestion.ItemRate);
        // Focus quantity input if needed
    };

    const handleSave = () => {
        if (!selectedCustomer) {
            alert("Please select a valid customer.");
            return;
        }
        if (cart.length === 0) {
            alert("Cart is empty. Please add items.");
            return;
        }

        // Prepare payload for API
        const salesOrder = {
            customer: selectedCustomer,
            items: cart,
            totalAmount: finalTotal,
            date: new Date().toISOString()
        };

        console.log("Saving Order:", salesOrder);
        alert("Order validated! (See console for payload)");
        // Add API call here
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Use local backend for development
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
                const response = await fetch("https://storebackendapp.vercel.app/api/customers");
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
                    <h2 className="title">Sales Final</h2>

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
                        <button className="btn save" onClick={handleSave}>Save</button>
                        <button className="btn reset" onClick={handleReset}>Reset</button>
                        {/* <button className="btn print">Print</button> */}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SalesFinal;
