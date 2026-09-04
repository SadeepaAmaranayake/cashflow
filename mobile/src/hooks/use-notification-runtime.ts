import { isRunningInExpoGo } from "expo";
import { router } from "expo-router";
import { useEffect } from "react";
import { Platform } from "react-native";

export function useNotificationRuntime(
  isAuthenticated: boolean,
): void {
  useEffect(() => {
    // Native notification behavior cannot be tested on web.
    //
    // Expo Go installation previously crashed when
    // expo-notifications loaded, so keep it disabled there
    // and use the development APK for notification testing.
    if (
      Platform.OS === "web" ||
      isRunningInExpoGo()
    ) {
      return;
    }

    let isDisposed = false;
    let removeTapListener:
      | (() => void)
      | undefined;

    void import("@/services/reminders")
      .then((reminders) => {
        if (isDisposed) {
          return;
        }

        // Makes a notification display as a banner while
        // CampusCash is open.
        reminders.configureNotificationHandler();

        // Only enter the protected Add screen after
        // authentication has finished successfully.
        if (isAuthenticated) {
          removeTapListener =
            reminders.observeNotificationTaps(
              (route) => {
                router.push(route);
              },
            );
        }
      })
      .catch((error: unknown) => {
        console.error(
          "Notification setup failed:",
          error,
        );
      });

    return () => {
      isDisposed = true;
      removeTapListener?.();
    };
  }, [isAuthenticated]);
}