import { Stack, router } from "expo-router";
import React from "react";
import {
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuthStore } from "../../store/authStore";
import { THEME } from "../../constants/theme";
import { NeumorphicCard } from "../../components/ui/NeumorphicCard";
import { NeumorphicButton } from "../../components/ui/NeumorphicButton";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
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
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: insets.top + 20 }]}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.headerTitle}>Settings</Text>

        {/* User Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ACCOUNT DETAILS</Text>
          <NeumorphicCard borderRadius={20} contentStyle={styles.cardContent}>
            <View style={styles.infoGroup}>
              <Text style={styles.label}>FULL NAME</Text>
              <Text style={styles.value}>{user?.name}</Text>
            </View>

            <View style={styles.infoGroup}>
              <Text style={styles.label}>PHONE NUMBER</Text>
              <Text style={styles.value}>{user?.phone}</Text>
            </View>

            <View style={styles.infoGroup}>
              <Text style={styles.label}>ROLE</Text>
              <View style={styles.roleBadge}>
                <Text style={styles.roleText}>
                  {user?.role === "admin" ? "👑 Administrator" : "👤 Staff Member"}
                </Text>
              </View>
            </View>
          </NeumorphicCard>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>SUPPORT & HELP</Text>
          
          <TouchableOpacity 
            activeOpacity={0.8} 
            style={styles.supportItem}
            onPress={() => router.push("/feedback")}
          >
            <NeumorphicCard borderRadius={16} contentStyle={styles.supportContent}>
              <Text style={styles.supportIcon}>💬</Text>
              <View>
                <Text style={styles.supportTitle}>Send Feedback</Text>
                <Text style={styles.supportDesc}>Help us improve your experience</Text>
              </View>
            </NeumorphicCard>
          </TouchableOpacity>

          <TouchableOpacity 
            activeOpacity={0.8} 
            style={styles.supportItem}
            onPress={() => router.push("/privacy")}
          >
            <NeumorphicCard borderRadius={16} contentStyle={styles.supportContent}>
              <Text style={styles.supportIcon}>🔒</Text>
              <View>
                <Text style={styles.supportTitle}>Privacy Policy</Text>
                <Text style={styles.supportDesc}>Your data protection details</Text>
              </View>
            </NeumorphicCard>
          </TouchableOpacity>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>APP INFORMATION</Text>
          <NeumorphicCard borderRadius={16} contentStyle={styles.appInfoContent}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Version</Text>
              <Text style={styles.infoValue}>1.0.0 (Production)</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Architecture</Text>
              <Text style={styles.infoValue}>Native Glass UI</Text>
            </View>
          </NeumorphicCard>
        </View>

        {/* Sign Out */}
        <View style={styles.buttonContainer}>
          <NeumorphicButton
            title="SIGN OUT OF SESSION"
            onPress={handleSignOut}
            variant="danger"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  content: {
    padding: 16,
    paddingBottom: 120,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: THEME.textMain,
    marginVertical: 20,
    marginLeft: 4,
  },
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: THEME.textMuted,
    marginBottom: 16,
    marginLeft: 4,
    letterSpacing: 2,
  },
  cardContent: {
    padding: 20,
  },
  infoGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 10,
    fontWeight: "800",
    color: THEME.textMuted,
    marginBottom: 4,
    letterSpacing: 1,
  },
  value: {
    fontSize: 17,
    fontWeight: "700",
    color: THEME.textMain,
  },
  roleBadge: {
    backgroundColor: THEME.primary + "20",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 4,
  },
  roleText: {
    fontSize: 12,
    fontWeight: "800",
    color: THEME.primary,
  },
  supportItem: {
    marginBottom: 12,
  },
  supportContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    gap: 16,
  },
  supportIcon: {
    fontSize: 24,
  },
  supportTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: THEME.textMain,
  },
  supportDesc: {
    fontSize: 12,
    color: THEME.textMuted,
    marginTop: 2,
    fontWeight: "600",
  },
  appInfoContent: {
    padding: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 13,
    color: THEME.textMuted,
    fontWeight: "600",
  },
  infoValue: {
    fontSize: 13,
    color: THEME.textMain,
    fontWeight: "700",
  },
  buttonContainer: {
    marginTop: 10,
  },
});
