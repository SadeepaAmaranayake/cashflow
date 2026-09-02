import {
  Alert,
  Button,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useTheme } from "@/hooks/use-theme";
import {
  scheduleTestNotification,
} from "@/services/reminders";

export default function SettingsScreen() {
  const theme = useTheme();

  async function handleTestNotification(): Promise<void> {
    try {
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

      Alert.alert(
        "Notification error",
        message,
      );
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
});
