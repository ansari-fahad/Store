const PDFDocument = require('pdfkit');
const SalesOrder = require('../model/SalesOrder');
const dayjs = require('dayjs');

exports.generateInvoicePDF = async (req, res) => {
    try {
        const orderID = req.params.id;
        const order = await SalesOrder.findOne({ OrderID: orderID });

        if (!order) {
            return res.status(404).send('Order not found');
        }

        const doc = new PDFDocument({ margin: 50 });

        // Helper functions
        function generateHeader(doc) {
            doc.fillColor('#444444')
                .fontSize(20)
                .text('KGN ENTERPRISE', 50, 57)
                .fontSize(10)
                .text('Nawaj Hashmi', 50, 80)
                .text('Estimate', 200, 50, { align: 'right' })
                .moveDown();
        }

        function generateCustomerInformation(doc, invoice) {
            const startY = 100;
            doc.fillColor("#444444")
                .fontSize(20)
                .text("Estimate", 50, 160);

            doc.fontSize(10)
                .font("Helvetica-Bold")
                .text("Bill To:", 50, startY)
                .font("Helvetica")
                .text(invoice.customerName, 50, startY + 15)
                .text(invoice.Phone || '', 50, startY + 30)
                .font("Helvetica-Bold")
                .text(`Estimate No: ${invoice.invoiceNr}`, 400, startY)
                .text(`Date: ${invoice.date}`, 400, startY + 15)
                .text(`Balance Due: ${invoice.subtotal}`, 400, startY + 30)
                .moveDown();
        }

        function generateTableRow(doc, y, item, unitCost, quantity, lineTotal) {
            doc.fontSize(10)
                .text(item, 50, y)
                .text(unitCost, 280, y, { width: 90, align: "right" })
                .text(quantity, 370, y, { width: 90, align: "right" })
                .text(lineTotal, 0, y, { align: "right" });
        }

        function generateHr(doc, y) {
            doc.strokeColor("#aaaaaa").lineWidth(1).moveTo(50, y).lineTo(550, y).stroke();
        }

        function generateInvoiceTable(doc, invoice) {
            let i;
            const invoiceTableTop = 330;
            doc.font("Helvetica-Bold");
            generateTableRow(
                doc,
                invoiceTableTop,
                "Item",
                "Unit Cost",
                "Quantity",
                "Line Total"
            );
            generateHr(doc, invoiceTableTop + 20);
            doc.font("Helvetica");

            for (i = 0; i < invoice.items.length; i++) {
                const item = invoice.items[i];
                const position = invoiceTableTop + (i + 1) * 30;
                generateTableRow(
                    doc,
                    position,
                    item.ItemName,
                    item.Rate,
                    item.Qty,
                    item.Total
                );
                generateHr(doc, position + 20);
            }

            const subtotalPosition = invoiceTableTop + (i + 1) * 30 + 20;
            doc.font("Helvetica-Bold");
            generateTableRow(
                doc,
                subtotalPosition,
                "",
                "",
                "Total",
                invoice.subtotal
            );
        }

        function generateFooter(doc) {
            doc.fontSize(10)
                .text("Payment is due within 15 days. Thank you for your business.", 50, 700, { align: "center", width: 500 });
        }

        // Set headers for download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="Invoice_${order.OrderID}.pdf"`);

        // Connect doc to response
        doc.pipe(res);

        // Prepare data object
        const invoiceData = {
            invoiceNr: order.OrderID,
            subtotal: order.TotalAmount.toFixed(2),
            customerName: order.CustomerName || "Guest",
            Phone: order.CustomerPhone || "",
            date: dayjs(order.OrderDate).format('DD/MM/YYYY'),
            items: order.Items
        };

        // Generate PDF sections
        generateHeader(doc);
        generateCustomerInformation(doc, invoiceData);
        generateInvoiceTable(doc, invoiceData);
        generateFooter(doc);

        doc.end();

    } catch (error) {
        console.error("Error generating invoice PDF:", error);
        res.status(500).send('Error generating invoice');
    }
};
