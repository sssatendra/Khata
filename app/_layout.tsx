import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { useAuthStore } from "../store/authStore";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { isAuthenticated, restoreAuth, loading } = useAuthStore();
  const [restored, setRestored] = useState(false);

  useEffect(() => {
    const restore = async () => {
      await restoreAuth();
      setRestored(true);
      SplashScreen.hideAsync();
    };
    restore();
  }, []);

  if (!restored || loading) {
    return null;
  }

  return (
    <>
      <Stack>
        {isAuthenticated ? (
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        ) : (
          <Stack.Screen
            name="login"
            options={{
              headerShown: false,
              animation: 'none',
            }}
          />
        )}
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}
