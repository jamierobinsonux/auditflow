import { Text, View } from "@react-pdf/renderer";
import type { ReportTheme } from "../theme";

export function MetricTable({
  rows,
  theme,
}: {
  rows: { label: string; value: string | number }[];
  theme: ReportTheme;
}) {
  return (
    <View style={{ marginTop: 10 }}>
      {rows.map((row, index) => (
        <View
          key={`${row.label}-${index}`}
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            paddingVertical: 7,
            borderBottomWidth: 1,
            borderBottomColor: theme.border,
          }}
          wrap={false}
        >
          <Text style={{ fontSize: 9.6, color: theme.mutedText }}>{row.label}</Text>
          <Text style={{ fontSize: 9.6, color: theme.text, fontWeight: "bold" }}>
            {String(row.value)}
          </Text>
        </View>
      ))}
    </View>
  );
}
