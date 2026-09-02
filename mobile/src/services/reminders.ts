import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const DAILY_REMINDER_CHANNEL_ID =
  "daily-reminder";

const DAILY_REMINDER_STORAGE_KEY =
  "dailyReminderNotificationId";

let isNotificationHandlerConfigured = false;

export function configureNotificationHandler(): void {
  if (isNotificationHandlerConfigured) {
    return;
  }

  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  isNotificationHandlerConfigured = true;
}

function validateReminderTime(
  hour: number,
  minute: number,
): void {
  if (
    !Number.isInteger(hour) ||
    hour < 0 ||
    hour > 23
  ) {
    throw new Error(
      "Reminder hour must be between 0 and 23",
    );
  }

  if (
    !Number.isInteger(minute) ||
    minute < 0 ||
    minute > 59
  ) {
    throw new Error(
      "Reminder minute must be between 0 and 59",
    );
  }
}

async function createAndroidChannel(): Promise<void> {
  if (Platform.OS !== "android") {
    return;
  }

  await Notifications.setNotificationChannelAsync(
    DAILY_REMINDER_CHANNEL_ID,
    {
      name: "Daily reminder",
      description:
        "Daily Cashflow transaction reminder",
      importance:
        Notifications.AndroidImportance.DEFAULT,
      sound: "default",
    },
  );
}

async function requestPermission(): Promise<void> {
  await createAndroidChannel();

  const currentPermissions =
    await Notifications.getPermissionsAsync();

  if (currentPermissions.granted) {
    return;
  }

  const requestedPermissions =
    await Notifications.requestPermissionsAsync();

  if (!requestedPermissions.granted) {
    throw new Error(
      "Notification permission is required to set a reminder",
    );
  }
}

export async function cancelDailyReminder(): Promise<void> {
  const notificationId =
    await SecureStore.getItemAsync(
      DAILY_REMINDER_STORAGE_KEY,
    );

  if (!notificationId) {
    return;
  }

  await Notifications.cancelScheduledNotificationAsync(
    notificationId,
  );

  await SecureStore.deleteItemAsync(
    DAILY_REMINDER_STORAGE_KEY,
  );
}

export async function scheduleDailyReminder(
  hour: number,
  minute: number,
): Promise<void> {
  validateReminderTime(hour, minute);

  await requestPermission();

  // Prevents two reminders when the user changes time.
  await cancelDailyReminder();

  const notificationId =
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Cashflow reminder",
        body: "Remember to record today’s income and expenses.",
        data: {
          type: "daily-reminder",
        },
        sound: "default",
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes
          .DAILY,
        hour,
        minute,
        channelId:
          Platform.OS === "android"
            ? DAILY_REMINDER_CHANNEL_ID
            : undefined,
      },
    });

  await SecureStore.setItemAsync(
    DAILY_REMINDER_STORAGE_KEY,
    notificationId,
  );
}
