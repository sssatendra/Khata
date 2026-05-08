/**
 * Glassmorphism Design System Tokens
 * Palette: Deep Slate & Gold Trust
 */
export const THEME = {
  background: "#0F172A", // Deep Slate
  surface: "rgba(30, 41, 59, 0.7)", // Glass Surface
  border: "rgba(255, 255, 255, 0.1)", // Subtle Glass Border
  primary: "#F59E0B", // Gold Trust
  secondary: "#FBBF24", // Amber
  accent: "#8B5CF6", // Purple Tech
  success: "#10B981", // Emerald
  danger: "#EF4444", // Rose
  warning: "#F59E0B",
  textMain: "#F8FAFC", // Slate 50
  textMuted: "#94A3B8", // Slate 400
  textOnPrimary: "#0F172A",
  borderRadius: 16,
  shadow: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
};

export const Colors = {
  light: {
    text: THEME.textMain,
    background: THEME.background,
    tint: THEME.primary,
    icon: THEME.textMuted,
    tabIconDefault: THEME.textMuted,
    tabIconSelected: THEME.primary,
  },
  dark: {
    text: "#FFFFFF",
    background: "#121417",
    tint: "#6D5DFC",
    icon: "#8894AD",
    tabIconDefault: "#8894AD",
    tabIconSelected: "#FFFFFF",
  },
};

export const Fonts = {
  regular: "Inter-Regular",
  bold: "Inter-Bold",
  semiBold: "Inter-SemiBold",
  rounded: "Inter-Regular",
  mono: "SpaceMono-Regular",
};
