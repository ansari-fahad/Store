import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css'; // Reuse dashboard layout styles
import './POS.css'; // Styles for POS section
import './BootExtended.css'; // Import custom utility classes
import AutoSuggest from './AutoSuggest';
import API_BASE_URL from '../BASEURL';
import { generatePDF } from '../utils/generatePdf';

const SalesFinal = () => {
    const navigate = useNavigate();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Customer State
    const [customers, setCustomers] = useState([]);
    const [customerName, setCustomerName] = useState('');
    const [customerSearch, setCustomerSearch] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [outstanding, setOutstanding] = useState(0);

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
        setCustomerSearch(''); // Clear search after selection
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

    const shareOnWhatsApp = (order) => {
        let phone = order.customerPhone || '';
        // Basic cleanup
        phone = phone.replace(/\D/g, '');
        // Default to India (+91) if 10 digits
        if (phone.length === 10) {
            phone = '91' + phone;
        }

        const invoiceLink = `${API_BASE_URL}/invoice/${order.orderID}`;
        const message = `Hello ${order.customerName},\n\nYour Order *${order.orderID}* has been generated.\nTotal Amount: *₹ ${Number(order.totalAmount).toFixed(2)}*.\n\nYou can download your invoice here: ${invoiceLink}`;

        const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    const handleSave = async () => {
        if (customerName == "") {
            //!selectedCustomer) {
            alert("Please select a valid customer.");
            return;
        }
        if (cart.length === 0) {
            alert("Cart is empty. Please add items.");
            return;
        }

        const userData = JSON.parse(localStorage.getItem('user'));
        const userId = userData ? userData._id : 'guest';
        const orderID = `mng_${Date.now()}_${userId}`;

        // Prepare payload for API
        const salesOrder = {
            orderID,
            customerName: customerName,//selectedCustomer.name ||
            customerPhone: customerPhone,
            items: cart.map(item => ({
                ItemName: item.product,
                ItemKey: item.productId,
                Rate: item.rate,
                Qty: item.qty,
                Total: item.total
            })),
            totalAmount: finalTotal,
            userId: userId,
            date: new Date().toISOString()
        };

        try {
            const response = await fetch(`${API_BASE_URL}/salesorders`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(salesOrder)
            });

            const data = await response.json();

            if (response.ok) {
                alert(`Order Saved Successfully! ID: ${orderID}`);
                generatePDF(salesOrder); // Generate PDF automatically

                // Prompt to share on WhatsApp
                setTimeout(() => {
                    const confirmShare = window.confirm("Do you want to send this via WhatsApp?");
                    if (confirmShare) {
                        shareOnWhatsApp(salesOrder);
                    }
                }, 1000); // Small delay to allow PDF download to start/finish

                handleReset(); // Clear the form
            } else {
                alert(`Failed to save order: ${data.message}`);
            }
        } catch (error) {
            console.error("Error saving order:", error);
            alert("An error occurred while saving the order.");
        }
    };

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Use local backend for development
                const response = await fetch(`${API_BASE_URL}/products`);
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
                const response = await fetch(`${API_BASE_URL}/customers`);
                if (!response.ok) throw new Error('Failed to fetch customers');
                const data = await response.json();
                setCustomers(data);
                // Assume first fetch might want outstanding amount, but best to start with 0
                setOutstanding(0);
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
                                Outstanding: ₹ {Number(outstanding || 0).toFixed(2)}
                            </div>
                            <div className="bootextended-d-none">
                                <AutoSuggest
                                    fetchSuggestions={fetchCustomerSuggestions}
                                    onSelect={handleCustomerSelect}
                                    inputValue={customerSearch}
                                    setInputValue={setCustomerSearch}
                                    Setclass="pos-input w-100"
                                    placeholder="Search Customer"
                                />
                            </div>
                            <input
                                className="pos-input w-100 mt-2"
                                placeholder="Customer Name"
                                value={customerName}
                                onChange={(e) => setCustomerName(e.target.value)}
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
                            <label style={{ fontSize: '0.8rem', color: '#a5b4fc', marginBottom: '5px', display: 'block' }}>
                                Type product name from the list below:
                            </label>
                            <AutoSuggest
                                fetchSuggestions={fetchSuggestions}
                                onSelect={handleProductSelect}
                                inputValue={product}
                                setInputValue={setProduct}
                                Setclass="pos-input product-name-input w-100"
                                placeholder="Type for product"
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

                {/* Product List Section */}
                <div className="pos-container mt-4 highlight-border">
                    <h3 className="title">Available Products (Click to Select)</h3>
                    <div className="product-list-scroll">
                        <table className="grid">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Product Name</th>
                                    <th>Rate</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product) => (
                                    <tr key={product._id} onClick={() => handleProductSelect({ name: product.ItemName, ...product })} style={{ cursor: 'pointer' }}>
                                        <td>{product.ItemKey}</td>
                                        <td>{product.ItemName}</td>
                                        <td>{product.ItemRate}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SalesFinal;
