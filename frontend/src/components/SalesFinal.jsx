import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css'; // Reuse dashboard layout styles
import './POS.css'; // Styles for POS section
import './BootExtended.css'; // Import custom utility classes
import AutoSuggest from './AutoSuggest';
import API_BASE_URL from '../BASEURL';
import { generateInvoiceImage } from '../utils/generateImage';
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

    const shareOnWhatsApp = async (order) => {
        let phone = order.customerPhone || '';
        phone = phone.replace(/\D/g, '');
        if (phone.length === 10) phone = '91' + phone;

        // Generate Image
        const dataUrl = await generateInvoiceImage('invoice-template');

        if (dataUrl) {
            // Download the image
            const link = document.createElement('a');
            link.download = `Invoice_${order.orderID}.png`;
            link.href = dataUrl;
            link.click();

            // Open WhatsApp with text (files must be attached manually)
            const message = `Hello ${order.customerName},\n\nYour Order *${order.orderID}* has been generated.\nTotal Amount: *₹ ${Number(order.totalAmount).toFixed(2)}*.\n\nPlease find the invoice image attached (downloaded to your device).`;
            const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;

            // Short delay to allow download to start
            setTimeout(() => {
                window.open(whatsappUrl, '_blank');
            }, 1000);
        } else {
            alert("Failed to generate invoice image.");
        }
    };

    const handlePrint = () => {
        if (cart.length === 0) {
            alert("Cart is empty.");
            return;
        }
        // Create a temporary order object for the PDF
        const draftOrder = {
            orderID: `DRAFT`, // Placeholder or generate a temp one
            customerName: customerName || "Guest",
            customerPhone: customerPhone,
            items: cart.map(item => ({
                ItemName: item.product,
                Rate: item.rate,
                Qty: item.qty,
                Total: item.total
            })),
            totalAmount: finalTotal,
            date: new Date().toISOString()
        };
        generatePDF(draftOrder);
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
                // generatePDF(salesOrder); // Generate PDF automatically

                // Share Image via WhatsApp logic
                // We need to wait for state/dom to be ready or generate immediately.
                // The hidden template uses current state (cart, customerName), which are cleared by handleReset.
                // So we must generate BEFORE resetting.

                const confirmShare = window.confirm("Do you want to send invoice image via WhatsApp?");
                if (confirmShare) {
                    await shareOnWhatsApp(salesOrder);
                }

                handleReset(); // Now clear
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
                        <button className="btn print" onClick={handlePrint}>Print PDF</button>
                    </div>
                </div>

                {/* Hidden Invoice Template for Image Capture - Needs to be visible for html-to-image but off-screen */}
                <div id="invoice-template" style={{
                    position: 'absolute',
                    top: '-9999px',
                    left: '-9999px',
                    width: '800px', // Standard A4 width approx
                    background: 'white',
                    padding: '40px',
                    zIndex: -1,
                    fontFamily: 'Arial, sans-serif'
                }}>
                    <div style={{ borderBottom: '2px solid #333', paddingBottom: '20px', marginBottom: '20px' }}>
                        <h1 style={{ color: '#1e1b4b', fontSize: '32px', marginBottom: '5px' }}>ESTIMATE</h1>
                        <h3 style={{ margin: 0 }}>Nawaj Hashmi / KGN ENTERPRISE</h3>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px' }}>
                        <div>
                            <strong>Bill To:</strong><br />
                            <span style={{ fontSize: '18px' }}>{selectedCustomer?.name || customerName}</span><br />
                            {customerPhone}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <strong>Estimate #:</strong> {`mng_${Date.now()}`}<br />
                            <strong>Date:</strong> {new Date().toLocaleDateString()}
                        </div>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                        <thead style={{ background: '#1e1b4b', color: 'white' }}>
                            <tr>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Item</th>
                                <th style={{ padding: '10px', textAlign: 'center' }}>Rate</th>
                                <th style={{ padding: '10px', textAlign: 'center' }}>Qty</th>
                                <th style={{ padding: '10px', textAlign: 'right' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cart.map((item, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                                    <td style={{ padding: '10px' }}>{item.product}</td>
                                    <td style={{ padding: '10px', textAlign: 'center' }}>{item.rate}</td>
                                    <td style={{ padding: '10px', textAlign: 'center' }}>{item.qty}</td>
                                    <td style={{ padding: '10px', textAlign: 'right' }}>{item.total.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{ textAlign: 'right', marginTop: '20px' }}>
                        <p style={{ margin: '5px 0' }}>Extra Discount: {Number(extraDiscount).toFixed(2)}</p>
                        <h2 style={{ margin: '10px 0', color: '#1e1b4b' }}>Total: ₹ {finalTotal.toFixed(2)}</h2>
                    </div>

                    <div style={{ marginTop: '50px', fontSize: '12px', color: '#666', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                        <p>Terms & Conditions: Payment is due within 15 days.</p>
                    </div>
                </div>

                {/* Hidden Invoice Template for Image Capture - Needs to be visible for html-to-image but off-screen */}
                <div id="invoice-template" style={{
                    position: 'absolute',
                    top: '-9999px',
                    left: '-9999px',
                    width: '800px', // Standard A4 width approx
                    background: '#ffffff', // Explicit white background
                    color: '#000000', // Explicit black text
                    padding: '40px',
                    zIndex: -1,
                    fontFamily: 'Arial, sans-serif'
                }}>
                    <div style={{ borderBottom: '2px solid #333', paddingBottom: '20px', marginBottom: '20px' }}>
                        <h1 style={{ color: '#1e1b4b', fontSize: '32px', marginBottom: '5px' }}>ESTIMATE</h1>
                        <h3 style={{ margin: 0, color: '#000000' }}>Nawaj Hashmi / KGN ENTERPRISE</h3>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', color: '#000000' }}>
                        <div>
                            <strong>Bill To:</strong><br />
                            <span style={{ fontSize: '18px' }}>{selectedCustomer?.name || customerName}</span><br />
                            {customerPhone}
                        </div>
                        <div style={{ textAlign: 'right' }}>
                            <strong>Estimate #:</strong> {`mng_${Date.now()}`}<br />
                            <strong>Date:</strong> {new Date().toLocaleDateString()}
                        </div>
                    </div>

                    <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '20px' }}>
                        <thead style={{ background: '#1e1b4b', color: 'white' }}>
                            <tr>
                                <th style={{ padding: '10px', textAlign: 'left' }}>Item</th>
                                <th style={{ padding: '10px', textAlign: 'center' }}>Rate</th>
                                <th style={{ padding: '10px', textAlign: 'center' }}>Qty</th>
                                <th style={{ padding: '10px', textAlign: 'right' }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody style={{ color: '#000000' }}>
                            {cart.map((item, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid #ddd' }}>
                                    <td style={{ padding: '10px' }}>{item.product}</td>
                                    <td style={{ padding: '10px', textAlign: 'center' }}>{item.rate}</td>
                                    <td style={{ padding: '10px', textAlign: 'center' }}>{item.qty}</td>
                                    <td style={{ padding: '10px', textAlign: 'right' }}>{item.total.toFixed(2)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    <div style={{ textAlign: 'right', marginTop: '20px', color: '#000000' }}>
                        <p style={{ margin: '5px 0' }}>Extra Discount: {Number(extraDiscount).toFixed(2)}</p>
                        <h2 style={{ margin: '10px 0', color: '#1e1b4b' }}>Total: ₹ {finalTotal.toFixed(2)}</h2>
                    </div>

                    <div style={{ marginTop: '50px', fontSize: '12px', color: '#666', borderTop: '1px solid #eee', paddingTop: '10px' }}>
                        <p>Terms & Conditions: Payment is due within 15 days.</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default SalesFinal;
