import { router } from "expo-router";
import { LoginScreen } from "../screens/LoginScreen";

export default function LoginPage() {
  return (
    <LoginScreen
      onSuccess={() => {
        router.replace("/(tabs)");
      }}
    />
  );
}
