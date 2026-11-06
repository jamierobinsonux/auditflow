import { Text, View } from "@react-pdf/renderer";
import type { ReportTheme } from "../theme";

export function BarChart({ rows, theme, maxValue }: { rows: { label: string; value: number }[]; theme: ReportTheme; maxValue?: number }) {
  const max = Math.max(maxValue ?? 0, ...rows.map((row) => row.value), 1);
  return (
    <View style={{ marginTop: 12 }}>
      {rows.map((row) => (
        <View key={row.label} style={{ marginBottom: 11 }} wrap={false}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 5 }}>
            <Text style={{ fontSize: 9.5, color: theme.mutedText }}>{row.label}</Text>
            <Text style={{ fontSize: 9.5, color: theme.text, fontWeight: "bold" }}>{row.value}</Text>
          </View>
          <View style={{ height: 5, backgroundColor: theme.subtle }}>
            <View style={{ height: 5, width: `${Math.max(3, (row.value / max) * 100)}%`, backgroundColor: row.value === 0 ? theme.border : theme.accent }} />
          </View>
        </View>
      ))}
    </View>
  );
}
