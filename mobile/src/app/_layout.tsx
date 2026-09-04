import {
  DarkTheme,
  DefaultTheme,
  Stack,
  ThemeProvider,
} from "expo-router";
import { useFonts } from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import {
  ActivityIndicator,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import { useEffect } from "react";
import {
  AuthProvider,
  useAuth,
} from "@/context/auth";
import {
  useNotificationRuntime,
} from "@/hooks/use-notification-runtime";

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const {
    isAuthenticated,
    isLoading,
  } = useAuth();
  
  useNotificationRuntime(isAuthenticated);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Protected guard={!isAuthenticated}>
        <Stack.Screen name="(auth)" />
      </Stack.Protected>

      <Stack.Protected guard={isAuthenticated}>
        <Stack.Screen name="(app)" />
      </Stack.Protected>
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [iconFontsLoaded, iconFontError] = useFonts({
    MaterialIcons: require("@react-native-vector-icons/material-icons/fonts/MaterialIcons.ttf"),
    "MaterialIcons-Regular": require("@react-native-vector-icons/material-icons/fonts/MaterialIcons.ttf"),
  });

  const appIsReady =
  iconFontsLoaded || Boolean(iconFontError);

  useEffect(() => {
    if (appIsReady) {
      void SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  if (!iconFontsLoaded && !iconFontError) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider
        value={
          colorScheme === "dark"
            ? DarkTheme
            : DefaultTheme
        }
      >
        <RootNavigator />
      </ThemeProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
