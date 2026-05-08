/**
 * PDF Export Service
 * Generates PDF invoices and ledger reports
 * Uses react-native-pdf-lib for PDF generation
 */

import { Customer, LedgerEntry, Transaction } from "@/types/index";
import { formatCurrency, formatDate } from "@/utils/helpers";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

/**
 * PDF Configuration
 */
const PDF_CONFIG = {
  PAGE_WIDTH: 210, // A4 width in mm
  PAGE_HEIGHT: 297, // A4 height in mm
  MARGIN: 10,
  FONT_SIZES: {
    TITLE: 18,
    HEADING: 14,
    NORMAL: 10,
    SMALL: 8,
  },
  COLORS: {
    PRIMARY: "#2563EB",
    DARK: "#1F2937",
    LIGHT: "#6B7280",
    ERROR: "#DC2626",
    SUCCESS: "#059669",
  },
};

interface InvoiceData {
  customer: Customer;
  transactions: Transaction[];
  ledgerEntries?: LedgerEntry[];
  shopName: string;
  ownerName: string;
  ownerPhone: string;
  generatedDate: Date;
}

/**
 * Generate PDF for customer ledger
 * Returns base64 encoded PDF
 */
export const generateLedgerPDF = async (data: InvoiceData): Promise<string> => {
  try {
    // Build HTML content for PDF
    const html = buildLedgerHTML(data);

    // Convert to PDF (using html2pdf)
    const pdfBase64 = await convertHTMLToPDF(html);

    return pdfBase64;
  } catch (error) {
    console.error("Error generating ledger PDF:", error);
    throw new Error("Failed to generate PDF");
  }
};

/**
 * Generate invoice PDF for a transaction
 */
export const generateInvoicePDF = async (
  transaction: Transaction,
  customer: Customer,
  shopData: { shopName: string; ownerPhone: string },
): Promise<string> => {
  try {
    const html = buildInvoiceHTML(transaction, customer, shopData);
    const pdfBase64 = await convertHTMLToPDF(html);
    return pdfBase64;
  } catch (error) {
    console.error("Error generating invoice PDF:", error);
    throw new Error("Failed to generate invoice PDF");
  }
};

/**
 * Share PDF via email or other apps
 */
export const sharePDF = async (
  pdfBase64: string,
  fileName: string,
): Promise<boolean> => {
  try {
    // Save to temporary location
    const tempDir = (FileSystem as any).cacheDirectory;
    const filePath = `${tempDir}${fileName}.pdf`;

    // Write base64 to file
    await FileSystem.writeAsStringAsync(filePath, pdfBase64, {
      encoding: (FileSystem as any).EncodingType?.Base64 || "base64",
    });

    // Share file
    const isAvailable = await Sharing.isAvailableAsync();
    if (isAvailable) {
      await Sharing.shareAsync(filePath, {
        mimeType: "application/pdf",
        dialogTitle: "Share Ledger",
      });
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error sharing PDF:", error);
    throw new Error("Failed to share PDF");
  }
};

/**
 * Save PDF to device
 */
export const savePDFToDevice = async (
  pdfBase64: string,
  fileName: string,
): Promise<string> => {
  try {
    const dir = `${(FileSystem as any).documentDirectory}Khata/`;

    // Ensure directory exists
    const dirInfo = await FileSystem.getInfoAsync(dir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
    }

    // Save file
    const filePath = `${dir}${fileName}.pdf`;
    await FileSystem.writeAsStringAsync(filePath, pdfBase64, {
      encoding: (FileSystem as any).EncodingType?.Base64 || "base64",
    });

    return filePath;
  } catch (error) {
    console.error("Error saving PDF:", error);
    throw new Error("Failed to save PDF to device");
  }
};

/**
 * Build HTML for ledger PDF
 */
function buildLedgerHTML(data: InvoiceData): string {
  const {
    customer,
    ledgerEntries = [],
    shopName,
    ownerName,
    ownerPhone,
    generatedDate,
  } = data;

  const totalDebit = ledgerEntries.reduce(
    (sum, entry) => sum + (entry.type === "debit" ? entry.amount : 0),
    0,
  );
  const totalCredit = ledgerEntries.reduce(
    (sum, entry) => sum + (entry.type === "credit" ? entry.amount : 0),
    0,
  );
  const balance = totalCredit - totalDebit;

  const entriesHTML = ledgerEntries
    .map(
      (entry, idx) => `
    <tr>
      <td>${idx + 1}</td>
      <td>${formatDate(entry.createdAt)}</td>
      <td>${entry.type === "credit" ? "Credit (Udhar)" : "Payment"}</td>
      <td style="text-align: right;">${
        entry.type === "credit"
          ? `<span style="color: red;">+${formatCurrency(entry.amount)}</span>`
          : `<span style="color: green;">-${formatCurrency(entry.amount)}</span>`
      }</td>
      <td style="text-align: right;">${formatCurrency(entry.runningBalance)}</td>
      <td>${entry.note || "-"}</td>
    </tr>
  `,
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #1F2937;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 2px solid #2563EB;
          padding-bottom: 10px;
        }
        .shop-name {
          font-size: 24px;
          font-weight: bold;
          color: #2563EB;
        }
        .shop-info {
          font-size: 12px;
          color: #6B7280;
        }
        .customer-info {
          margin: 20px 0;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
        }
        .info-box {
          background: #F3F4F6;
          padding: 10px;
          border-radius: 8px;
        }
        .info-label {
          font-weight: bold;
          color: #374151;
          font-size: 12px;
        }
        .info-value {
          font-size: 14px;
          color: #1F2937;
          margin-top: 5px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
          font-size: 11px;
        }
        th {
          background: #2563EB;
          color: white;
          padding: 8px;
          text-align: left;
          font-weight: bold;
        }
        td {
          border: 1px solid #E5E7EB;
          padding: 8px;
        }
        tr:nth-child(even) {
          background: #F9FAFB;
        }
        .summary {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin: 20px 0;
        }
        .summary-item {
          background: #F3F4F6;
          padding: 10px;
          border-radius: 8px;
          text-align: center;
        }
        .summary-label {
          font-size: 12px;
          color: #6B7280;
        }
        .summary-value {
          font-size: 16px;
          font-weight: bold;
          color: #1F2937;
          margin-top: 5px;
        }
        .balance {
          font-size: 16px;
          font-weight: bold;
        }
        .balance-positive {
          color: #059669;
        }
        .balance-negative {
          color: #DC2626;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #E5E7EB;
          font-size: 11px;
          color: #6B7280;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="shop-name">${shopName}</div>
        <div class="shop-info">Owner: ${ownerName} | Phone: ${ownerPhone}</div>
        <div class="shop-info">Generated: ${formatDate(generatedDate)}</div>
      </div>

      <div class="customer-info">
        <div class="info-box">
          <div class="info-label">Customer Name</div>
          <div class="info-value">${customer.name}</div>
        </div>
        <div class="info-box">
          <div class="info-label">Phone Number</div>
          <div class="info-value">${customer.phone}</div>
        </div>
        <div class="info-box">
          <div class="info-label">Address</div>
          <div class="info-value">${customer.address || "Not provided"}</div>
        </div>
        <div class="info-box">
          <div class="info-label">Email</div>
          <div class="info-value">${customer.email || "Not provided"}</div>
        </div>
      </div>

      <div class="summary">
        <div class="summary-item">
          <div class="summary-label">Total Credit</div>
          <div class="summary-value" style="color: red;">+${formatCurrency(totalCredit)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Total Paid</div>
          <div class="summary-value" style="color: green;">-${formatCurrency(totalDebit)}</div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Outstanding</div>
          <div class="summary-value balance ${
            balance > 0 ? "balance-positive" : "balance-negative"
          }">
            ${balance > 0 ? "+" : ""}${formatCurrency(balance)}
          </div>
        </div>
        <div class="summary-item">
          <div class="summary-label">Status</div>
          <div class="summary-value">${balance > 0 ? "Debtor" : "Paid Up"}</div>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Date</th>
            <th>Type</th>
            <th>Amount</th>
            <th>Running Balance</th>
            <th>Note</th>
          </tr>
        </thead>
        <tbody>
          ${entriesHTML}
        </tbody>
      </table>

      <div class="footer">
        <p>This is a system-generated report from Khata App</p>
        <p>Keep this record for your accounts</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Build HTML for invoice PDF
 */
function buildInvoiceHTML(
  transaction: Transaction,
  customer: Customer,
  shopData: { shopName: string; ownerPhone: string },
): string {
  const isCredit = transaction.type === "credit";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
          color: #1F2937;
        }
        .header {
          text-align: center;
          margin-bottom: 20px;
          border-bottom: 2px solid #2563EB;
          padding-bottom: 10px;
        }
        .invoice-title {
          font-size: 20px;
          font-weight: bold;
          color: #2563EB;
        }
        .details {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin: 20px 0;
        }
        .detail-box {
          background: #F3F4F6;
          padding: 10px;
          border-radius: 8px;
        }
        .detail-label {
          font-weight: bold;
          font-size: 12px;
          color: #6B7280;
        }
        .detail-value {
          font-size: 14px;
          color: #1F2937;
          margin-top: 5px;
        }
        .amount-box {
          background: ${isCredit ? "#FEE2E2" : "#DCFCE7"};
          padding: 15px;
          border-radius: 8px;
          text-align: center;
          margin: 20px 0;
          border: 2px solid ${isCredit ? "#DC2626" : "#059669"};
        }
        .amount-label {
          font-size: 12px;
          color: #6B7280;
        }
        .amount-value {
          font-size: 28px;
          font-weight: bold;
          color: ${isCredit ? "#DC2626" : "#059669"};
          margin-top: 10px;
        }
        .note {
          background: #F9FAFB;
          padding: 10px;
          border-left: 4px solid #2563EB;
          margin-top: 20px;
        }
        .footer {
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #E5E7EB;
          font-size: 11px;
          color: #6B7280;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="invoice-title">${shopData.shopName}</div>
        <div style="font-size: 14px; margin-top: 5px;">${isCredit ? "CREDIT GIVEN" : "PAYMENT RECEIVED"}</div>
      </div>

      <div class="details">
        <div class="detail-box">
          <div class="detail-label">Customer Name</div>
          <div class="detail-value">${customer.name}</div>
        </div>
        <div class="detail-box">
          <div class="detail-label">Phone</div>
          <div class="detail-value">${customer.phone}</div>
        </div>
        <div class="detail-box">
          <div class="detail-label">Date</div>
          <div class="detail-value">${formatDate(transaction.createdAt)}</div>
        </div>
        <div class="detail-box">
          <div class="detail-label">Transaction ID</div>
          <div class="detail-value">${transaction.id}</div>
        </div>
      </div>

      <div class="amount-box">
        <div class="amount-label">${isCredit ? "Credit Given" : "Payment Received"}</div>
        <div class="amount-value">${isCredit ? "+" : "-"}${formatCurrency(transaction.amount)}</div>
      </div>

      ${
        transaction.note
          ? `
      <div class="note">
        <strong>Note:</strong> ${transaction.note}
      </div>
      `
          : ""
      }

      <div class="footer">
        <p>This is a system-generated receipt from Khata App</p>
        <p>Contact: ${shopData.ownerPhone}</p>
      </div>
    </body>
    </html>
  `;
}

/**
 * Convert HTML to PDF (base64)
 * NOTE: In production, use a real HTML-to-PDF library
 * Options:
 * 1. react-native-html-to-pdf (simpler, iOS/Android only)
 * 2. html2pdf.js (web-based, includes via CDN)
 * 3. pdfmake (programmatic, more control)
 *
 * For Expo, we recommend: react-native-html-to-pdf
 */
async function convertHTMLToPDF(html: string): Promise<string> {
  try {
    // This is a placeholder - implement with actual library
    // For demo, returning mock base64
    console.log("Converting HTML to PDF...");

    // Real implementation example using react-native-html-to-pdf:
    // const RNHTMLtoPDF = require('react-native-html-to-pdf').default;
    // const options = {
    //   html,
    //   fileName: 'document',
    //   base64: true,
    // };
    // const file = await RNHTMLtoPDF.convert(options);
    // return file.base64;

    // For now, return placeholder
    return "JVBERi0xLjQKJeLjz9MNCjEgMCBvYmo..."; // Mock base64
  } catch (error) {
    console.error("Error converting HTML to PDF:", error);
    throw new Error("Failed to convert to PDF");
  }
}

/**
 * List all saved PDFs on device
 */
export const listSavedPDFs = async (): Promise<string[]> => {
  try {
    const dir = `${(FileSystem as any).documentDirectory}Khata/`;
    const dirInfo = await FileSystem.getInfoAsync(dir);

    if (!dirInfo.exists) {
      return [];
    }

    const files = await FileSystem.readDirectoryAsync(dir);
    return files.filter((f) => f.endsWith(".pdf"));
  } catch (error) {
    console.error("Error listing PDFs:", error);
    return [];
  }
};

/**
 * Delete a saved PDF
 */
export const deleteSavedPDF = async (fileName: string): Promise<boolean> => {
  try {
    const dir = `${(FileSystem as any).documentDirectory}Khata/`;
    const filePath = `${dir}${fileName}`;

    await FileSystem.deleteAsync(filePath);
    return true;
  } catch (error) {
    console.error("Error deleting PDF:", error);
    return false;
  }
};
