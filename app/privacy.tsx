import { router } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NeumorphicCard } from "../components/ui/NeumorphicCard";
import { THEME } from "../constants/theme";

export default function PrivacyPolicyScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <NeumorphicCard borderRadius={12} style={styles.backIconCard} contentStyle={styles.backIconContent}>
              <Text style={styles.backText}>←</Text>
            </NeumorphicCard>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Privacy Policy</Text>
        </View>

        <NeumorphicCard borderRadius={24} contentStyle={styles.contentCard}>
          <Text style={styles.lastUpdated}>Last Updated: May 2026</Text>

          <Text style={styles.sectionTitle}>1. Introduction</Text>
          <Text style={styles.paragraph}>
            Khata Fintech ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed.
          </Text>

          <Text style={styles.sectionTitle}>2. Information We Collect</Text>
          <Text style={styles.paragraph}>
            We collect information that you provide directly to us, such as when you create an account, add customers, or record transactions. This includes:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Name and contact information</Text>
            <Text style={styles.bulletItem}>• Business/Shop details</Text>
            <Text style={styles.bulletItem}>• Transaction records and customer ledger data</Text>
            <Text style={styles.bulletItem}>• Device information and usage logs</Text>
          </View>

          <Text style={styles.sectionTitle}>3. How We Use Your Information</Text>
          <Text style={styles.paragraph}>
            Your data is used to provide the core services of Khata, including:
          </Text>
          <View style={styles.bulletList}>
            <Text style={styles.bulletItem}>• Managing your digital ledger</Text>
            <Text style={styles.bulletItem}>• Calculating financial analytics and risk levels</Text>
            <Text style={styles.bulletItem}>• Providing customer support and feedback responses</Text>
            <Text style={styles.bulletItem}>• Improving app performance and security</Text>
          </View>

          <Text style={styles.sectionTitle}>4. Data Security</Text>
          <Text style={styles.paragraph}>
            We implement industry-standard security measures, including end-to-end encryption and secure cloud storage through Firebase, to protect your business data from unauthorized access.
          </Text>

          <Text style={styles.sectionTitle}>5. Your Rights</Text>
          <Text style={styles.paragraph}>
            You have the right to access, correct, or delete your personal and business data at any time through the app settings or by contacting our support team.
          </Text>

          <Text style={styles.sectionTitle}>6. Contact Us</Text>
          <Text style={styles.paragraph}>
            If you have any questions about this Privacy Policy, please reach out via the "Send Feedback" section in the app.
          </Text>
        </NeumorphicCard>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  backButton: {
    marginRight: 16,
  },
  backIconCard: {
    width: 44,
    height: 44,
  },
  backIconContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  backText: {
    fontSize: 24,
    color: THEME.textMain,
    fontWeight: "bold",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: THEME.textMain,
  },
  contentCard: {
    padding: 24,
  },
  lastUpdated: {
    fontSize: 12,
    color: THEME.textMuted,
    fontWeight: "700",
    marginBottom: 24,
    letterSpacing: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: THEME.textMain,
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 14,
    color: THEME.textMuted,
    lineHeight: 22,
    fontWeight: "500",
  },
  bulletList: {
    marginTop: 8,
    paddingLeft: 8,
  },
  bulletItem: {
    fontSize: 14,
    color: THEME.textMuted,
    lineHeight: 24,
    fontWeight: "600",
  },
});
