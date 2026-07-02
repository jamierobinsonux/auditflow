import { Text, View } from "@react-pdf/renderer";
import { BarChart } from "../layout/BarChart";
import { MetricTable } from "../layout/MetricTable";
import { ReportPage } from "../layout/ReportPage";
import { SectionHeader } from "../layout/SectionHeader";
import { styles } from "../styles";
import type { ReportTheme } from "../theme";
import type { ReportStats } from "../types";
import { getFindingRecommendationReportText } from "@/lib/recommendations";

export function ExecutiveSummaryPage({
  project,
  findings,
  stats,
  theme,
  sectionNumber = "01",
}: {
  project: any;
  findings: any[];
  stats: ReportStats;
  theme: ReportTheme;
  sectionNumber?: string;
}) {
  const topFindings = findings.slice(0, 3);
  const highest =
    stats.critical > 0
      ? "critical"
      : stats.high > 0
        ? "high-priority"
        : stats.medium > 0
          ? "medium-priority"
          : "low-priority";

  return (
    <ReportPage theme={theme} section="Executive Summary">
      <SectionHeader number={sectionNumber} title="Executive Summary" theme={theme} />

      <Text style={styles.lead}>
        This audit reviewed {project.name || "the product experience"} and identified {stats.totalFindings} usability {stats.totalFindings === 1 ? "finding" : "findings"} across {stats.journeys} {stats.journeys === 1 ? "journey" : "journeys"}. The most important next step is to address the {highest} issues that create friction, uncertainty, or risk in the core workflow.
      </Text>

      <View
        style={{
          marginTop: 24,
          paddingTop: 14,
          borderTopWidth: 2,
          borderTopColor: theme.accent,
        }}
        wrap={false}
      >
        <Text style={styles.label}>Report summary</Text>
        <View style={{ marginTop: 10, flexDirection: "row", gap: 28 }}>
          <SummaryMetric label="Findings" value={stats.totalFindings} theme={theme} />
          <SummaryMetric label="Journeys" value={stats.journeys} theme={theme} />
          <SummaryMetric label="Evidence" value={stats.evidence} theme={theme} />
          <SummaryMetric label="Quick wins" value={stats.quickWins} theme={theme} />
        </View>
        <Text style={[styles.small, { marginTop: 12, maxWidth: 460 }]}>
          This report summarizes the key usability issues, supporting evidence, and recommended actions identified during the audit.
        </Text>
      </View>

      <View style={{ marginTop: 26, flexDirection: "row", gap: 32 }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.h2}>Audit snapshot</Text>
          <MetricTable
            theme={theme}
            rows={[
              { label: "Findings", value: stats.totalFindings },
              { label: "Journeys reviewed", value: stats.journeys },
              { label: "Critical issues", value: stats.critical },
              { label: "High-priority issues", value: stats.high },
              { label: "Evidence items", value: stats.evidence },
            ]}
          />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.h2}>Severity distribution</Text>
          <BarChart
            theme={theme}
            rows={[
              { label: "Critical", value: stats.critical },
              { label: "High", value: stats.high },
              { label: "Medium", value: stats.medium },
              { label: "Low", value: stats.low },
            ]}
          />
        </View>
      </View>

      <View style={styles.sectionBlock} minPresenceAhead={100}>
        <Text style={styles.h2}>Key observations</Text>
        <Text style={[styles.body, { marginTop: 8 }]}>The recommendations in this report should be prioritized by impact and effort. The highest-value improvements are the ones that reduce friction in the primary user journey while requiring the least product or engineering complexity.</Text>
      </View>

      <View style={styles.sectionBlock} minPresenceAhead={150}>
        <Text style={styles.h2}>Priority actions</Text>
        {topFindings.length === 0 ? (
          <Text style={[styles.body, { marginTop: 8 }]}>No findings have been added yet.</Text>
        ) : (
          topFindings.map((finding, index) => (
            <View
              key={finding.id || index}
              style={{ paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.border }}
              wrap={false}
            >
              <Text style={{ fontSize: 8.4, color: theme.accent, marginBottom: 4 }}>Priority {index + 1}</Text>
              <Text style={styles.h3}>{finding.title || "Untitled finding"}</Text>
              <Text style={[styles.body, { marginTop: 4 }]}>{getFindingRecommendationReportText(finding) || finding.description || "Recommendation details have not been added yet."}</Text>
            </View>
          ))
        )}
      </View>
    </ReportPage>
  );
}
function SummaryMetric({
  label,
  value,
  theme,
}: {
  label: string;
  value: number;
  theme: ReportTheme;
}) {
  return (
    <View style={{ minWidth: 72 }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", color: theme.text }}>
        {value}
      </Text>
      <Text style={[styles.small, { marginTop: 3, color: theme.mutedText }]}>
        {label}
      </Text>
    </View>
  );
}
