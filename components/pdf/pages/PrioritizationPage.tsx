import { Text, View } from "@react-pdf/renderer";
import { ReportPage } from "../layout/ReportPage";
import { SectionHeader } from "../layout/SectionHeader";
import { styles } from "../styles";
import type { ReportTheme } from "../theme";

const scoreMap: Record<string, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 3,
  p0: 3,
  p1: 3,
  p2: 2,
  p3: 1,
};

function score(value: unknown, fallback = 2) {
  const key = String(value || "").toLowerCase();
  return scoreMap[key] ?? fallback;
}

function effortLabel(value: unknown) {
  const normalized = String(value || "").toLowerCase();
  if (normalized === "low") return "Low";
  if (normalized === "medium") return "Medium";
  if (normalized === "high") return "High";
  return "Medium";
}

function priorityLabel(finding: any) {
  const impact = score(finding.impact || finding.severity, 2);
  const effort = score(finding.effort, 2);
  if (impact >= 3 && effort <= 1) return "Quick win";
  if (impact >= 3) return "Strategic priority";
  if (impact === 2 && effort <= 2) return "Near-term improvement";
  return "Backlog candidate";
}

export function PrioritizationPage({ findings, theme, sectionNumber }: { findings: any[]; theme: ReportTheme; sectionNumber: string }) {
  const rows = findings.slice(0, 8).map((finding, index) => ({
    id: finding.id || index,
    title: finding.title || "Untitled finding",
    impact: String(finding.impact || finding.severity || "Medium"),
    effort: effortLabel(finding.effort),
    priority: priorityLabel(finding),
  }));

  return (
    <ReportPage theme={theme} section="Prioritization">
      <SectionHeader
        number={sectionNumber}
        title="Prioritization"
        kicker="Recommended sequencing based on likely user impact and implementation effort."
        theme={theme}
      />

      <Text style={styles.lead}>
        The most valuable improvements are the ones that reduce high-impact friction without requiring large product or engineering investment. Use this page as a starting point for sprint planning and stakeholder alignment.
      </Text>

      <View style={styles.sectionBlock} minPresenceAhead={180}>
        <Text style={styles.h2}>Priority matrix</Text>
        <View style={{ marginTop: 14, borderTopWidth: 1, borderTopColor: theme.border }}>
          <View style={{ flexDirection: "row", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.border }} wrap={false}>
            <Text style={{ width: "42%", fontSize: 8, color: theme.faintText, textTransform: "uppercase", letterSpacing: 1 }}>Finding</Text>
            <Text style={{ width: "16%", fontSize: 8, color: theme.faintText, textTransform: "uppercase", letterSpacing: 1 }}>Impact</Text>
            <Text style={{ width: "16%", fontSize: 8, color: theme.faintText, textTransform: "uppercase", letterSpacing: 1 }}>Effort</Text>
            <Text style={{ width: "26%", fontSize: 8, color: theme.faintText, textTransform: "uppercase", letterSpacing: 1 }}>Recommendation</Text>
          </View>
          {rows.length === 0 ? (
            <Text style={[styles.body, { marginTop: 12 }]}>No findings have been added yet.</Text>
          ) : rows.map((row) => (
            <View key={row.id} style={{ flexDirection: "row", paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: theme.border }} wrap={false}>
              <Text style={{ width: "42%", fontSize: 9.5, color: theme.text, lineHeight: 1.35 }}>{row.title}</Text>
              <Text style={{ width: "16%", fontSize: 9.5, color: theme.mutedText }}>{row.impact}</Text>
              <Text style={{ width: "16%", fontSize: 9.5, color: theme.mutedText }}>{row.effort}</Text>
              <Text style={{ width: "26%", fontSize: 9.5, color: theme.text }}>{row.priority}</Text>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.sectionBlock} minPresenceAhead={120}>
        <Text style={styles.h2}>Suggested roadmap</Text>
        <View style={{ marginTop: 12, flexDirection: "row", gap: 18 }} wrap={false}>
          <RoadmapColumn title="Next 30 days" description="Resolve high-impact, low-effort issues and unblock core task completion." theme={theme} />
          <RoadmapColumn title="Next 60 days" description="Address medium-complexity interaction improvements and journey-level friction." theme={theme} />
          <RoadmapColumn title="Next 90 days" description="Evaluate larger workflow changes and validate improvements through user testing." theme={theme} />
        </View>
      </View>
    </ReportPage>
  );
}

function RoadmapColumn({ title, description, theme }: { title: string; description: string; theme: ReportTheme }) {
  return (
    <View style={{ flex: 1, borderTopWidth: 2, borderTopColor: theme.accent, paddingTop: 10 }}>
      <Text style={styles.h3}>{title}</Text>
      <Text style={[styles.body, { marginTop: 6 }]}>{description}</Text>
    </View>
  );
}
