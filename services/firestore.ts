import {
    Timestamp,
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    limit,
    onSnapshot,
    orderBy,
    query,
    updateDoc,
    where,
    writeBatch
} from "firebase/firestore";
import { db } from "../config/firebase";
import { Customer, LedgerEntry, Shop, Transaction, User } from "../types";

/**
 * Firestore Service Layer
 * Handles all database operations
 */

// ============= Users =============

export const userService = {
  async createUser(userId: string, data: Omit<User, "id">) {
    try {
      await setDoc(doc(db, "users", userId), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  },

  async getUser(userId: string): Promise<User | null> {
    try {
      const docSnap = await getDoc(doc(db, "users", userId));
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate() || new Date(),
          updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
        } as User;
      }
      return null;
    } catch (error) {
      console.error("Error getting user:", error);
      throw error;
    }
  },

  async getUsersByShop(shopId: string): Promise<User[]> {
    try {
      const q = query(collection(db, "users"), where("shopId", "==", shopId));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as User[];
    } catch (error) {
      console.error("Error getting users by shop:", error);
      throw error;
    }
  },

  async updateUser(userId: string, data: Partial<User>) {
    try {
      await updateDoc(doc(db, "users", userId), {
        ...data,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  },
};

// ============= Shops =============

export const shopService = {
  async createShop(data: Omit<Shop, "id">) {
    try {
      const docRef = await addDoc(collection(db, "shops"), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creating shop:", error);
      throw error;
    }
  },

  async getShop(shopId: string): Promise<Shop | null> {
    try {
      const docSnap = await getDoc(doc(db, "shops", shopId));
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate() || new Date(),
          updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
        } as Shop;
      }
      return null;
    } catch (error) {
      console.error("Error getting shop:", error);
      throw error;
    }
  },

  async updateShop(shopId: string, data: Partial<Shop>) {
    try {
      await updateDoc(doc(db, "shops", shopId), {
        ...data,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error updating shop:", error);
      throw error;
    }
  },
};

// ============= Customers =============

export const customerService = {
  async createCustomer(data: Omit<Customer, "id">) {
    try {
      const docRef = await addDoc(collection(db, "customers"), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creating customer:", error);
      throw error;
    }
  },

  async getCustomer(customerId: string): Promise<Customer | null> {
    try {
      const docSnap = await getDoc(doc(db, "customers", customerId));
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: docSnap.data().createdAt?.toDate() || new Date(),
          updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
          lastTransactionDate: docSnap.data().lastTransactionDate?.toDate(),
        } as Customer;
      }
      return null;
    } catch (error) {
      console.error("Error getting customer:", error);
      throw error;
    }
  },

  async getCustomersByShop(shopId: string): Promise<Customer[]> {
    try {
      const q = query(
        collection(db, "customers"),
        where("shopId", "==", shopId),
        where("status", "==", "active"),
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        lastTransactionDate: doc.data().lastTransactionDate?.toDate(),
      })) as Customer[];
    } catch (error) {
      console.error("Error getting customers by shop:", error);
      throw error;
    }
  },

  async searchCustomers(shopId: string, phone: string): Promise<Customer[]> {
    try {
      const q = query(
        collection(db, "customers"),
        where("shopId", "==", shopId),
        where("phone", "==", phone),
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        lastTransactionDate: doc.data().lastTransactionDate?.toDate(),
      })) as Customer[];
    } catch (error) {
      console.error("Error searching customers:", error);
      throw error;
    }
  },

  async updateCustomer(customerId: string, data: Partial<Customer>) {
    try {
      await updateDoc(doc(db, "customers", customerId), {
        ...data,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error updating customer:", error);
      throw error;
    }
  },

  async deleteCustomer(customerId: string) {
    try {
      await deleteDoc(doc(db, "customers", customerId));
    } catch (error) {
      console.error("Error deleting customer:", error);
      throw error;
    }
  },
};

// ============= Transactions =============

export const transactionService = {
  async createTransaction(
    data: Omit<Transaction, "id" | "createdAt" | "updatedAt">,
  ) {
    try {
      const batch = writeBatch(db);

      // Add transaction
      const transactionRef = doc(collection(db, "transactions"));
      batch.set(transactionRef, {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Update customer balance
      const customerRef = doc(db, "customers", data.customerId);
      const customerSnap = await getDoc(customerRef);

      if (customerSnap.exists()) {
        const customer = customerSnap.data() as Customer;
        const newBalance =
          data.type === "credit"
            ? customer.balance + data.amount
            : customer.balance - data.amount;

        batch.update(customerRef, {
          balance: newBalance,
          lastTransactionDate: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
      }

      await batch.commit();
      return transactionRef.id;
    } catch (error) {
      console.error("Error creating transaction:", error);
      throw error;
    }
  },

  async getTransactionsByCustomer(customerId: string): Promise<Transaction[]> {
    try {
      const q = query(
        collection(db, "transactions"),
        where("customerId", "==", customerId),
        orderBy("createdAt", "desc"),
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Transaction[];
    } catch (error) {
      console.error("Error getting transactions by customer:", error);
      throw error;
    }
  },

  async getTransactionsByShop(
    shopId: string,
    limitCount: number = 50,
  ): Promise<Transaction[]> {
    try {
      const q = query(
        collection(db, "transactions"),
        where("shopId", "==", shopId),
        orderBy("createdAt", "desc"),
        limit(limitCount),
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Transaction[];
    } catch (error) {
      console.error("Error getting transactions by shop:", error);
      throw error;
    }
  },

  async getCustomerLedger(customerId: string): Promise<LedgerEntry[]> {
    try {
      const transactions = await this.getTransactionsByCustomer(customerId);
      const customer = await customerService.getCustomer(customerId);

      if (!customer) return [];

      // Calculate running balance
      let runningBalance = 0;
      const ledger: LedgerEntry[] = [];

      // Transactions are in desc order, reverse for chronological
      for (let i = transactions.length - 1; i >= 0; i--) {
        const txn = transactions[i];
        if (txn.type === "credit") {
          runningBalance += txn.amount;
        } else {
          runningBalance -= txn.amount;
        }

        ledger.push({
          ...txn,
          runningBalance,
          customerName: customer.name,
        });
      }

      return ledger;
    } catch (error) {
      console.error("Error getting customer ledger:", error);
      throw error;
    }
  },

  async updateTransaction(transactionId: string, data: Partial<Transaction>) {
    try {
      await updateDoc(doc(db, "transactions", transactionId), {
        ...data,
        updatedAt: Timestamp.now(),
      });
    } catch (error) {
      console.error("Error updating transaction:", error);
      throw error;
    }
  },

  async deleteTransaction(transactionId: string) {
    try {
      await deleteDoc(doc(db, "transactions", transactionId));
    } catch (error) {
      console.error("Error deleting transaction:", error);
      throw error;
    }
  },
};

// ============= Real-time Listeners =============

export const realtimeService = {
  onCustomersChange(shopId: string, callback: (customers: Customer[]) => void) {
    const q = query(
      collection(db, "customers"),
      where("shopId", "==", shopId),
      where("status", "==", "active"),
    );

    return onSnapshot(q, (snapshot) => {
      const customers = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
        lastTransactionDate: doc.data().lastTransactionDate?.toDate(),
      })) as Customer[];

      callback(customers);
    });
  },

  onRecentTransactions(
    shopId: string,
    callback: (transactions: Transaction[]) => void,
  ) {
    const q = query(
      collection(db, "transactions"),
      where("shopId", "==", shopId),
      orderBy("createdAt", "desc"),
      limit(20),
    );

    return onSnapshot(q, (snapshot) => {
      const transactions = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        updatedAt: doc.data().updatedAt?.toDate() || new Date(),
      })) as Transaction[];

      callback(transactions);
    });
  },
};

import { setDoc } from "firebase/firestore";

