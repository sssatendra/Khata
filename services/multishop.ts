/**
 * Multi-Shop Service
 * Manages shops and shop selection for users with multiple stores
 */

import React from "react";
import { db } from "@/config/firebase";
import { Shop, User } from "@/types/index";
import {
    addDoc,
    arrayRemove,
    arrayUnion,
    collection,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    Timestamp,
    updateDoc,
    where
} from "firebase/firestore";

export const shopService = {
  /**
   * Create a new shop for a user
   */
  async createShop(
    userId: string,
    shopName: string,
    ownerPhone: string,
  ): Promise<string> {
    try {
      // Create shop document
      const shopRef = collection(db, "shops");
      const newShop = await addDoc(shopRef, {
        name: shopName,
        ownerUid: userId,
        ownerPhone: ownerPhone,
        staff: [], // Array of staff user IDs
        customers: [], // Array of customer IDs
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Add shop ID to user's shops array
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        shops: arrayUnion(newShop.id),
        currentShopId: newShop.id, // Set as current shop
      });

      console.log(`✅ Created shop: ${shopName}`);
      return newShop.id;
    } catch (error) {
      console.error("Error creating shop:", error);
      throw error;
    }
  },

  /**
   * Get all shops for a user
   */
  async getUserShops(userId: string): Promise<Shop[]> {
    try {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      const shopIds = userDoc.data()?.shops || [];

      if (shopIds.length === 0) {
        return [];
      }

      // Fetch all shops
      const shops: Shop[] = [];
      for (const shopId of shopIds) {
        const shopRef = doc(db, "shops", shopId);
        const shopDoc = await getDoc(shopRef);
        if (shopDoc.exists()) {
          shops.push({
            id: shopDoc.id,
            ...shopDoc.data(),
          } as Shop);
        }
      }

      return shops;
    } catch (error) {
      console.error("Error getting user shops:", error);
      throw error;
    }
  },

  /**
   * Get shop details
   */
  async getShop(shopId: string): Promise<Shop | null> {
    try {
      const shopRef = doc(db, "shops", shopId);
      const shopDoc = await getDoc(shopRef);
      if (shopDoc.exists()) {
        return {
          id: shopDoc.id,
          ...shopDoc.data(),
        } as Shop;
      }
      return null;
    } catch (error) {
      console.error("Error getting shop:", error);
      throw error;
    }
  },

  /**
   * Update shop details
   */
  async updateShop(shopId: string, updates: Partial<Shop>): Promise<void> {
    try {
      const shopRef = doc(db, "shops", shopId);
      await updateDoc(shopRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      });
      console.log(`✅ Updated shop: ${shopId}`);
    } catch (error) {
      console.error("Error updating shop:", error);
      throw error;
    }
  },

  /**
   * Set current shop for user
   */
  async setCurrentShop(userId: string, shopId: string): Promise<void> {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        currentShopId: shopId,
      });
      console.log(`✅ Set current shop: ${shopId}`);
    } catch (error) {
      console.error("Error setting current shop:", error);
      throw error;
    }
  },

  /**
   * Get current shop for user
   */
  async getCurrentShop(userId: string): Promise<Shop | null> {
    try {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);
      const currentShopId = userDoc.data()?.currentShopId;

      if (!currentShopId) {
        return null;
      }

      return await this.getShop(currentShopId);
    } catch (error) {
      console.error("Error getting current shop:", error);
      throw error;
    }
  },

  /**
   * Add staff member to shop
   */
  async addStaff(shopId: string, staffUserId: string): Promise<void> {
    try {
      const shopRef = doc(db, "shops", shopId);
      await updateDoc(shopRef, {
        staff: arrayUnion(staffUserId),
        updatedAt: Timestamp.now(),
      });

      // Also add shop to staff member's shops array
      const userRef = doc(db, "users", staffUserId);
      await updateDoc(userRef, {
        shops: arrayUnion(shopId),
      });

      console.log(`✅ Added staff member to shop`);
    } catch (error) {
      console.error("Error adding staff:", error);
      throw error;
    }
  },

  /**
   * Remove staff member from shop
   */
  async removeStaff(shopId: string, staffUserId: string): Promise<void> {
    try {
      const shopRef = doc(db, "shops", shopId);
      await updateDoc(shopRef, {
        staff: arrayRemove(staffUserId),
        updatedAt: Timestamp.now(),
      });

      // Remove shop from staff member's shops array
      const userRef = doc(db, "users", staffUserId);
      await updateDoc(userRef, {
        shops: arrayRemove(shopId),
      });

      console.log(`✅ Removed staff member from shop`);
    } catch (error) {
      console.error("Error removing staff:", error);
      throw error;
    }
  },

  /**
   * Delete a shop (only owner can delete)
   */
  async deleteShop(shopId: string, userId: string): Promise<void> {
    try {
      // Verify ownership
      const shop = await this.getShop(shopId);
      if (shop?.ownerUid !== userId) {
        throw new Error("Only shop owner can delete shop");
      }

      // Delete shop document
      const shopRef = doc(db, "shops", shopId);
      await deleteDoc(shopRef);

      // Remove shop from user's shops array
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        shops: arrayRemove(shopId),
      });

      console.log(`✅ Deleted shop: ${shopId}`);
    } catch (error) {
      console.error("Error deleting shop:", error);
      throw error;
    }
  },

  /**
   * Get all staff members in a shop
   */
  async getShopStaff(shopId: string): Promise<User[]> {
    try {
      const shop = await this.getShop(shopId);
      if (!shop || !shop.staff || shop.staff.length === 0) {
        return [];
      }

      const staff: User[] = [];
      for (const staffId of shop.staff) {
        const userRef = doc(db, "users", staffId);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          staff.push({
            id: userDoc.id,
            ...userDoc.data(),
          } as User);
        }
      }

      return staff;
    } catch (error) {
      console.error("Error getting shop staff:", error);
      throw error;
    }
  },

  /**
   * Get shop statistics
   */
  async getShopStats(shopId: string) {
    try {
      // Count customers
      const customersRef = collection(db, "customers");
      const qCustomers = query(customersRef, where("shopId", "==", shopId));
      const customersSnapshot = await getDocs(qCustomers);
      const customerCount = customersSnapshot.size;

      // Count transactions this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);

      const transactionsRef = collection(db, "transactions");
      const qTransactions = query(
        transactionsRef, 
        where("shopId", "==", shopId),
        where("createdAt", ">=", Timestamp.fromDate(startOfMonth))
      );
      const transactionsSnapshot = await getDocs(qTransactions);
      const transactionCount = transactionsSnapshot.size;

      // Calculate total outstanding
      let totalOutstanding = 0;
      customersSnapshot.docs.forEach((doc) => {
        totalOutstanding += doc.data().balance || 0;
      });

      return {
        shopId,
        customerCount,
        transactionCount,
        totalOutstanding,
        updatedAt: new Date(),
      };
    } catch (error) {
      console.error("Error getting shop stats:", error);
      throw error;
    }
  },

  /**
   * Invite staff by phone number (creates pending invitation)
   */
  async inviteStaff(
    shopId: string,
    staffPhone: string,
    staffName: string,
  ): Promise<string> {
    try {
      // Create invitation document
      const invitationsRef = collection(db, "invitations");
      const invitationDoc = await addDoc(invitationsRef, {
        shopId,
        staffPhone,
        staffName,
        status: "pending", // pending, accepted, rejected
        createdAt: Timestamp.now(),
        expiresAt: Timestamp.fromDate(
          new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ), // 7 days
      });

      console.log(`✅ Created invitation for ${staffPhone}`);
      return invitationDoc.id;
    } catch (error) {
      console.error("Error inviting staff:", error);
      throw error;
    }
  },

  /**
   * Accept staff invitation
   */
  async acceptInvitation(invitationId: string, userId: string): Promise<void> {
    try {
      const invitationRef = doc(db, "invitations", invitationId);
      const invitationDoc = await getDoc(invitationRef);

      if (!invitationDoc.exists()) {
        throw new Error("Invitation not found");
      }

      const { shopId } = invitationDoc.data();

      // Add staff to shop
      await this.addStaff(shopId, userId);

      // Mark invitation as accepted
      await updateDoc(invitationRef, {
        status: "accepted",
        acceptedAt: Timestamp.now(),
        acceptedBy: userId,
      });

      console.log(`✅ Accepted invitation`);
    } catch (error) {
      console.error("Error accepting invitation:", error);
      throw error;
    }
  },
};

/**
 * Hook for multi-shop management
 */
export const useMultiShop = () => {
  const [shops, setShops] = React.useState<Shop[]>([]);
  const [currentShop, setCurrentShop] = React.useState<Shop | null>(null);
  const [loading, setLoading] = React.useState(false);

  const loadShops = React.useCallback(async (userId: string) => {
    setLoading(true);
    try {
      const userShops = await shopService.getUserShops(userId);
      setShops(userShops);

      const current = await shopService.getCurrentShop(userId);
      setCurrentShop(current);
    } catch (error) {
      console.error("Error loading shops:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const switchShop = React.useCallback(
    async (shopId: string, userId: string) => {
      try {
        await shopService.setCurrentShop(userId, shopId);
        const shop = await shopService.getShop(shopId);
        setCurrentShop(shop);
      } catch (error) {
        console.error("Error switching shop:", error);
      }
    },
    [],
  );

  return {
    shops,
    currentShop,
    loading,
    loadShops,
    switchShop,
    shopService,
  };
};
