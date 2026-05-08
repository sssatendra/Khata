import { router } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { NeumorphicButton } from "../components/ui/NeumorphicButton";
import { NeumorphicCard } from "../components/ui/NeumorphicCard";
import { THEME } from "../constants/theme";
import { supportService } from "../services/firestore";
import { useAuthStore } from "../store/authStore";

export default function FeedbackScreen() {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const [rating, setRating] = useState<number>(0);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      Alert.alert("Rating Required", "Please select a rating before submitting.");
      return;
    }
    if (!message.trim()) {
      Alert.alert("Feedback Required", "Please share your thoughts with us.");
      return;
    }

    try {
      setLoading(true);
      await supportService.submitFeedback({
        userId: user?.id || "anonymous",
        shopId: user?.shopId || "unknown",
        message: message.trim(),
        rating,
      });
      
      Alert.alert(
        "Thank You!",
        "Your feedback has been submitted successfully. We appreciate your input!",
        [{ text: "OK", onPress: () => router.back() }]
      );
    } catch (error) {
      Alert.alert("Error", "Failed to submit feedback. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.backButton}
              activeOpacity={0.7}
            >
              <NeumorphicCard borderRadius={12} style={styles.backIconCard} contentStyle={styles.backIconContent}>
                <Text style={styles.backText}>←</Text>
              </NeumorphicCard>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Send Feedback</Text>
          </View>

          <Text style={styles.subtitle}>
            Your thoughts help us build a better experience for everyone.
          </Text>

          {/* Rating Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>HOW WOULD YOU RATE US?</Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => setRating(star)}
                  style={styles.starTouch}
                  activeOpacity={0.6}
                >
                  <Text style={[styles.star, rating >= star && styles.starActive]}>
                    {rating >= star ? "⭐" : "☆"}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.ratingLabel}>
              {rating === 1 && "Poor"}
              {rating === 2 && "Fair"}
              {rating === 3 && "Good"}
              {rating === 4 && "Great"}
              {rating === 5 && "Excellent!"}
            </Text>
          </View>

          {/* Message Section */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>YOUR MESSAGE</Text>
            <NeumorphicCard borderRadius={20} contentStyle={styles.inputCard}>
              <TextInput
                style={styles.input}
                placeholder="What's on your mind?"
                placeholderTextColor={THEME.textMuted}
                multiline
                numberOfLines={6}
                value={message}
                onChangeText={setMessage}
                textAlignVertical="top"
              />
            </NeumorphicCard>
          </View>

          <View style={styles.footer}>
            <NeumorphicButton
              title={loading ? "SUBMITTING..." : "SUBMIT FEEDBACK"}
              onPress={handleSubmit}
              disabled={loading}
              variant="primary"
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    flexGrow: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
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
    padding: 0,
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
  subtitle: {
    fontSize: 15,
    color: THEME.textMuted,
    lineHeight: 22,
    marginBottom: 32,
    fontWeight: "500",
  },
  section: {
    marginBottom: 32,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "800",
    color: THEME.textMuted,
    marginBottom: 16,
    letterSpacing: 2,
  },
  ratingContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 12,
  },
  starTouch: {
    padding: 4,
  },
  star: {
    fontSize: 40,
    color: THEME.textMuted,
  },
  starActive: {
    color: THEME.primary,
  },
  ratingLabel: {
    textAlign: "center",
    marginTop: 12,
    fontSize: 14,
    fontWeight: "700",
    color: THEME.primary,
    height: 20,
  },
  inputCard: {
    padding: 16,
    minHeight: 120,
  },
  input: {
    fontSize: 16,
    color: THEME.textMain,
    fontWeight: "600",
    minHeight: 100,
  },
  footer: {
    marginTop: "auto",
    paddingBottom: 20,
  },
});
