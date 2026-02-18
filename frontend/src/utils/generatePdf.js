import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Function to generate the PDF
export const generatePDF = (order) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // --- Header ---
    // Company Name Line
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text("Nawaj Hashmi / KGN ENTERPRISE", 14, 25);

    // "Estimate" Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(36);
    doc.setTextColor(30, 27, 75); // Dark Navy Blue
    doc.text("Estimate", 14, 40);

    // Divider Line
    doc.setDrawColor(200, 200, 200); // Light grey line
    doc.setLineWidth(0.5);
    doc.line(14, 45, pageWidth - 14, 45);

    // --- Bill To & Details Section ---
    const startY = 55;

    // Left side: Bill To
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    doc.text("Bill To:", 14, startY);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.text(order.customerName || "Customer Name", 14, startY + 8);

    // Right side: Details
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    const rightColX = 120;
    const lineHeight = 6;

    doc.text(`Estimate Number: ${order.orderID || 'EST-001'}`, rightColX, startY);
    doc.text(`Estimate Date: ${order.date ? new Date(order.date).toLocaleDateString() : new Date().toLocaleDateString()}`, rightColX, startY + lineHeight);

    // expiry date logic if needed
    // doc.text(`Expiry Date:`, rightColX, startY + (lineHeight * 2)); 

    console.log("Generating PDF for order:", order);

    // --- Table ---
    const tableStartY = startY + 25;

    const tableColumn = ["Item Name", "Rate", "Amount"];
    const tableRows = [];

    if (order.items && order.items.length > 0) {
        order.items.forEach((item, index) => {
            console.log(`Processing item ${index}:`, item);
            const itemData = [
                item.ItemName || item.product || "Unknown Item", // Fallback to 'product' if ItemName missing
                item.Rate || item.rate || 0,
                item.Total || item.total || 0,
            ];
            tableRows.push(itemData);
        });
    } else {
        console.warn("No items in order to print.");
    }

    // Check if autoTable is available on doc
    if (doc.autoTable) {
        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: tableStartY,
            theme: 'grid',
            headStyles: {
                fillColor: [30, 27, 75],
                textColor: [255, 255, 255],
                fontStyle: 'bold',
                halign: 'left'
            },
            styles: {
                font: "helvetica",
                fontSize: 10,
                cellPadding: 3,
                valign: 'middle'
            },
            columnStyles: {
                0: { halign: 'left' },
                1: { halign: 'center' },
                2: { halign: 'center' }
            }
        });
    } else {
        // Fallback or try function call if imported
        try {
            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: tableStartY,
                theme: 'grid',
                headStyles: {
                    fillColor: [30, 27, 75],
                    textColor: [255, 255, 255],
                    fontStyle: 'bold',
                    halign: 'left'
                },
                styles: {
                    font: "helvetica",
                    fontSize: 10,
                    cellPadding: 3,
                    valign: 'middle'
                },
                columnStyles: {
                    0: { halign: 'left' },
                    1: { halign: 'center' },
                    2: { halign: 'center' }
                }
            });
        } catch (e) {
            console.error("autoTable error:", e);
        }
    }

    // --- Totals Section ---
    let finalY = (doc.lastAutoTable && doc.lastAutoTable.finalY) ? doc.lastAutoTable.finalY + 10 : tableStartY + 50;
    const summaryRightX = pageWidth - 14;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");

    // Right align helper
    const rightAlignText = (text, y) => {
        const textWidth = doc.getTextWidth(text);
        doc.text(text, summaryRightX - textWidth, y);
    };

    // Extra Discount if any
    if (order.extraDiscount && order.extraDiscount > 0) {
        rightAlignText(`Extra Discount: ${parseFloat(order.extraDiscount).toFixed(2)}`, finalY);
        finalY += 6;
    }

    // Total
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    rightAlignText(`Total:  ${parseFloat(order.totalAmount || 0).toFixed(2)}`, finalY);

    // --- Footer ---
    const footerY = 250;
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text("Terms & Conditions", 14, footerY);

    doc.setFont("helvetica", "normal");
    doc.text("Notes", 14, footerY + 8);

    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Generated by StoreApp", pageWidth - 14, 280, { align: 'right' });

    // Save
    doc.save(`Estimate_${order.orderID || 'New'}.pdf`);
};
