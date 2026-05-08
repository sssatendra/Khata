import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import "react-native-reanimated";
import { useAuthStore } from "../store/authStore";
import { THEME } from "../constants/theme";

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
      <Stack
        screenOptions={{
          headerShown: false,
          headerStyle: {
            backgroundColor: THEME.background,
          },
          headerTintColor: THEME.textMain,
          headerTitleStyle: {
            fontWeight: "900",
            fontSize: 18,
          },
          headerShadowVisible: false,
        }}
      >
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
      <StatusBar style="light" />
    </>
  );
}
