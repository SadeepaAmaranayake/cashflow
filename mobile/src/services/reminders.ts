import * as Notifications from "expo-notifications";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const DAILY_REMINDER_CHANNEL_ID =
  "daily-reminder";

const DAILY_REMINDER_STORAGE_KEY =
  "dailyReminder";

const TEST_NOTIFICATION_STORAGE_KEY =
  "testNotificationId";

export const DEFAULT_REMINDER_HOUR = 21;
export const DEFAULT_REMINDER_MINUTE = 0;

interface StoredDailyReminder {
  scheduleId: string;
  hour: number;
  minute: number;
}

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
      name: "Daily transaction reminder",
      description:
        "Reminds you to record daily income and expenses",
      importance:
        Notifications.AndroidImportance.DEFAULT,
      enableVibrate: true,
      sound: "default",
    },
  );
}

async function requestPermission(): Promise<void> {
  await createAndroidChannel();

  const existingPermission =
    await Notifications.getPermissionsAsync();

  if (existingPermission.granted) {
    return;
  }

  const requestedPermission =
    await Notifications.requestPermissionsAsync();

  if (!requestedPermission.granted) {
    throw new Error(
      "Notification permission was denied",
    );
  }
}

async function getStoredDailyReminder(): Promise<
  StoredDailyReminder | null
> {
  const storedValue =
    await SecureStore.getItemAsync(
      DAILY_REMINDER_STORAGE_KEY,
    );

  if (!storedValue) {
    return null;
  }

  try {
    const parsedValue: unknown =
      JSON.parse(storedValue);

    if (
      typeof parsedValue === "object" &&
      parsedValue !== null &&
      "scheduleId" in parsedValue &&
      "hour" in parsedValue &&
      "minute" in parsedValue &&
      typeof parsedValue.scheduleId === "string" &&
      typeof parsedValue.hour === "number" &&
      typeof parsedValue.minute === "number"
    ) {
      return {
        scheduleId: parsedValue.scheduleId,
        hour: parsedValue.hour,
        minute: parsedValue.minute,
      };
    }
  } catch {
    // Invalid locally stored JSON is handled below.
  }

  await SecureStore.deleteItemAsync(
    DAILY_REMINDER_STORAGE_KEY,
  );

  return null;
}

export async function getDailyReminderSettings(): Promise<{
  enabled: boolean;
  hour: number;
  minute: number;
}> {
  const storedReminder =
    await getStoredDailyReminder();

  if (!storedReminder) {
    return {
      enabled: false,
      hour: DEFAULT_REMINDER_HOUR,
      minute: DEFAULT_REMINDER_MINUTE,
    };
  }

  return {
    enabled: true,
    hour: storedReminder.hour,
    minute: storedReminder.minute,
  };
}

export async function cancelDailyReminder(): Promise<void> {
  const storedReminder =
    await getStoredDailyReminder();

  if (!storedReminder) {
    return;
  }

  await Notifications.cancelScheduledNotificationAsync(
    storedReminder.scheduleId,
  );

  await SecureStore.deleteItemAsync(
    DAILY_REMINDER_STORAGE_KEY,
  );
}

export async function scheduleDailyReminder(
  hour: number,
  minute: number,
): Promise<string> {
  validateReminderTime(hour, minute);

  await requestPermission();

  // Remove the old schedule before creating another one.
  await cancelDailyReminder();

  const scheduleId =
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "CampusCash daily review",
        body: "Have you recorded today's spending?",
        sound: "default",
        data: {
          url: "/add",
        },
      },

      trigger: {
        type:
          Notifications.SchedulableTriggerInputTypes
            .DAILY,
        hour,
        minute,
        channelId:
          Platform.OS === "android"
            ? DAILY_REMINDER_CHANNEL_ID
            : undefined,
      },
    });

  const storedReminder: StoredDailyReminder = {
    scheduleId,
    hour,
    minute,
  };

  try {
    await SecureStore.setItemAsync(
      DAILY_REMINDER_STORAGE_KEY,
      JSON.stringify(storedReminder),
    );
  } catch (error) {
    // Avoid leaving an untracked notification if storage fails.
    await Notifications
      .cancelScheduledNotificationAsync(scheduleId)
      .catch(() => undefined);

    throw error;
  }

  return scheduleId;
}

export async function cancelTestNotification(): Promise<void> {
  const scheduleId =
    await SecureStore.getItemAsync(
      TEST_NOTIFICATION_STORAGE_KEY,
    );

  if (!scheduleId) {
    return;
  }

  try {
    await Notifications.cancelScheduledNotificationAsync(
      scheduleId,
    );
  } finally {
    await SecureStore.deleteItemAsync(
      TEST_NOTIFICATION_STORAGE_KEY,
    );
  }
}

export async function scheduleTestNotification(
  seconds = 60,
): Promise<string> {
  if (
    !Number.isInteger(seconds) ||
    seconds < 1
  ) {
    throw new Error(
      "Test notification delay must be a positive integer",
    );
  }

  await requestPermission();
  await cancelTestNotification();

  const scheduleId =
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "CampusCash daily review",
        body: "Have you recorded today's spending?",
        sound: "default",
        data: {
          url: "/add",
        },
      },
      trigger: {
        type:
          Notifications.SchedulableTriggerInputTypes
            .TIME_INTERVAL,
        seconds,
        repeats: false,
        channelId:
          Platform.OS === "android"
            ? DAILY_REMINDER_CHANNEL_ID
            : undefined,
      },
    });

  try {
    await SecureStore.setItemAsync(
      TEST_NOTIFICATION_STORAGE_KEY,
      scheduleId,
    );
  } catch (error) {
    await Notifications
      .cancelScheduledNotificationAsync(scheduleId)
      .catch(() => undefined);

    throw error;
  }

  return scheduleId;
}
