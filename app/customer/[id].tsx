import { Stack, router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, TouchableOpacity } from "react-native";
import { AddCustomerScreen } from "../../screens/AddCustomerScreen";
import { CustomerDetailScreen } from "../../screens/CustomerDetailScreen";
import { TransactionScreen } from "../../screens/TransactionScreen";
import { customerService } from "../../services/firestore";
import { useDataStore } from "../../store/dataStore";

export default function CustomerDetailPage() {
  const { id } = useLocalSearchParams();
  const [screen, setScreen] = useState<"detail" | "transaction" | "edit">(
    "detail",
  );
  const { customers } = useDataStore();

  const customer = customers.find((c) => c.id === id);

  if (!customer) {
    return <Text>Customer not found</Text>;
  }

  const handleDeleteCustomer = () => {
    Alert.alert(
      "Delete Customer",
      `Are you sure you want to delete ${customer.name}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await customerService.deleteCustomer(customer.id);
              Alert.alert("Success", "Customer deleted successfully");
              router.back();
            } catch (error) {
              Alert.alert("Error", "Failed to delete customer");
            }
          },
        },
      ],
    );
  };

  if (screen === "transaction") {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Add Transaction",
            headerLeft: () => (
              <TouchableOpacity onPress={() => setScreen("detail")}>
                <Text style={styles.headerButton}>← Back</Text>
              </TouchableOpacity>
            ),
          }}
        />
        <TransactionScreen
          customer={customer}
          onSuccess={() => setScreen("detail")}
        />
      </>
    );
  }

  if (screen === "edit") {
    return (
      <>
        <Stack.Screen
          options={{
            title: "Edit Customer",
            headerLeft: () => (
              <TouchableOpacity onPress={() => setScreen("detail")}>
                <Text style={styles.headerButton}>← Back</Text>
              </TouchableOpacity>
            ),
          }}
        />
        <AddCustomerScreen
          customer={customer}
          isEditing
          onSuccess={() => setScreen("detail")}
        />
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: customer.name,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={styles.headerButton}>← Back</Text>
            </TouchableOpacity>
          ),
        }}
      />
      <CustomerDetailScreen
        customer={customer}
        onEditPress={() => setScreen("edit")}
        onTransactionPress={() => setScreen("transaction")}
        onDeletePress={handleDeleteCustomer}
      />
    </>
  );
}

const styles = StyleSheet.create({
  headerButton: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
