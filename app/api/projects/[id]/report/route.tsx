import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  renderToStream,
} from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!project) {
    return Response.json({ error: "Project not found" }, { status: 404 });
  }

  const { data: findings } = await supabase
    .from("findings")
    .select("*")
    .eq("project_id", id)
    .eq("user_id", user.id)
    .order("severity", { ascending: true });

  const findingIds = (findings ?? []).map((finding) => finding.id);

  const { data: images } = findingIds.length
    ? await supabase
        .from("finding_images")
        .select("*")
        .in("finding_id", findingIds)
        .eq("user_id", user.id)
        .order("created_at", { ascending: true })
    : { data: [] };

  const stream = await renderToStream(
    <AuditReportPDF
      project={project}
      findings={findings ?? []}
      images={images ?? []}
    />
  );

  return new Response(stream as unknown as ReadableStream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${safeFileName(
        project.name
      )}-audit-report.pdf"`,
    },
  });
}

function AuditReportPDF({
  project,
  findings,
  images,
}: {
  project: any;
  findings: any[];
  images: any[];
}) {
  const groupedFindings = ["P0", "P1", "P2", "P3"].map((severity) => ({
    severity,
    findings: findings.filter((finding) => finding.severity === severity),
  }));

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.cover}>
          <Text style={styles.logo}>AuditFlow</Text>
          <Text style={styles.title}>{project.name}</Text>
          <Text style={styles.subtitle}>UX Audit Report</Text>

          <View style={styles.metaBox}>
            <Text style={styles.meta}>Client: {project.client_name || "—"}</Text>
            <Text style={styles.meta}>Audit Type: {project.audit_type || "—"}</Text>
            <Text style={styles.meta}>Status: {project.status || "—"}</Text>
            <Text style={styles.meta}>
              Generated: {new Date().toLocaleDateString()}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Executive Summary</Text>
          <Text style={styles.body}>
            This audit reviews the user experience of {project.name}, focusing
            on usability friction, conversion opportunities, accessibility
            concerns, and actionable product improvements.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Findings Summary</Text>

          <View style={styles.summaryGrid}>
            <SummaryItem label="Total" value={findings.length} />
            <SummaryItem
              label="P0 Critical"
              value={findings.filter((f) => f.severity === "P0").length}
            />
            <SummaryItem
              label="P1 High"
              value={findings.filter((f) => f.severity === "P1").length}
            />
            <SummaryItem
              label="P2 Medium"
              value={findings.filter((f) => f.severity === "P2").length}
            />
            <SummaryItem
              label="P3 Low"
              value={findings.filter((f) => f.severity === "P3").length}
            />
          </View>
        </View>

        {groupedFindings.map((group) => {
          if (group.findings.length === 0) return null;

          return (
            <View key={group.severity} style={styles.section}>
              <Text style={styles.sectionTitle}>{group.severity} Findings</Text>

              {group.findings.map((finding, index) => {
                const findingImages = images.filter(
                  (image) => image.finding_id === finding.id
                );

                return (
                  <View key={finding.id} style={styles.finding} wrap={false}>
                    <View style={styles.findingHeader}>
                      <Text style={styles.findingTitle}>
                        {index + 1}. {finding.title}
                      </Text>

                      <Text style={styles.badge}>{finding.severity}</Text>
                    </View>

                    <Text style={styles.label}>Status</Text>
                    <Text style={styles.body}>{finding.status || "Open"}</Text>

                    <Text style={styles.label}>Description</Text>
                    <Text style={styles.body}>
                      {finding.description || "No description added."}
                    </Text>

                    <Text style={styles.label}>Recommendation</Text>
                    <Text style={styles.body}>
                      {finding.recommendation || "No recommendation added."}
                    </Text>

                    {finding.impact && (
                      <>
                        <Text style={styles.label}>Impact</Text>
                        <Text style={styles.body}>{finding.impact}</Text>
                      </>
                    )}

                    {finding.effort && (
                      <>
                        <Text style={styles.label}>Effort</Text>
                        <Text style={styles.body}>{finding.effort}</Text>
                      </>
                    )}

                    {findingImages.length > 0 && (
                      <View style={styles.evidenceSection}>
                        <Text style={styles.label}>Evidence</Text>

                        {findingImages.map((image) => (
                          <View key={image.id} style={styles.imageBlock}>
                            <Image src={image.image_url} style={styles.image} />

                            {image.caption && (
                              <Text style={styles.caption}>{image.caption}</Text>
                            )}
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          );
        })}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          <Text style={styles.body}>
            Prioritize P0 and P1 issues first, especially findings that block
            task completion, reduce trust, or create significant friction in the
            primary user journey. P2 and P3 issues should be addressed in later
            design iterations or bundled into upcoming product improvements.
          </Text>
        </View>
      </Page>
    </Document>
  );
}

function SummaryItem({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.summaryItem}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function safeFileName(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#0F172A",
    backgroundColor: "#FFFFFF",
  },
  cover: {
    marginBottom: 32,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  logo: {
    fontSize: 14,
    color: "#7C3AED",
    marginBottom: 24,
    fontWeight: "bold",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 20,
  },
  metaBox: {
    gap: 4,
  },
  meta: {
    fontSize: 10,
    color: "#475569",
    marginBottom: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 10,
  },
  body: {
    fontSize: 10,
    lineHeight: 1.5,
    color: "#475569",
    marginBottom: 8,
  },
  summaryGrid: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  summaryItem: {
    width: "18%",
    padding: 10,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F172A",
  },
  summaryLabel: {
    marginTop: 4,
    fontSize: 8,
    color: "#64748B",
  },
  finding: {
    marginBottom: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
  },
  findingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  findingTitle: {
    fontSize: 14,
    fontWeight: "bold",
    maxWidth: "80%",
  },
  badge: {
    fontSize: 9,
    color: "#7C3AED",
    backgroundColor: "#EDE9FE",
    padding: 6,
    borderRadius: 4,
  },
  label: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#0F172A",
    marginTop: 8,
    marginBottom: 3,
  },
  evidenceSection: {
    marginTop: 12,
  },
  imageBlock: {
    marginTop: 10,
  },
  image: {
    width: "100%",
    maxHeight: 260,
    objectFit: "contain",
  },
  caption: {
    marginTop: 6,
    fontSize: 9,
    color: "#64748B",
    lineHeight: 1.4,
  },
});