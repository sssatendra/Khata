import { router } from "expo-router";
import { AddCustomerScreen } from "../screens/AddCustomerScreen";

export default function AddCustomerPage() {
  return (
    <AddCustomerScreen
      onSuccess={() => {
        router.back();
      }}
    />
  );
}
