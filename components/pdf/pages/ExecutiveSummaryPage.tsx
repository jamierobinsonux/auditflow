import { Text, View } from "@react-pdf/renderer";
import { BarChart } from "../layout/BarChart";
import { MetricTable } from "../layout/MetricTable";
import { ReportPage } from "../layout/ReportPage";
import { SectionHeader } from "../layout/SectionHeader";
import { styles } from "../styles";
import type { ReportTheme } from "../theme";
import type { ReportStats } from "../types";

function healthLabel(score: number) {
  if (score >= 90) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 60) return "Fair";
  if (score >= 40) return "Needs attention";
  return "Critical";
}

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

      <View style={{ marginTop: 24, paddingTop: 14, borderTopWidth: 2, borderTopColor: theme.accent }} wrap={false}>
        <Text style={styles.label}>Audit health</Text>
        <View style={{ flexDirection: "row", alignItems: "flex-end", marginTop: 6 }}>
          <Text style={{ fontSize: 32, color: theme.text, fontWeight: "bold" }}>{stats.uxScore}</Text>
          <Text style={{ fontSize: 11, color: theme.mutedText, marginBottom: 6, marginLeft: 6 }}>/ 100</Text>
          <Text style={{ fontSize: 11, color: theme.accent, marginBottom: 6, marginLeft: 16, fontWeight: "bold" }}>
            {healthLabel(stats.uxScore)}
          </Text>
        </View>
        <Text style={[styles.small, { marginTop: 5, maxWidth: 440 }]}>The score starts at 100 and subtracts weighted points for findings by severity: Critical/P0 -18, High/P1 -10, Medium/P2 -5, and Low/P3 -2. It is a directional planning metric, not a replacement for user testing.</Text>
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
              <Text style={[styles.body, { marginTop: 4 }]}>{finding.recommendation || finding.description || "Recommendation details have not been added yet."}</Text>
            </View>
          ))
        )}
      </View>
    </ReportPage>
  );
}
