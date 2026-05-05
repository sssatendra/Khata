import { router } from "expo-router";
import { DashboardScreen } from "../../screens/DashboardScreen";

export default function DashboardTab() {
  return (
    <DashboardScreen
      onNavigateToCustomers={() => router.push("/(tabs)/customers")}
      onNavigateToAddCustomer={() => router.push("/add-customer")}
      onNavigateToCustomerDetail={(customer) => {
        router.push({
          pathname: "/customer/[id]",
          params: { id: customer.id },
        });
      }}
    />
  );
}
