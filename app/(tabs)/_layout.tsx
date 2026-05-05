import { Tabs, router } from "expo-router";
import React from "react";
import { Text, TouchableOpacity } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: {
          backgroundColor: "#2563EB",
          borderBottomWidth: 1,
          borderBottomColor: "#1E40AF",
        },
        headerTintColor: "#FFFFFF",
        headerTitleStyle: {
          fontWeight: "700",
          fontSize: 18,
        },
        tabBarStyle: {
          backgroundColor: "#FFFFFF",
          borderTopWidth: 1,
          borderTopColor: "#E5E7EB",
          paddingBottom: 4,
        },
        tabBarActiveTintColor: "#2563EB",
        tabBarInactiveTintColor: "#9CA3AF",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginBottom: 4,
        },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Dashboard",
          tabBarLabel: "Dashboard",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📊</Text>,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push("/settings")}
              style={{ marginRight: 16 }}
            >
              <Text style={{ fontSize: 20 }}>⚙️</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="customers"
        options={{
          title: "Customers",
          tabBarLabel: "Customers",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>👥</Text>,
          headerRight: () => (
            <TouchableOpacity
              onPress={() => router.push("/add-customer")}
              style={{ marginRight: 16 }}
            >
              <Text style={{ fontSize: 20 }}>➕</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <Tabs.Screen
        name="analytics"
        options={{
          title: "Analytics",
          tabBarLabel: "Analytics",
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 24 }}>📈</Text>,
        }}
      />
    </Tabs>
  );
}
