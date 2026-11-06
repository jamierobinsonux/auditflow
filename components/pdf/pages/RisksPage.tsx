import { Text, View } from "@react-pdf/renderer";
import { BarChart } from "../layout/BarChart";
import { ReportPage } from "../layout/ReportPage";
import { SectionHeader } from "../layout/SectionHeader";
import { styles } from "../styles";
import type { ReportTheme } from "../theme";
import { getFindingRecommendationReportText } from "@/lib/recommendations";

function severityLabel(value: unknown) {
  const severity = String(value || "").toLowerCase();
  if (severity === "p0" || severity === "critical") return "Critical";
  if (severity === "p1" || severity === "high") return "High";
  if (severity === "p2" || severity === "medium") return "Medium";
  if (severity === "p3" || severity === "low") return "Low";
  return value ? String(value) : "Unrated";
}

function riskReason(finding: any) {
  const title = String(finding.title || "this issue").toLowerCase();
  const text = `${finding.title || ""} ${finding.description || ""} ${getFindingRecommendationReportText(finding) || ""}`.toLowerCase();
  if (text.includes("checkout") || text.includes("payment") || text.includes("purchase")) {
    return "Could reduce conversion or prevent users from completing a core task.";
  }
  if (text.includes("error") || text.includes("validation") || text.includes("form")) {
    return "May make recovery harder and reduce user confidence during completion.";
  }
  if (text.includes("navigation") || text.includes("find") || text.includes("menu")) {
    return "May make key paths harder to discover or increase time on task.";
  }
  return `May create avoidable friction around ${title}.`;
}

export function RisksPage({ findings, journeys, theme, sectionNumber }: { findings: any[]; journeys: any[]; theme: ReportTheme; sectionNumber: string }) {
  const topRisks = findings.slice(0, 5);
  const journeyRows = journeys.map((journey) => ({
    label: journey.name || "Unnamed journey",
    value: findings.filter((finding) => finding.journey_id === journey.id).length,
  })).filter((row) => row.value > 0).slice(0, 6);

  return (
    <ReportPage theme={theme} section="Risk Analysis">
      <SectionHeader
        number={sectionNumber}
        title="Top Risks"
        kicker="A concise view of the issues most likely to affect task completion, user confidence, or conversion."
        theme={theme}
      />

      {topRisks.length === 0 ? (
        <Text style={styles.body}>No findings have been added yet.</Text>
      ) : (
        <View style={{ marginTop: 8 }}>
          {topRisks.map((finding, index) => {
            const journey = journeys.find((item) => item.id === finding.journey_id);
            return (
              <View key={finding.id || index} style={{ paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: theme.border }} wrap={false}>
                <View style={{ flexDirection: "row", gap: 16 }}>
                  <Text style={{ width: 28, fontSize: 16, color: theme.accent, fontWeight: "bold" }}>{index + 1}</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.h3}>{finding.title || "Untitled finding"}</Text>
                    <Text style={[styles.small, { marginTop: 4 }]}>
                      {severityLabel(finding.severity)} severity{journey?.name ? ` · ${journey.name}` : ""}
                    </Text>
                    <Text style={[styles.body, { marginTop: 7 }]}>{riskReason(finding)}</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      )}

      {journeyRows.length > 0 && (
        <View style={styles.sectionBlock} minPresenceAhead={130}>
          <Text style={styles.h2}>Findings by journey</Text>
          <BarChart rows={journeyRows} theme={theme} />
        </View>
      )}
    </ReportPage>
  );
}
