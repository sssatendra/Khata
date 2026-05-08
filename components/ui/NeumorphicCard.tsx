import React from "react";
import { StyleSheet, View, ViewStyle, StyleProp } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { THEME } from "../../constants/theme";

interface NeumorphicCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  variant?: "raised" | "sunken";
  borderRadius?: number;
}

export const NeumorphicCard: React.FC<NeumorphicCardProps> = ({
  children,
  style,
  contentStyle,
  variant = "raised",
  borderRadius = THEME.borderRadius,
}) => {
  const isSunken = variant === "sunken";

  return (
    <View style={[styles.cardContainer, style]}>
      <LinearGradient
        colors={
          isSunken
            ? ["rgba(15, 23, 42, 0.8)", "rgba(30, 41, 59, 0.4)"]
            : ["rgba(255, 255, 255, 0.1)", "rgba(255, 255, 255, 0.05)"]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.glassSurface,
          { borderRadius },
          isSunken && styles.sunkenSurface,
        ]}
      >
        <View style={[styles.content, contentStyle]}>{children}</View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    backgroundColor: "transparent",
    alignSelf: "stretch",
    ...THEME.shadow,
  },
  glassSurface: {
    backgroundColor: THEME.surface,
    borderWidth: 1,
    borderColor: THEME.border,
    overflow: "hidden",
  },
  sunkenSurface: {
    backgroundColor: "rgba(15, 23, 42, 0.5)",
    borderColor: "rgba(255, 255, 255, 0.05)",
  },
  content: {
    padding: 16,
  },
});
