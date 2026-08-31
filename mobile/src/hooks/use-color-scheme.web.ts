import { useSyncExternalStore } from "react";
import {
  useColorScheme as useRNColorScheme,
} from "react-native";

function subscribe(): () => void {
  return () => undefined;
}

function getClientSnapshot(): boolean {
  return true;
}

function getServerSnapshot(): boolean {
  return false;
}

export function useColorScheme() {
  const hasHydrated =
    useSyncExternalStore(
      subscribe,
      getClientSnapshot,
      getServerSnapshot,
    );

  const colorScheme = useRNColorScheme();

  return hasHydrated
    ? colorScheme
    : "light";
}