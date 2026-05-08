import React from "react";
import { StyleProp, StyleSheet, Text, TextInput, TextInputProps, TextStyle, View, ViewStyle } from "react-native";
import { THEME } from "../../constants/theme";
import { NeumorphicCard } from "./NeumorphicCard";

interface NeumorphicInputProps extends TextInputProps {
  label?: string;
  containerStyle?: StyleProp<ViewStyle>;
  style?: StyleProp<TextStyle>;
}

export const NeumorphicInput: React.FC<NeumorphicInputProps> = ({
  label,
  containerStyle,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = React.useState(false);

  return (
    <View style={[styles.container, containerStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <NeumorphicCard 
        variant="sunken" 
        borderRadius={12} 
        style={[isFocused && styles.focusedCard]}
        contentStyle={[styles.inputCard, props.multiline && { height: "auto", paddingVertical: 8 }]}
      >
        <TextInput
          placeholderTextColor={THEME.textMuted}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          style={[styles.input, props.multiline && { height: "auto", minHeight: 100, textAlignVertical: "top" }]}
          {...props}
        />
      </NeumorphicCard>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 10,
    width: "100%",
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: THEME.primary,
    marginBottom: 8,
    marginLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  focusedCard: {
    borderColor: "rgba(255, 255, 255, 0.3)",
    borderWidth: 1,
  },
  inputCard: {
    padding: 0,
    paddingHorizontal: 16,
  },
  input: {
    height: 50,
    color: THEME.textMain,
    fontSize: 16,
    fontWeight: "500",
  },
});
