import { Stack, router } from "expo-router";
import { AddCustomerScreen } from "../screens/AddCustomerScreen";

export default function AddCustomerPage() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <AddCustomerScreen
        onSuccess={() => {
          router.back();
        }}
        onBack={() => router.back()}
      />
    </>
  );
}
