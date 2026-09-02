import { Tabs } from "expo-router";
import "@/services/reminders";

export default function AppLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{ title: "Dashboard" }}
      />

      <Tabs.Screen
        name="add"
        options={{ title: "Add" }}
      />

      <Tabs.Screen
        name="history"
        options={{ title: "History" }}
      />

      <Tabs.Screen
        name="reports"
        options={{ title: "Reports" }}
      />

      <Tabs.Screen
        name="settings"
        options={{ title: "Settings" }}
      />
    </Tabs>
  );
}