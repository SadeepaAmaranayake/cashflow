import {
  ScrollView,
  StyleSheet,
  Text,
} from "react-native";

import { TestBarChart } from "@/components/charts/test-bar-chart";
import { useTheme } from "@/hooks/use-theme";

export default function ReportsScreen() {
  const theme = useTheme();

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        {
          backgroundColor: theme.background,
        },
      ]}
    >
      <Text
        style={[
          styles.heading,
          {
            color: theme.text,
          }, 
        ]}
      >
        Monthly report
      </Text>

      <TestBarChart />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    gap: 24,
    padding: 24,
  },

  heading: {
    fontSize: 28,
    fontWeight: "700",
  },
});