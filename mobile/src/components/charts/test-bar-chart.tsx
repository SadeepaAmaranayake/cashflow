import { StyleSheet, Text, View } from "react-native";
import { BarChart } from "react-native-gifted-charts";

const TEST_DATA = [
  {
    value: 25050,
    label: "Food",
    frontColor: "#ef4444",
  },
  {
    value: 18000,
    label: "Travel",
    frontColor: "#3b82f6",
  },
  {
    value: 12000,
    label: "Health",
    frontColor: "#22c55e",
  },
];

export function TestBarChart() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Test expense chart
      </Text>

      <BarChart
        data={TEST_DATA}
        width={280}
        height={220}
        barWidth={40}
        spacing={35}
        initialSpacing={20}
        noOfSections={4}
        yAxisThickness={0}
        xAxisThickness={1}
        xAxisColor="#94a3b8"
        rulesColor="#334155"
        xAxisLabelTextStyle={styles.axisLabel}
        yAxisTextStyle={styles.axisLabel}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    backgroundColor: "#111827",
  },

  title: {
    marginBottom: 20,
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },

  axisLabel: {
    color: "#d1d5db",
    fontSize: 11,
  },
});