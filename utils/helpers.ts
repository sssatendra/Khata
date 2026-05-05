import { differenceInDays, formatDistance } from "date-fns";
import Fuse from "fuse.js";
import { Customer } from "../types";

/**
 * Format currency to Indian Rupees
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format phone number
 */
export const formatPhoneNumber = (phone: string): string => {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, "");
  // Format as +91XXXXX XXXXX or XXXXX XXXXX
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  if (cleaned.length === 12) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  }
  return phone;
};

/**
 * Validate phone number
 */
export const isValidPhoneNumber = (phone: string): boolean => {
  const cleaned = phone.replace(/\D/g, "");
  return cleaned.length === 10 || cleaned.length === 12;
};

/**
 * Search customers using fuzzy search
 */
export const searchCustomers = (
  customers: Customer[],
  query: string,
): Customer[] => {
  if (!query.trim()) return customers;

  const fuse = new Fuse(customers, {
    keys: ["name", "phone"],
    threshold: 0.3,
  });

  return fuse.search(query).map((result) => result.item);
};

/**
 * Generate WhatsApp message link
 */
export const generateWhatsAppLink = (
  phoneNumber: string,
  balance: number,
  daysSincePayment: number,
): string => {
  const message = `Hi, you have a pending balance of ₹${balance.toLocaleString("en-IN")} since ${daysSincePayment} days. Please clear it at your earliest convenience.`;
  const encoded = encodeURIComponent(message);
  const cleanPhone = phoneNumber.replace(/\D/g, "");
  const phone = cleanPhone.length === 10 ? `91${cleanPhone}` : cleanPhone;
  return `https://wa.me/${phone}?text=${encoded}`;
};

/**
 * Calculate days since date
 */
export const getDaysSince = (date?: Date): number => {
  if (!date) return 999;
  return differenceInDays(new Date(), date);
};

/**
 * Format date to readable format
 */
export const formatDate = (date: Date): string => {
  return formatDistance(date, new Date(), { addSuffix: true });
};

/**
 * Get color based on risk level
 */
export const getRiskColor = (riskLevel: "low" | "medium" | "high"): string => {
  switch (riskLevel) {
    case "high":
      return "#DC2626";
    case "medium":
      return "#F59E0B";
    case "low":
      return "#10B981";
    default:
      return "#6B7280";
  }
};

/**
 * Get risk label
 */
export const getRiskLabel = (riskLevel: "low" | "medium" | "high"): string => {
  switch (riskLevel) {
    case "high":
      return "🔴 High Risk";
    case "medium":
      return "🟠 Medium Risk";
    case "low":
      return "🟢 Low Risk";
    default:
      return "Unknown";
  }
};

/**
 * Sort customers by balance (descending)
 */
export const sortByBalance = (customers: Customer[]): Customer[] => {
  return [...customers].sort((a, b) => b.balance - a.balance);
};

/**
 * Get top debtors
 */
export const getTopDebtors = (
  customers: Customer[],
  limit: number = 5,
): Customer[] => {
  return sortByBalance(customers).slice(0, limit);
};

/**
 * Calculate total outstanding
 */
export const calculateTotalOutstanding = (customers: Customer[]): number => {
  return customers.reduce(
    (sum, customer) => sum + Math.max(0, customer.balance),
    0,
  );
};

/**
 * Parse currency string to number
 */
export const parseCurrency = (value: string): number => {
  return parseFloat(value.replace(/[^0-9.-]+/g, ""));
};
