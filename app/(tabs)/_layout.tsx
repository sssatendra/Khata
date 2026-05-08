import { MaterialIcons } from "@expo/vector-icons";
import { Tabs, router } from "expo-router";
import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { THEME } from "../../constants/theme";

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false, // Use internal headers for more control and glass effects
        headerStyle: {
          backgroundColor: THEME.background,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: THEME.textMain,
        headerTitleStyle: {
          fontWeight: "900",
          fontSize: 20,
          letterSpacing: 0.5,
        },
        tabBarStyle: {
          backgroundColor: 'rgba(15, 23, 42, 0.95)', // Deep Slate semi-transparent
          borderTopWidth: 0,
          height: 64,
          marginBottom: insets.bottom > 0 ? insets.bottom : 16,
          marginHorizontal: 20,
          borderRadius: 24,
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          elevation: 10,
          shadowColor: THEME.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          paddingBottom: 0,
          paddingTop: 0,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.1)',
        },
        tabBarActiveTintColor: THEME.primary,
        tabBarInactiveTintColor: THEME.textMuted,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "900",
          marginBottom: 8,
          letterSpacing: 0.5,
          textTransform: "uppercase",
        },
        tabBarIconStyle: {
          marginTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Home",
          tabBarLabel: "Home",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="grid-view" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="customers"
        options={{
          title: "Customers",
          tabBarLabel: "Clients",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="people-outline" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: "Insights",
          tabBarLabel: "Stats",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="bar-chart" size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarLabel: "Profile",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="person-outline" size={26} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
