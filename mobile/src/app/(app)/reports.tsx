import {
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useTheme } from "@/hooks/use-theme";

export default function ReportsScreen() {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.background },
      ]}
    >
      <Text style={{ color: theme.text }}>
        Reports
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
  },
});
