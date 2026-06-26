import { Document, Page, Text, View, Image } from "@react-pdf/renderer";
import { CoverPage } from "./CoverPage";
import { SectionTitle } from "./SectionTitle";
import { pdfStyles } from "./PdfStyles";

export function AuditReport({
  project,
  findings,
  journeys,
  steps,
  images,
}: {
  project: any;
  findings: any[];
  journeys: any[];
  steps: any[];
  images: any[];
}) {
  const p0 = findings.filter((f) => f.severity === "P0");
  const p1 = findings.filter((f) => f.severity === "P1");
  const quickWins = findings.filter(
    (f) => f.impact === "High" && f.effort === "Low"
  );
  const unassignedFindings = findings.filter((finding) => !finding.journey_id);

  return (
    <Document>
      <CoverPage project={project} />

      <Page size="A4" style={pdfStyles.page}>
        <SectionTitle eyebrow="01" title="Executive Summary" />

        <Text style={pdfStyles.body}>
          This audit reviews {project.name} across key user experience
          touchpoints, with a focus on identifying friction, prioritizing
          improvements, and translating findings into clear product
          recommendations.
        </Text>

        <View style={{ flexDirection: "row", gap: 12, marginTop: 24 }}>
          <SummaryCard label="Total Findings" value={findings.length} />
          <SummaryCard label="Critical Issues" value={p0.length} />
          <SummaryCard label="High Priority" value={p1.length} />
          <SummaryCard label="Quick Wins" value={quickWins.length} />
        </View>

        <View style={{ marginTop: 36 }}>
          <SectionTitle eyebrow="02" title="Journey Overview" />

          {journeys.length === 0 && (
            <Text style={pdfStyles.body}>No journeys have been added yet.</Text>
          )}

          {journeys.map((journey) => {
            const journeySteps = steps.filter(
              (step) => step.journey_id === journey.id
            );

            const journeyFindings = findings.filter(
              (finding) => finding.journey_id === journey.id
            );

            return (
              <View key={journey.id} style={pdfStyles.mutedCard} wrap={false}>
                <Text style={{ fontSize: 15, fontWeight: "bold" }}>
                  {journey.name}
                </Text>

                {journey.description && (
                  <Text style={[pdfStyles.body, { marginTop: 8 }]}>
                    {journey.description}
                  </Text>
                )}

                <Text style={{ marginTop: 8, fontSize: 9, color: "#7C3AED" }}>
                  {journeySteps.length} steps • {journeyFindings.length} findings
                </Text>
              </View>
            );
          })}

          {unassignedFindings.length > 0 && (
            <View style={pdfStyles.mutedCard} wrap={false}>
              <Text style={{ fontSize: 15, fontWeight: "bold" }}>
                Unassigned Findings
              </Text>
              <Text style={{ marginTop: 8, fontSize: 9, color: "#7C3AED" }}>
                {unassignedFindings.length} findings
              </Text>
            </View>
          )}
        </View>
      </Page>

      <Page size="A4" style={pdfStyles.page}>
        <SectionTitle eyebrow="03" title="Journey-Based Findings" />

        {journeys.map((journey) => {
          const journeySteps = steps.filter(
            (step) => step.journey_id === journey.id
          );

          const journeyFindings = findings.filter(
            (finding) => finding.journey_id === journey.id
          );

          return (
            <View key={journey.id} style={pdfStyles.mutedCard}>
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                {journey.name}
              </Text>

              {journey.description && (
                <Text style={[pdfStyles.body, { marginTop: 10 }]}>
                  {journey.description}
                </Text>
              )}

              {journeySteps.map((step, index) => {
                const stepFindings = journeyFindings.filter(
                  (finding) => finding.journey_step_id === step.id
                );

                return (
                  <View key={step.id} style={pdfStyles.card} wrap={false}>
                    <Text style={{ fontSize: 13, fontWeight: "bold" }}>
                      {index + 1}. {step.title}
                    </Text>

                    {stepFindings.length === 0 && (
                      <Text style={[pdfStyles.body, { marginTop: 10 }]}>
                        No findings assigned to this step.
                      </Text>
                    )}

                    {stepFindings.map((finding) => (
                      <FindingCard
                        key={finding.id}
                        finding={finding}
                        hasImages={
                          images.filter(
                            (image) => image.finding_id === finding.id
                          ).length > 0
                        }
                      />
                    ))}
                  </View>
                );
              })}

              {journeyFindings.filter((finding) => !finding.journey_step_id)
                .length > 0 && (
                <View style={pdfStyles.card}>
                  <Text style={{ fontSize: 13, fontWeight: "bold" }}>
                    Unassigned to step
                  </Text>

                  {journeyFindings
                    .filter((finding) => !finding.journey_step_id)
                    .map((finding) => (
                      <FindingCard
                        key={finding.id}
                        finding={finding}
                        hasImages={
                          images.filter(
                            (image) => image.finding_id === finding.id
                          ).length > 0
                        }
                      />
                    ))}
                </View>
              )}
            </View>
          );
        })}

        {unassignedFindings.length > 0 && (
          <View style={pdfStyles.mutedCard}>
            <Text style={{ fontSize: 18, fontWeight: "bold" }}>
              Unassigned Findings
            </Text>

            {unassignedFindings.map((finding) => (
              <FindingCard
                key={finding.id}
                finding={finding}
                hasImages={
                  images.filter((image) => image.finding_id === finding.id)
                    .length > 0
                }
              />
            ))}
          </View>
        )}
      </Page>

      <Page size="A4" style={pdfStyles.page}>
        <SectionTitle eyebrow="04" title="Recommendations Summary" />

        {["P0", "P1", "P2", "P3"].map((severity) => {
          const severityFindings = findings.filter(
            (finding) => finding.severity === severity
          );

          if (severityFindings.length === 0) return null;

          return (
            <View key={severity} style={{ marginBottom: 28 }}>
              <Text style={{ fontSize: 15, fontWeight: "bold" }}>
                {severity} Recommendations
              </Text>

              {severityFindings.map((finding, index) => (
                <View key={finding.id} style={pdfStyles.card} wrap={false}>
                  <Text style={{ fontSize: 11, fontWeight: "bold" }}>
                    {index + 1}. {finding.title}
                  </Text>
                  <Text style={[pdfStyles.body, { marginTop: 10 }]}>
                    {finding.recommendation || "No recommendation added."}
                  </Text>
                </View>
              ))}
            </View>
          );
        })}

        <SectionTitle eyebrow="05" title="Conclusion" />

        <Text style={pdfStyles.body}>
          The findings in this report should guide the next design iteration,
          roadmap discussion, or stakeholder review. Addressing the highest
          severity and highest impact issues first will create the clearest
          improvement in user experience and product performance.
        </Text>
      </Page>

      {images.length > 0 && (
        <Page size="A4" style={pdfStyles.page}>
          <SectionTitle eyebrow="06" title="Evidence Appendix" />

          {images.map((image, index) => {
            const finding = findings.find((f) => f.id === image.finding_id);

            return (
              <View key={image.id} style={pdfStyles.card} wrap={false}>
                <Text style={{ fontSize: 12, fontWeight: "bold" }}>
                  Evidence {index + 1}
                </Text>

                {finding && (
                  <Text style={{ marginTop: 8, fontSize: 9, color: "#64748B" }}>
                    Related finding: {finding.title}
                  </Text>
                )}

                <View style={{ marginTop: 16 }}>
                  <Image src={image.image_url} style={pdfStyles.image} />
                </View>

                {image.caption && (
                  <Text style={pdfStyles.caption}>{image.caption}</Text>
                )}
              </View>
            );
          })}
        </Page>
      )}
    </Document>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <View style={[pdfStyles.mutedCard, { flex: 1, padding: 24 }]}>
      <Text style={{ fontSize: 30, fontWeight: "bold" }}>{value}</Text>
      <Text style={{ marginTop: 8, fontSize: 8, color: "#64748B" }}>
        {label}
      </Text>
    </View>
  );
}

function FindingCard({
  finding,
  hasImages,
}: {
  finding: any;
  hasImages: boolean;
}) {
  return (
    <View style={[pdfStyles.card, { marginTop: 18 }]} wrap={false}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 12,
        }}
        wrap={false}
      >
        <Text style={{ fontSize: 14, fontWeight: "bold", maxWidth: "75%" }}>
          {finding.title}
        </Text>
        <Text style={pdfStyles.badge}>{finding.severity}</Text>
      </View>

      <Text style={pdfStyles.label}>Status</Text>
      <Text style={pdfStyles.body}>{finding.status || "Open"}</Text>

      <Text style={pdfStyles.label}>Description</Text>
      <Text style={pdfStyles.body}>
        {finding.description || "No description added."}
      </Text>

      <Text style={pdfStyles.label}>Recommendation</Text>
      <Text style={pdfStyles.body}>
        {finding.recommendation || "No recommendation added."}
      </Text>

      {(finding.impact || finding.effort) && (
        <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
          <Text style={pdfStyles.badge}>Impact: {finding.impact || "—"}</Text>
          <Text style={pdfStyles.badge}>Effort: {finding.effort || "—"}</Text>
        </View>
      )}

      {hasImages && (
        <>
          <View style={pdfStyles.divider} />
          <Text style={{ fontSize: 9, color: "#64748B" }}>
            Evidence screenshots are included in the appendix.
          </Text>
        </>
      )}
    </View>
  );
}