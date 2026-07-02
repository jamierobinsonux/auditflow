import { Text, View } from "@react-pdf/renderer";
import { Figure } from "../layout/Figure";
import { ReportPage } from "../layout/ReportPage";
import { SectionHeader } from "../layout/SectionHeader";
import { TextSection } from "../layout/TextSection";
import { styles } from "../styles";
import type { ReportTheme } from "../theme";

export function FindingsPage({ findings, journeys, images, annotations, theme, sectionNumber = "03" }: { findings: any[]; journeys: any[]; images: any[]; annotations: any[]; theme: ReportTheme; sectionNumber?: string }) {
  let figureIndex = 1;
  return (
    <ReportPage theme={theme} section="Findings">
      <SectionHeader number={sectionNumber} title="Findings" kicker="Each finding is written as a concise report entry with context, impact, recommendation, and supporting evidence when available." theme={theme} />
      {findings.length === 0 && <Text style={styles.body}>No findings have been added yet.</Text>}
      {findings.map((finding, index) => {
        const journey = journeys.find((j) => j.id === finding.journey_id);
        const findingImages = images.filter((image) => image.finding_id === finding.id);
        return (
          <View key={finding.id || index} style={{ marginBottom: 34 }} minPresenceAhead={240}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }} wrap={false}>
              <View style={{ maxWidth: "78%" }}>
                <Text style={{ fontSize: 9, color: theme.accent, letterSpacing: 1.2, marginBottom: 8 }}>Finding {String(index + 1).padStart(2, "0")}</Text>
                <Text style={styles.h2}>{finding.title || "Untitled finding"}</Text>
              </View>
              <Text style={{ fontSize: 8, color: theme.accent, borderWidth: 1, borderColor: theme.border, paddingVertical: 5, paddingHorizontal: 8 }}>{finding.severity || "-"}</Text>
            </View>
            <View style={{ flexDirection: "row", gap: 18, marginTop: 12, marginBottom: 18 }} wrap={false}>
              <Meta label="Status" value={finding.status || "Open"} theme={theme} />
              <Meta label="Journey" value={journey?.name || "Unassigned"} theme={theme} />
              <Meta label="Impact" value={finding.impact || "-"} theme={theme} />
              <Meta label="Effort" value={finding.effort || "-"} theme={theme} />
            </View>
            <TextSection title="Observation">{finding.description || "No observation has been added yet."}</TextSection>
            <TextSection title="Impact">{finding.impact ? `This finding is marked as ${finding.impact.toLowerCase()} impact and should be considered in prioritization.` : "This issue may create friction, uncertainty, or unnecessary effort for users."}</TextSection>
            {finding.linked_recommendation_title && (
              <Text style={[styles.small, { marginBottom: 6 }]}>Linked recommendation: {finding.linked_recommendation_title}</Text>
            )}
            <TextSection title="Recommendation">{finding.recommendation || "No recommendation has been added yet."}</TextSection>
            {findingImages.length > 0 && (
              <View style={{ marginTop: 14 }} minPresenceAhead={220}>
                <Text style={styles.h3}>Evidence</Text>
                {findingImages.map((image) => {
                  const notes = annotations.filter((annotation) => annotation.evidence_image_id === image.id || annotation.image_id === image.id);
                  const currentFigure = figureIndex++;
                  return (
                    <View key={image.id || currentFigure} wrap={false}>
                      <Figure
                        src={image.image_url || image.url || image.public_url}
                        caption={image.evidence_name || image.caption || finding.title}
                        index={currentFigure}
                        theme={theme}
                        annotations={notes}
                      />
                    </View>
                  );
                })}
              </View>
            )}
            <View style={{ marginTop: 22, borderTopWidth: 1, borderTopColor: theme.border }} />
          </View>
        );
      })}
    </ReportPage>
  );
}

function Meta({ label, value, theme }: { label: string; value: string; theme: ReportTheme }) {
  return (
    <View style={{ minWidth: 82 }} wrap={false}>
      <Text style={[styles.label, { fontSize: 7, color: theme.faintText }]}>{label}</Text>
      <Text style={{ fontSize: 9.5, color: theme.text, marginTop: 4 }}>{value}</Text>
    </View>
  );
}
