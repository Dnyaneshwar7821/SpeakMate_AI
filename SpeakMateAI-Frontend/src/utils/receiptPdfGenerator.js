import { jsPDF } from "jspdf";

/**
 * Generates and triggers download of an enterprise-grade PDF receipt / tax invoice.
 * @param {Object} data - Transaction and school details
 */
export function generateReceiptPdf(data = {}) {
    const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // 1. Top Brand Banner
    doc.setFillColor(67, 56, 202); // Deep Indigo (#4338CA)
    doc.rect(0, 0, pageWidth, 26, "F");

    // Brand Name
    doc.setFont("helvetica", "bold");
    doc.setFontSize(17);
    doc.setTextColor(255, 255, 255);
    doc.text("SpeakMate AI", 14, 16);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(224, 231, 255);
    doc.text("Institutional Speaking Intelligence & Language Platform", 58, 15.5);

    // Right-aligned Invoice Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text("TAX INVOICE / RECEIPT", pageWidth - 14, 16, { align: "right" });

    // 2. Receipt Metadata Section
    let y = 35;
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const issueDate = data.paymentDate || new Date().toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" });

    // Status Badge on Right
    doc.setFillColor(236, 253, 245); // emerald-50
    doc.setDrawColor(16, 185, 129); // emerald-500
    doc.setLineWidth(0.5);
    doc.roundedRect(pageWidth - 62, y - 4, 48, 8.5, 2, 2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(5, 150, 105); // emerald-600
    doc.text(data.isFree ? "FREE TIER ACTIVE" : "PAID & VERIFIED", pageWidth - 38, y + 2, { align: "center" });

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42); // slate-900
    doc.text(`Receipt #${invoiceNumber}`, 14, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139); // slate-500
    doc.text(`Issued Date: ${issueDate}`, 14, y + 5.5);

    y += 16;

    // Horizontal Divider
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.5);
    doc.line(14, y, pageWidth - 14, y);

    y += 8;

    // 3. Two Column Info: Billed To vs Organization Info
    // Left Column: Customer / School Details
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(67, 56, 202);
    doc.text("BILLED TO (INSTITUTION):", 14, y);

    y += 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(15, 23, 42);
    doc.text(data.schoolName || "Institutional Partner", 14, y);

    y += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text(`Admin: ${data.adminName || "School Administrator"}`, 14, y);
    y += 4.5;
    doc.text(`Email: ${data.adminEmail || "—"}`, 14, y);
    y += 4.5;
    doc.text(`Phone: ${data.adminPhone || "—"}`, 14, y);
    y += 4.5;
    if (data.schoolAddress) {
        const addressLines = doc.splitTextToSize(`Address: ${data.schoolAddress}`, 80);
        doc.text(addressLines, 14, y);
        y += (addressLines.length * 4);
    }

    // Right Column: Issuer Details
    let rightY = y - (data.schoolAddress ? (doc.splitTextToSize(`Address: ${data.schoolAddress}`, 80).length * 4) : 0) - 19;
    const rightColX = 115;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.setTextColor(67, 56, 202);
    doc.text("ISSUED BY:", rightColX, rightY);

    rightY += 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(15, 23, 42);
    doc.text("SpeakMate AI Technologies Pvt. Ltd.", rightColX, rightY);

    rightY += 5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(51, 65, 85);
    doc.text("GSTIN: 27AABCS1429B1Z8", rightColX, rightY);
    rightY += 4.5;
    doc.text("Platform: Super Admin Enterprise Portal", rightColX, rightY);
    rightY += 4.5;
    doc.text("Support: info@rslsolution.com", rightColX, rightY);
    rightY += 4.5;
    doc.text("Payment Node: Razorpay Verified Gateway", rightColX, rightY);

    y = Math.max(y, rightY) + 8;

    // 4. Subscription Table Header
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(14, y, pageWidth - 28, 8.5, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text("DESCRIPTION / SERVICE", 18, y + 5.5);
    doc.text("VALIDITY", 105, y + 5.5);
    doc.text("CAPACITY", 138, y + 5.5);
    doc.text("AMOUNT (INR)", pageWidth - 18, y + 5.5, { align: "right" });

    y += 13;

    // Table Content Row
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(`${data.planName || "Institutional Subscription Plan"}`, 18, y);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(71, 85, 105);
    doc.text(data.durationMonths ? `${data.durationMonths} Months` : "Annual (12 Months)", 105, y);
    doc.text(data.studentLimit ? `${data.studentLimit} Students` : "500 Students", 138, y);

    const priceNum = Number(data.planPrice || 0);
    const formattedPrice = priceNum === 0 ? "FREE" : `INR ${priceNum.toLocaleString("en-IN")}.00`;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(15, 23, 42);
    doc.text(formattedPrice, pageWidth - 18, y, { align: "right" });

    y += 5;
    doc.setFont("helvetica", "italic");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Includes speaking assessments, AI speech analysis, institutional curriculum & teacher portal.", 18, y);

    y += 9;
    doc.setDrawColor(226, 232, 240);
    doc.line(14, y, pageWidth - 14, y);

    y += 6;

    // 5. Totals & Calculations
    const totalsX = pageWidth - 72;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text("Subtotal:", totalsX, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text(formattedPrice, pageWidth - 18, y, { align: "right" });

    y += 5.5;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text("Taxes & Platform Fees:", totalsX, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("INR 0.00", pageWidth - 18, y, { align: "right" });

    y += 8;
    // Total Row Box
    doc.setFillColor(238, 242, 255); // indigo-50
    doc.roundedRect(totalsX - 8, y - 4, 66, 10, 2, 2, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(67, 56, 202); // indigo-700
    doc.text("Total Paid:", totalsX - 4, y + 2.8);
    doc.text(formattedPrice, pageWidth - 18, y + 2.8, { align: "right" });

    y += 18;

    // 6. Payment & Verification Details Container
    doc.setFillColor(248, 250, 252);
    doc.setDrawColor(226, 232, 240);
    doc.roundedRect(14, y, pageWidth - 28, 26, 3, 3, "FD");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text("TRANSACTION & AUDIT REFERENCE", 20, y + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text(`Payment ID: ${data.paymentId || "FREE_INSTITUTIONAL_TIER"}`, 20, y + 11.5);
    doc.text(`Order Reference: ${data.orderId || "INSTITUTIONAL_PROVISION"}`, 20, y + 16);
    doc.text(`Payment Gateway: Razorpay Verified (Supports UPI, Cards, NetBanking)`, 20, y + 20.5);

    // Seal on right
    doc.setDrawColor(16, 185, 129);
    doc.setFillColor(236, 253, 245);
    doc.roundedRect(pageWidth - 72, y + 5, 52, 15, 2, 2, "FD");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.setTextColor(5, 150, 105);
    doc.text("AUTHENTICATED RECORD", pageWidth - 46, y + 11, { align: "center" });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(6.5);
    doc.text("SpeakMate AI Finance Node", pageWidth - 46, y + 15.5, { align: "center" });

    // 7. Footer
    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text("This is an electronically generated invoice and does not require a physical signature.", pageWidth / 2, pageHeight - 14, { align: "center" });
    doc.text("SpeakMate AI Technologies Pvt. Ltd. • 24x7 Institutional Support: info@rslsolution.com", pageWidth / 2, pageHeight - 9.5, { align: "center" });

    // Save PDF
    const cleanSchoolName = (data.schoolName || "School").replace(/[^a-zA-Z0-9]/g, "_");
    const fileName = `SpeakMateAI_Receipt_${cleanSchoolName}_${Date.now()}.pdf`;
    doc.save(fileName);
}

export default generateReceiptPdf;
