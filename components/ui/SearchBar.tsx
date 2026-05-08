import React from "react";
import { StyleSheet, View } from "react-native";
import { useUIStore } from "../../store/uiStore";
import { NeumorphicInput } from "./NeumorphicInput";

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search customers...",
  onSearch,
}) => {
  const { searchQuery, setSearchQuery } = useUIStore();

  const handleChangeText = (text: string) => {
    setSearchQuery(text);
    onSearch?.(text);
  };

  return (
    <View style={styles.container}>
      <NeumorphicInput
        placeholder={placeholder}
        value={searchQuery}
        onChangeText={handleChangeText}
        containerStyle={styles.inputContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingVertical: 4,
  },
  inputContainer: {
    marginVertical: 0,
  },
});
