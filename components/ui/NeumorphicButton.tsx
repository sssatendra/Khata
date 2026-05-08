import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
  TextStyle,
  Animated,
  ActivityIndicator,
  StyleProp,
} from "react-native";
import { THEME } from "../../constants/theme";
import { NeumorphicCard } from "./NeumorphicCard";
import { LinearGradient } from "expo-linear-gradient";

interface NeumorphicButtonProps {
  title: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  variant?: "primary" | "secondary" | "danger" | "success";
  disabled?: boolean;
  loading?: boolean;
}

export const NeumorphicButton: React.FC<NeumorphicButtonProps> = ({
  title,
  onPress,
  style,
  textStyle,
  variant = "primary",
  disabled = false,
  loading = false,
}) => {
  const [scale] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const getColors = (): [string, string] => {
    if (disabled) return ["#1E293B", "#1E293B"];
    switch (variant) {
      case "primary":
        return [THEME.primary, THEME.secondary];
      case "danger":
        return [THEME.danger, "#F43F5E"];
      case "success":
        return [THEME.success, "#34D399"];
      default:
        return ["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0.05)"];
    }
  };

  const getTextColor = () => {
    if (disabled) return THEME.textMuted;
    if (variant === "secondary") return THEME.primary;
    return "#0F172A"; // Dark text on light buttons
  };

  return (
    <TouchableOpacity
      activeOpacity={1}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={onPress}
      disabled={disabled || loading}
      style={[styles.wrapper, style]}
    >
      <Animated.View style={{ transform: [{ scale }] }}>
        <LinearGradient
          colors={getColors()}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            styles.buttonSurface,
            variant === "secondary" && styles.secondaryBorder,
          ]}
        >
          {loading ? (
            <ActivityIndicator color={getTextColor()} />
          ) : (
            <Text style={[styles.text, { color: getTextColor() }, textStyle]}>
              {title}
            </Text>
          )}
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    marginVertical: 8,
  },
  buttonSurface: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 120,
    ...THEME.shadow,
  },
  secondaryBorder: {
    borderWidth: 1,
    borderColor: THEME.primary,
  },
  text: {
    fontSize: 15,
    fontWeight: "800",
    letterSpacing: 0.5,
    textAlign: "center",
  },
});
