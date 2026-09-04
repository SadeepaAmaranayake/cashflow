import { isRunningInExpoGo } from "expo";
import { useState } from "react";
import {
  Alert,
  Button,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAuth } from "@/context/auth";
import { useTheme } from "@/hooks/use-theme";

export default function SettingsScreen() {
  const theme = useTheme();
  const { logout } = useAuth();
  const [isLoggingOut, setIsLoggingOut] =
    useState(false);
  const [logoutError, setLogoutError] =
    useState<string | null>(null);

  async function handleLogout(): Promise<void> {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    setLogoutError(null);

    try {
      await logout();
    } catch {
      setLogoutError(
        "Could not clear the saved session. Please try again.",
      );
      setIsLoggingOut(false);
    }
  }

  async function handleTestNotification(): Promise<void> {
    if (isRunningInExpoGo()) {
      Alert.alert(
        "Development build required",
        "Notifications cannot be tested in Expo Go. Install the CampusCash development APK.",
      );

      return;
    }

    try {
      const { scheduleTestNotification } =
        await import("@/services/reminders");

      await scheduleTestNotification(60);

      Alert.alert(
        "Test scheduled",
        "Lock the phone. The notification should appear in approximately one minute.",
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to schedule the test notification";

      Alert.alert("Notification error", message);
    }
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.background,
        },
      ]}
    >
      <Text
        style={[
          styles.title,
          {
            color: theme.text,
          },
        ]}
      >
        Settings
      </Text>

      <Button
        title="Schedule 1-minute test"
        onPress={() => {
          void handleTestNotification();
        }}
      />

      {logoutError ? (
        <Text style={styles.errorText}>
          {logoutError}
        </Text>
      ) : null}

      <Button
        color="#DC2626"
        disabled={isLoggingOut}
        title={
          isLoggingOut ? "Logging out..." : "Log out"
        }
        onPress={() => {
          void handleLogout();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 20,
    padding: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
  },

  errorText: {
    color: "#DC2626",
  },
});
