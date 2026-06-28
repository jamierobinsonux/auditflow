import { Text, View } from "@react-pdf/renderer";
import { BarChart } from "../layout/BarChart";
import { MetricTable } from "../layout/MetricTable";
import { ReportPage } from "../layout/ReportPage";
import { SectionHeader } from "../layout/SectionHeader";
import { styles } from "../styles";
import type { ReportTheme } from "../theme";

export function JourneyAnalysisPage({ journeys, steps, findings, theme, sectionNumber = "04" }: { journeys: any[]; steps: any[]; findings: any[]; theme: ReportTheme; sectionNumber?: string }) {
  const rows = journeys.map((journey) => ({ label: journey.name || "Untitled journey", value: findings.filter((finding) => finding.journey_id === journey.id).length }));
  return (
    <ReportPage theme={theme} section="Journey Analysis">
      <SectionHeader number={sectionNumber} title="Journey Analysis" kicker="Journey analysis shows where findings cluster across the user experience and helps teams decide where to focus first." theme={theme} />
      {journeys.length === 0 ? <Text style={styles.body}>No journeys have been added yet.</Text> : (
        <>
          <View style={{ marginBottom: 28 }}>
            <Text style={styles.h2}>Findings by journey</Text>
            <BarChart rows={rows} theme={theme} />
          </View>
          {journeys.map((journey, index) => {
            const journeySteps = steps.filter((step) => step.journey_id === journey.id);
            const journeyFindings = findings.filter((finding) => finding.journey_id === journey.id);
            return (
              <View key={journey.id || index} style={{ marginBottom: 30 }} minPresenceAhead={150}>
                <Text style={{ fontSize: 9, color: theme.accent, letterSpacing: 1.2, marginBottom: 8 }}>Journey {String(index + 1).padStart(2, "0")}</Text>
                <Text style={styles.h2}>{journey.name || "Untitled journey"}</Text>
                {journey.description && <Text style={[styles.body, { marginTop: 8 }]}>{journey.description}</Text>}
                <MetricTable theme={theme} rows={[{ label: "Steps", value: journeySteps.length }, { label: "Associated findings", value: journeyFindings.length }, { label: "Highest severity", value: getHighestSeverity(journeyFindings) }]} />
                {journeySteps.length > 0 && (
                  <View style={{ marginTop: 14 }}>
                    <Text style={styles.h3}>Journey steps</Text>
                    {journeySteps.map((step, stepIndex) => (
                      <View key={step.id || stepIndex} style={{ flexDirection: "row", paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.border }} wrap={false}>
                        <Text style={{ width: 28, fontSize: 9, color: theme.accent }}>{String(stepIndex + 1).padStart(2, "0")}</Text>
                        <Text style={{ fontSize: 10, color: theme.mutedText }}>{step.name || step.title || "Untitled step"}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </>
      )}
    </ReportPage>
  );
}

function getHighestSeverity(findings: any[]) {
  const order = ["P0", "P1", "P2", "P3"];
  const sorted = [...findings].sort((a, b) => {
    const aIndex = order.indexOf(a.severity);
    const bIndex = order.indexOf(b.severity);
    return (aIndex === -1 ? 99 : aIndex) - (bIndex === -1 ? 99 : bIndex);
  });
  return sorted[0]?.severity || "-";
}
