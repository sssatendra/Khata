/**
 * SMS Notification Service
 * Sends payment reminders and transaction alerts via Twilio
 */

const BACKEND_URL =
  process.env.EXPO_PUBLIC_BACKEND_URL || "https://your-backend.com/api";

interface SendSMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export const smsService = {
  /**
   * Send payment reminder SMS
   */
  async sendPaymentReminder(
    customerPhone: string,
    customerName: string,
    amount: number,
    daysSince: number,
    shopName: string,
  ): Promise<SendSMSResponse> {
    try {
      // Validate phone number
      const formattedPhone = customerPhone.startsWith("+")
        ? customerPhone
        : `+91${customerPhone}`;

      // Build message
      const message = `Hi ${customerName}, your outstanding balance with ${shopName} is ₹${amount}. 
It has been ${daysSince} days since last payment. 
Please settle at your earliest convenience.`;

      // Send via backend
      const response = await fetch(`${BACKEND_URL}/sms/send-reminder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: formattedPhone,
          message,
          type: "payment_reminder",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send SMS");
      }

      console.log(`📱 Sent payment reminder to ${formattedPhone}`);

      return {
        success: true,
        messageId: data.messageId,
      };
    } catch (error) {
      console.error("Error sending payment reminder:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send SMS",
      };
    }
  },

  /**
   * Send transaction receipt SMS
   */
  async sendTransactionReceipt(
    customerPhone: string,
    customerName: string,
    amount: number,
    type: "credit" | "debit",
    shopName: string,
    transactionId: string,
  ): Promise<SendSMSResponse> {
    try {
      const formattedPhone = customerPhone.startsWith("+")
        ? customerPhone
        : `+91${customerPhone}`;

      const typeText = type === "credit" ? "Credit" : "Payment";
      const symbol = type === "credit" ? "+" : "-";

      const message = `Hi ${customerName}, ${typeText} of ₹${amount} recorded with ${shopName}. 
Ref: ${transactionId}
Thank you!`;

      const response = await fetch(`${BACKEND_URL}/sms/send-receipt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: formattedPhone,
          message,
          type: "transaction_receipt",
          transactionId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send receipt");
      }

      return {
        success: true,
        messageId: data.messageId,
      };
    } catch (error) {
      console.error("Error sending transaction receipt:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send SMS",
      };
    }
  },

  /**
   * Send bulk payment reminders to high-risk customers
   */
  async sendBulkReminders(
    customers: Array<{
      phone: string;
      name: string;
      balance: number;
      daysSince: number;
    }>,
    shopName: string,
  ): Promise<{
    success: boolean;
    sent: number;
    failed: number;
    errors?: string[];
  }> {
    try {
      const response = await fetch(`${BACKEND_URL}/sms/send-bulk-reminders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customers,
          shopName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send bulk reminders");
      }

      console.log(`📱 Sent ${data.sent} payment reminders`);

      return {
        success: true,
        sent: data.sent,
        failed: data.failed,
      };
    } catch (error) {
      console.error("Error sending bulk reminders:", error);
      return {
        success: false,
        sent: 0,
        failed: customers.length,
        errors: [error instanceof Error ? error.message : "Unknown error"],
      };
    }
  },

  /**
   * Send custom SMS
   */
  async sendCustomSMS(
    phoneNumber: string,
    message: string,
  ): Promise<SendSMSResponse> {
    try {
      const formattedPhone = phoneNumber.startsWith("+")
        ? phoneNumber
        : `+91${phoneNumber}`;

      const response = await fetch(`${BACKEND_URL}/sms/send-custom`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: formattedPhone,
          message,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to send SMS");
      }

      return {
        success: true,
        messageId: data.messageId,
      };
    } catch (error) {
      console.error("Error sending custom SMS:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to send SMS",
      };
    }
  },

  /**
   * Schedule payment reminder for later
   */
  async scheduleReminder(
    customerPhone: string,
    customerName: string,
    amount: number,
    shopName: string,
    scheduleDate: Date,
  ): Promise<SendSMSResponse> {
    try {
      const formattedPhone = customerPhone.startsWith("+")
        ? customerPhone
        : `+91${customerPhone}`;

      const response = await fetch(`${BACKEND_URL}/sms/schedule-reminder`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phoneNumber: formattedPhone,
          customerName,
          amount,
          shopName,
          scheduleDate: scheduleDate.toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to schedule reminder");
      }

      return {
        success: true,
        messageId: data.messageId,
      };
    } catch (error) {
      console.error("Error scheduling reminder:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to schedule",
      };
    }
  },

  /**
   * Get SMS delivery status
   */
  async getDeliveryStatus(messageId: string): Promise<{
    success: boolean;
    status?: string;
    error?: string;
  }> {
    try {
      const response = await fetch(`${BACKEND_URL}/sms/status/${messageId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to get status");
      }

      return {
        success: true,
        status: data.status, // delivered, failed, queued, etc.
      };
    } catch (error) {
      console.error("Error getting delivery status:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to get status",
      };
    }
  },

  /**
   * Check SMS balance/credits
   */
  async checkBalance(): Promise<{
    success: boolean;
    balance?: number;
    currency?: string;
    error?: string;
  }> {
    try {
      const response = await fetch(`${BACKEND_URL}/sms/balance`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to check balance");
      }

      return {
        success: true,
        balance: data.balance,
        currency: data.currency,
      };
    } catch (error) {
      console.error("Error checking balance:", error);
      return {
        success: false,
        error:
          error instanceof Error ? error.message : "Failed to check balance",
      };
    }
  },
};
