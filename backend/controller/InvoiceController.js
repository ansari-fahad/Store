const PDFDocument = require('pdfkit');
const SalesOrder = require('../model/SalesOrder');
const License = require('../model/License');
const dayjs = require('dayjs');
const QRCode = require('qrcode');

exports.generateInvoicePDF = async (req, res) => {
    try {
        const orderID = req.params.id;
        const order = await SalesOrder.findOne({ OrderID: orderID });

        if (!order) {





            return res.status(404).send('Order not found');
        }

        // if (!order) {
        //     return res.status(404).send('Order not found');
        // }

        // F    etch Company License Information
        const license = await License.findOne({ _id: "STARINDIA" });
        const companyName = (license?.CompanyName || "STAR INDIA").toUpperCase();
        const address = license?.Address || "Rakhial Rd, Ahmedabad +91 9558125180";

        // 393px width as per instructions
        const pageWidth = 393;
        // Dynamic Height Calculation logic (Step 266 request)
        const colSnoWidth = 30;
        const colQtyWidth = 35;
        const colRateWidth = 60;
        const colAmtWidth = 70;
        const colPartWidth = pageWidth - (colSnoWidth + colQtyWidth + colRateWidth + colAmtWidth);

        let itemsHeight = 0;
        const tempDoc = new PDFDocument({ size: [pageWidth, 10000] });
        tempDoc.fontSize(9).font('Helvetica');

        order.Items.forEach(item => {
            const productName = item.ItemName || "";
            const textHeight = tempDoc.heightOfString(productName, { width: colPartWidth - 4 });
            itemsHeight += Math.max(22, textHeight + 6);
        });

        // Fixed segments ≈ 370 + itemsHeight
        const estimatedHeight = 472 + itemsHeight; // Including extra space for logo

        const doc = new PDFDocument({
            size: [pageWidth, estimatedHeight],
            margins: { top: 0, bottom: 0, left: 0, right: 0 }
        });

        // Set headers for download
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename="Invoice_${order.OrderID}.pdf"`);
        doc.pipe(res);

        const left = 0;
        const pageRight = pageWidth;
        const tableWidth = pageWidth;
        const themePrimary = [130, 180, 180]; // teal

        let y = 10;

        // ================= HEADER: COMPANY NAME =================
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#000000').text(companyName, left, y, { align: 'center', width: tableWidth });
        y += 20;

        // ================= ADDRESS =================
        doc.fontSize(9).font('Helvetica-Bold').text(address, 0, y, { align: 'center', width: pageWidth });
        y += 20;

        // ================= LOGO BELOW ADDRESS =================
        // Placeholder for Logo. y += 90 as per C# design gap
        // if (license?.LogoBase64) {
        //     const img = Buffer.from(license.LogoBase64, 'base64');
        //     doc.image(img, (pageWidth - 150) / 2, y, { width: 150 });
        //     y += 90;
        // } else {
        y += 80;
        // }

        // ================= BILL INFO =================
        // Font9_Regu (Calibri 9 Regular) -> Helvetica 9
        doc.fontSize(9).font('Helvetica').text(`Bill No : ${order.OrderID}`, left + 10, y);
        doc.text(`Date : ${dayjs(order.OrderDate).format('DD-MM-YYYY')}`, left + 10, y, { align: 'right', width: tableWidth - 20 });
        y += 22; // lh in C#

        doc.text(`Customer : ${order.CustomerName || ""}`, left + 10, y);
        y += 22;

        doc.text(`Mobile : ${order.CustomerPhone || ""}`, left + 10, y);
        y += 27; // lh + 5 in C#

        // ================= COLUMN WIDTHS =================
        // Use colWidths calculated above

        const col1 = left;
        const col2 = col1 + colSnoWidth;
        const col3 = col2 + colPartWidth;
        const col4 = col3 + colQtyWidth;
        const col5 = col4 + colRateWidth;

        // ================= TABLE HEADER =================
        doc.rect(left, y, tableWidth, 25).fill(themePrimary);
        doc.fillColor('#000000').font('Helvetica-Bold').fontSize(9);
        doc.text("No", col1 + 3, y + 7);
        doc.text("Particular", col2 + 2, y + 7);
        doc.text("Qty", col3 + 3, y + 7);
        doc.text("Rate", col4 + 3, y + 7);
        doc.text("Amount", col5 + 3, y + 7);
        y += 25;

        // ================= ITEMS =================
        doc.font('Helvetica').fontSize(9);
        order.Items.forEach((item, index) => {


            const productName = item.ItemName || "";
            const textHeight = doc.heightOfString(productName, { width: colPartWidth - 4 });
            const rowHeight = Math.max(22, textHeight + 6);

            doc.text((index + 1).toString(), col1 + 3, y + 3);
            doc.text(productName, col2 + 2, y + 3, { width: colPartWidth - 4 });
            doc.text(parseFloat(item.Qty || 0).toFixed(2), col3, y + 3, { width: colQtyWidth - 5, align: 'right' });
            doc.text(parseFloat(item.Rate || 0).toFixed(2), col4, y + 3, { width: colRateWidth - 5, align: 'right' });
            doc.text(parseFloat(item.Total || 0).toFixed(2), col5, y + 3, { width: colAmtWidth - 5, align: 'right' });

            y += rowHeight;
        });

        // ================= GRAND TOTAL =================
        y += 10;
        const totalWidth = 180;
        const totalX = pageRight - totalWidth - 10; // Adjusted for right margin

        doc.rect(totalX, y, totalWidth, 30).fillAndStroke(themePrimary, '#000000');
        doc.fillColor('#000000').font('Helvetica-Bold');
        doc.text("GRAND TOTAL", totalX + 10, y + 10);
        doc.text(parseFloat(order.TotalAmount || 0).toFixed(2), totalX, y + 10, { width: totalWidth - 5, align: 'right' });

        y += 45;

        // ================= PAYMENTS =================
        const p1 = order.PaidAmount || 0;
        const p2 = order.PaidAmount2 || 0;
        const credit = order.CreditAmount || (order.TotalAmount - (p1 + p2));

        if (p1 > 0) {
            doc.text("Payment 1 :", col4, y);
            doc.text(parseFloat(p1).toFixed(2), left + 10, y, { align: 'right', width: tableWidth - 20 });
            y += 22;
        }

        doc.text("Payment 2 :", col4, y);
        doc.text(parseFloat(p2).toFixed(2), left + 10, y, { align: 'right', width: tableWidth - 20 });
        y += 22;

        doc.text("Credit Amount :", col4, y);
        doc.text(parseFloat(credit).toFixed(2), left + 10, y, { align: 'right', width: tableWidth - 20 });
        y += 22;

        y += 20;

        // ================= QR CODE =================
        // if (p1 > 0 || order.TotalAmount > 0) {
        //     const upiId = order.UpiID || "yourupi@bank";
        //     const qrText = `upi://pay?pa=${upiId}&pn=StarIndia&am=${parseFloat(order.TotalAmount).toFixed(2)}`;

        //     try {
        //         const qrDataUri = await QRCode.toDataURL(qrText);
        //         const qrSize = 120; // 120 in C#
        //         const qrX = (pageWidth - qrSize) / 2;
        //         doc.image(qrDataUri, qrX, y, { width: qrSize, height: qrSize });
        //         y += qrSize + 10;
        //     } catch (qrErr) {
        //         console.error("QR Generation Error:", qrErr);
        //     }
        // }

        // ================= FOOTER =================
        doc.fontSize(9).font('Helvetica-Bold').text("Thank You Visit Again!", 0, y, { align: 'center', width: pageWidth });
        y += 22;
        doc.fontSize(8).text("Powered by Creed Softech / 9510607733", 0, y, { align: 'center', width: pageWidth });
        y += 40;

        // Border around the whole content (Pen borderPen = new Pen(Color.Black, 2))
        doc.lineWidth(2).rect(5, 5, pageWidth - 10, y - 5).stroke(); // Adjusted y to fit the content

        doc.end();

    } catch (error) {
        console.error("Error generating invoice PDF:", error);
        res.status(500).send('Error generating invoice');
    }
};
