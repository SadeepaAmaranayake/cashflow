import { MaterialIcons } from "@react-native-vector-icons/material-icons";
import { Tabs } from "expo-router";

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#208aef",
        tabBarInactiveTintColor: "#64748b",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({
            color,
            size,
          }) => (
            <MaterialIcons
              name="home"
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="add"
        options={{
          title: "Add",
          tabBarIcon: ({
            color,
            size,
          }) => (
            <MaterialIcons
              name="add-circle-outline"
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="history"
        options={{
          title: "History",
          tabBarIcon: ({
            color,
            size,
          }) => (
            <MaterialIcons
              name="history"
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="reports"
        options={{
          title: "Reports",
          tabBarIcon: ({
            color,
            size,
          }) => (
            <MaterialIcons
              name="bar-chart"
              color={color}
              size={size}
            />
          ),
        }}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({
            color,
            size,
          }) => (
            <MaterialIcons
              name="settings"
              color={color}
              size={size}
            />
          ),
        }}
      />
    </Tabs>
  );
}