/**
 * Multi-Shop Service
 * Manages shops and shop selection for users with multiple stores
 */

import { db } from "@/config/firebase";
import { Shop, User } from "@/types/index";
import {
    arrayRemove,
    arrayUnion,
    collection,
    Timestamp
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
      const newShop = await db.collection("shops").add({
        name: shopName,
        ownerUid: userId,
        ownerPhone: ownerPhone,
        staff: [], // Array of staff user IDs
        customers: [], // Array of customer IDs
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Add shop ID to user's shops array
      await db
        .collection("users")
        .doc(userId)
        .update({
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
      const userDoc = await db.collection("users").doc(userId).get();
      const shopIds = userDoc.data()?.shops || [];

      if (shopIds.length === 0) {
        return [];
      }

      // Fetch all shops
      const shops: Shop[] = [];
      for (const shopId of shopIds) {
        const shopDoc = await db.collection("shops").doc(shopId).get();
        if (shopDoc.exists) {
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
      const shopDoc = await db.collection("shops").doc(shopId).get();
      if (shopDoc.exists) {
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
      await db
        .collection("shops")
        .doc(shopId)
        .update({
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
      await db.collection("users").doc(userId).update({
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
      const userDoc = await db.collection("users").doc(userId).get();
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
      await db
        .collection("shops")
        .doc(shopId)
        .update({
          staff: arrayUnion(staffUserId),
          updatedAt: Timestamp.now(),
        });

      // Also add shop to staff member's shops array
      await db
        .collection("users")
        .doc(staffUserId)
        .update({
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
      await db
        .collection("shops")
        .doc(shopId)
        .update({
          staff: arrayRemove(staffUserId),
          updatedAt: Timestamp.now(),
        });

      // Remove shop from staff member's shops array
      await db
        .collection("users")
        .doc(staffUserId)
        .update({
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

      // Remove shop from customers (optional - can archive instead)
      // await db.collection("customers").where("shopId", "==", shopId).delete();

      // Delete shop document
      await db.collection("shops").doc(shopId).delete();

      // Remove shop from user's shops array
      await db
        .collection("users")
        .doc(userId)
        .update({
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
        const userDoc = await db.collection("users").doc(staffId).get();
        if (userDoc.exists) {
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
      const customersSnapshot = await db
        .collection("customers")
        .where("shopId", "==", shopId)
        .get();
      const customerCount = customersSnapshot.size;

      // Count transactions this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);

      const transactionsSnapshot = await db
        .collection("transactions")
        .where("shopId", "==", shopId)
        .where("createdAt", ">=", Timestamp.fromDate(startOfMonth))
        .get();
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
      const invitationRef = await db.collection("invitations").add({
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
      return invitationRef.id;
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
      const invitationDoc = await db
        .collection("invitations")
        .doc(invitationId)
        .get();

      if (!invitationDoc.exists) {
        throw new Error("Invitation not found");
      }

      const { shopId } = invitationDoc.data();

      // Add staff to shop
      await this.addStaff(shopId, userId);

      // Mark invitation as accepted
      await db.collection("invitations").doc(invitationId).update({
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
