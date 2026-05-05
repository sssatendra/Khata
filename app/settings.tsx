import { router } from "expo-router";
import React from "react";
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Button } from "../components/ui/Button";
import { useAuthStore } from "../store/authStore";

export default function SettingsScreen() {
  const { user, signOut } = useAuthStore();

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: async () => {
          try {
            await signOut();
            router.replace("/login");
          } catch (error) {
            Alert.alert("Error", "Failed to sign out");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* User Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👤 Account</Text>

          <View style={styles.card}>
            <Text style={styles.label}>Name</Text>
            <Text style={styles.value}>{user?.name}</Text>

            <Text style={[styles.label, styles.labelMargin]}>Phone</Text>
            <Text style={styles.value}>{user?.phone}</Text>

            <Text style={[styles.label, styles.labelMargin]}>Role</Text>
            <Text style={styles.value}>
              {user?.role === "admin" ? "👑 Admin" : "👤 Staff"}
            </Text>
          </View>
        </View>

        {/* App Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ App Information</Text>

          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>App Version</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>

            <View style={[styles.infoRow, styles.divider]}>
              <Text style={styles.infoLabel}>Build</Text>
              <Text style={styles.infoValue}>Production</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Database</Text>
              <Text style={styles.infoValue}>Firebase</Text>
            </View>
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✨ Features</Text>

          <View style={styles.card}>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>✅</Text>
              <Text style={styles.featureText}>Customer Management</Text>
            </View>
            <View style={[styles.featureItem, styles.divider]}>
              <Text style={styles.featureIcon}>✅</Text>
              <Text style={styles.featureText}>Transaction Ledger</Text>
            </View>
            <View style={[styles.featureItem, styles.divider]}>
              <Text style={styles.featureIcon}>✅</Text>
              <Text style={styles.featureText}>WhatsApp Integration</Text>
            </View>
            <View style={[styles.featureItem, styles.divider]}>
              <Text style={styles.featureIcon}>✅</Text>
              <Text style={styles.featureText}>Risk Assessment</Text>
            </View>
            <View style={styles.featureItem}>
              <Text style={styles.featureIcon}>✅</Text>
              <Text style={styles.featureText}>Analytics Dashboard</Text>
            </View>
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📞 Support</Text>

          <TouchableOpacity style={styles.supportButton}>
            <Text style={styles.supportIcon}>💬</Text>
            <View style={styles.supportContent}>
              <Text style={styles.supportTitle}>Send Feedback</Text>
              <Text style={styles.supportDesc}>Help us improve the app</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.supportButton, styles.marginTop]}>
            <Text style={styles.supportIcon}>📖</Text>
            <View style={styles.supportContent}>
              <Text style={styles.supportTitle}>User Guide</Text>
              <Text style={styles.supportDesc}>Learn how to use Khata</Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.supportButton, styles.marginTop]}>
            <Text style={styles.supportIcon}>🔒</Text>
            <View style={styles.supportContent}>
              <Text style={styles.supportTitle}>Privacy Policy</Text>
              <Text style={styles.supportDesc}>Your data protection</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Sign Out */}
        <View style={[styles.section, styles.lastSection]}>
          <Button
            title="🚪 Sign Out"
            onPress={handleSignOut}
            variant="danger"
            size="large"
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FAFB",
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 24,
  },
  lastSection: {
    marginBottom: 40,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1F2937",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  label: {
    fontSize: 12,
    color: "#6B7280",
    fontWeight: "500",
  },
  labelMargin: {
    marginTop: 12,
  },
  value: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginTop: 4,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  infoLabel: {
    fontSize: 13,
    color: "#6B7280",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1F2937",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  featureIcon: {
    fontSize: 16,
  },
  featureText: {
    fontSize: 13,
    color: "#374151",
    fontWeight: "500",
  },
  supportButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    gap: 12,
  },
  marginTop: {
    marginTop: 12,
  },
  supportIcon: {
    fontSize: 24,
  },
  supportContent: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1F2937",
  },
  supportDesc: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },
});
