import { Text, View } from "@react-pdf/renderer";
import { ReportPage } from "../layout/ReportPage";
import { SectionHeader } from "../layout/SectionHeader";
import { styles } from "../styles";
import type { ReportTheme } from "../theme";

export function RecommendationsPage({ findings, theme, sectionNumber = "05" }: { findings: any[]; theme: ReportTheme; sectionNumber?: string }) {
  const recommended = findings.filter((finding) => finding.recommendation || finding.title).slice(0, 8);
  return (
    <ReportPage theme={theme} section="Recommendations">
      <SectionHeader number={sectionNumber} title="Recommendations" kicker="The recommendations below translate audit findings into product actions. Prioritize the first items before moving into lower-severity cleanup work." theme={theme} />
      {recommended.length === 0 ? <Text style={styles.body}>No recommendations have been added yet.</Text> : recommended.map((finding, index) => (
        <View key={finding.id || index} style={{ paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: theme.border }} minPresenceAhead={90}>
          <View style={{ flexDirection: "row", justifyContent: "space-between" }} wrap={false}>
            <Text style={{ fontSize: 9, color: theme.accent }}>Priority {index + 1}</Text>
            <Text style={{ fontSize: 9, color: theme.faintText }}>{finding.severity || "-"}</Text>
          </View>
          <Text style={[styles.h3, { marginTop: 7 }]}>{finding.title || "Untitled recommendation"}</Text>
          <Text style={[styles.body, { marginTop: 6 }]}>{finding.recommendation || finding.description || "Recommendation details have not been added yet."}</Text>
          <View style={{ flexDirection: "row", gap: 24, marginTop: 8 }} wrap={false}>
            <Meta label="Impact" value={finding.impact || "-"} />
            <Meta label="Effort" value={finding.effort || "-"} />
            <Meta label="Status" value={finding.status || "Open"} />
          </View>
        </View>
      ))}
    </ReportPage>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <Text style={{ fontSize: 8.5, color: "#64748B" }}>{label}: <Text style={{ color: "#0F172A" }}>{value}</Text></Text>
  );
}
