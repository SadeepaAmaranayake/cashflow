import { isRunningInExpoGo } from "expo";
import {
  useEffect,
  useState,
} from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import { useAuth } from "@/context/auth";
import { useTheme } from "@/hooks/use-theme";

export default function SettingsScreen() {
  const theme = useTheme();
  const { logout } = useAuth();

  const notificationsUnavailable =
    Platform.OS === "web" ||
    isRunningInExpoGo();

  const [isLoggingOut, setIsLoggingOut] =
    useState(false);
  const [logoutError, setLogoutError] =
    useState<string | null>(null);
  const [reminderEnabled, setReminderEnabled] =
    useState(false);
  const [hourText, setHourText] = useState("21");
  const [minuteText, setMinuteText] = useState("0");
  const [isReminderLoading, setIsReminderLoading] =
    useState(!notificationsUnavailable);
  const [isReminderSaving, setIsReminderSaving] =
    useState(false);
  const [reminderError, setReminderError] =
    useState<string | null>(null);

  useEffect(() => {
    if (notificationsUnavailable) {
      return;
    }

    let isActive = true;

    async function loadSettings(): Promise<void> {
      try {
        const { getDailyReminderSettings } =
          await import("@/services/reminders");
        const settings =
          await getDailyReminderSettings();

        if (!isActive) {
          return;
        }

        setReminderEnabled(settings.enabled);
        setHourText(String(settings.hour));
        setMinuteText(String(settings.minute));
      } catch (error) {
        if (isActive) {
          setReminderError(
            error instanceof Error
              ? error.message
              : "Unable to load reminder settings",
          );
        }
      } finally {
        if (isActive) {
          setIsReminderLoading(false);
        }
      }
    }

    void loadSettings();

    return () => {
      isActive = false;
    };
  }, [notificationsUnavailable]);

  function getReminderTime():
    | { hour: number; minute: number }
    | null {
    const hourValue = hourText.trim();
    const minuteValue = minuteText.trim();

    if (
      !/^\d{1,2}$/.test(hourValue) ||
      !/^\d{1,2}$/.test(minuteValue)
    ) {
      setReminderError(
        "Enter hour and minute using numbers only.",
      );
      return null;
    }

    const hour = Number(hourValue);
    const minute = Number(minuteValue);

    if (hour < 0 || hour > 23) {
      setReminderError(
        "Hour must be between 0 and 23.",
      );
      return null;
    }

    if (minute < 0 || minute > 59) {
      setReminderError(
        "Minute must be between 0 and 59.",
      );
      return null;
    }

    return { hour, minute };
  }

  async function enableReminder(): Promise<void> {
    const time = getReminderTime();

    if (!time) {
      return;
    }

    setIsReminderSaving(true);
    setReminderError(null);

    try {
      const { scheduleDailyReminder } =
        await import("@/services/reminders");

      await scheduleDailyReminder(
        time.hour,
        time.minute,
      );
      setReminderEnabled(true);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to schedule the reminder";

      setReminderError(message);

      if (
        message ===
        "Notification permission was denied"
      ) {
        Alert.alert(
          "Notifications are disabled",
          "You can enable notifications for CampusCash in the phone settings.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Open settings",
              onPress: () => {
                void Linking.openSettings();
              },
            },
          ],
        );
      }
    } finally {
      setIsReminderSaving(false);
    }
  }

  async function disableReminder(): Promise<void> {
    setIsReminderSaving(true);
    setReminderError(null);

    try {
      const { cancelDailyReminder } =
        await import("@/services/reminders");

      await cancelDailyReminder();
      setReminderEnabled(false);
    } catch (error) {
      setReminderError(
        error instanceof Error
          ? error.message
          : "Unable to disable the reminder",
      );
    } finally {
      setIsReminderSaving(false);
    }
  }

  function handleReminderToggle(
    enabled: boolean,
  ): void {
    if (!enabled) {
      void disableReminder();
      return;
    }

    Alert.alert(
      "Enable daily reminder?",
      "Cashflow will remind you once each day to record your spending.",
      [
        { text: "Not now", style: "cancel" },
        {
          text: "Continue",
          onPress: () => {
            void enableReminder();
          },
        },
      ],
    );
  }

  async function handleTestNotification(): Promise<void> {
    if (notificationsUnavailable) {
      Alert.alert(
        "Development build required",
        "Install the cashflow development APK to test notifications.",
      );
      return;
    }

    try {
      const { scheduleTestNotification } =
        await import("@/services/reminders");

      await scheduleTestNotification(60);
      Alert.alert(
        "Test scheduled",
        "The notification should appear in approximately one minute.",
      );
    } catch (error) {
      Alert.alert(
        "Notification error",
        error instanceof Error
          ? error.message
          : "Unable to schedule the test notification",
      );
    }
  }

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

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { backgroundColor: theme.background },
      ]}
    >
      <Text
        style={[
          styles.title,
          { color: theme.text },
        ]}
      >
        Settings
      </Text>

      <View
        style={[
          styles.reminderCard,
          {
            backgroundColor:
              theme.backgroundElement,
          },
        ]}
      >
        <View style={styles.reminderHeader}>
          <View style={styles.reminderDescription}>
            <Text
              style={[
                styles.reminderTitle,
                { color: theme.text },
              ]}
            >
              Daily reminder
            </Text>
            <Text
              style={{ color: theme.textSecondary }}
            >
              Remind me to record today&apos;s spending.
            </Text>
          </View>

          <Switch
            disabled={
              notificationsUnavailable ||
              isReminderLoading ||
              isReminderSaving
            }
            onValueChange={handleReminderToggle}
            value={reminderEnabled}
          />
        </View>

        {notificationsUnavailable ? (
          <Text style={styles.warningText}>
            Notification testing requires the Cashflow
            development APK on this device.
          </Text>
        ) : isReminderLoading ? (
          <ActivityIndicator />
        ) : (
          <>
            <Text style={{ color: theme.text }}>
              Reminder time (24-hour format)
            </Text>

            <View style={styles.timeRow}>
              <TextInput
                editable={!isReminderSaving}
                keyboardType="number-pad"
                maxLength={2}
                onChangeText={setHourText}
                placeholder="21"
                placeholderTextColor={
                  theme.textSecondary
                }
                style={[
                  styles.timeInput,
                  {
                    backgroundColor:
                      theme.background,
                    color: theme.text,
                  },
                ]}
                value={hourText}
              />

              <Text
                style={[
                  styles.timeSeparator,
                  { color: theme.text },
                ]}
              >
                :
              </Text>

              <TextInput
                editable={!isReminderSaving}
                keyboardType="number-pad"
                maxLength={2}
                onChangeText={setMinuteText}
                placeholder="00"
                placeholderTextColor={
                  theme.textSecondary
                }
                style={[
                  styles.timeInput,
                  {
                    backgroundColor:
                      theme.background,
                    color: theme.text,
                  },
                ]}
                value={minuteText}
              />
            </View>

            {reminderEnabled ? (
              <Button
                disabled={isReminderSaving}
                title={
                  isReminderSaving
                    ? "Saving..."
                    : "Save reminder time"
                }
                onPress={() => {
                  void enableReminder();
                }}
              />
            ) : null}
          </>
        )}

        {reminderError ? (
          <Text style={styles.errorText}>
            {reminderError}
          </Text>
        ) : null}
      </View>

      <Button
        disabled={notificationsUnavailable}
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
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    gap: 20,
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
  },
  reminderCard: {
    borderRadius: 14,
    gap: 16,
    padding: 16,
  },
  reminderHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  reminderDescription: {
    flex: 1,
    gap: 4,
    paddingRight: 16,
  },
  reminderTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  timeRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  timeInput: {
    borderColor: "#9CA3AF",
    borderRadius: 8,
    borderWidth: 1,
    fontSize: 18,
    padding: 12,
    textAlign: "center",
    width: 70,
  },
  timeSeparator: {
    fontSize: 22,
    fontWeight: "700",
  },
  warningText: {
    color: "#D97706",
  },
  errorText: {
    color: "#DC2626",
  },
});
