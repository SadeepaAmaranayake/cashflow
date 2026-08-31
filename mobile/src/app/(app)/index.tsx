import {
  Button,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAuth } from "@/context/auth";

export default function DashboardScreen() {
  const {
    logout,
    user,
  } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Dashboard
      </Text>

      <Text>
        Logged in as {user?.email}
      </Text>

      <Button
        onPress={() => void logout()}
        title="Log out"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 16,
    justifyContent: "center",
    padding: 24,
  },

  title: {
    fontSize: 28,
    fontWeight: "700",
  },
});