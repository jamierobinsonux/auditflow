import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  pdf,
} from "@react-pdf/renderer";
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  const { data: findings } = await supabase
    .from("findings")
    .select("*")
    .eq("project_id", id)
    .order("created_at", { ascending: false });

  const findingIds = (findings ?? []).map((finding) => finding.id);

  const { data: images } = await supabase
    .from("finding_images")
    .select("*")
    .in("finding_id", findingIds.length ? findingIds : ["00000000-0000-0000-0000-000000000000"]);

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  const blob = await pdf(
    <AuditReportPDF
      project={project}
      findings={findings ?? []}
      images={images ?? []}
    />
  ).toBlob();

  return new NextResponse(blob, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${project.name}-audit-report.pdf"`,
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
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.cover}>
          <Text style={styles.logo}>AuditFlow</Text>
          <Text style={styles.title}>{project.name}</Text>
          <Text style={styles.subtitle}>UX Audit Report</Text>

          <View style={styles.metaGrid}>
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
            on usability friction, conversion opportunities, and actionable UX
            improvements.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Findings Summary</Text>
          <Text style={styles.body}>Total findings: {findings.length}</Text>
          <Text style={styles.body}>
            P0: {findings.filter((f) => f.severity === "P0").length} | P1:{" "}
            {findings.filter((f) => f.severity === "P1").length} | P2:{" "}
            {findings.filter((f) => f.severity === "P2").length} | P3:{" "}
            {findings.filter((f) => f.severity === "P3").length}
          </Text>
        </View>

        {findings.map((finding, index) => {
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
              <Text style={styles.body}>{finding.status}</Text>

              <Text style={styles.label}>Description</Text>
              <Text style={styles.body}>
                {finding.description || "No description added."}
              </Text>

              <Text style={styles.label}>Recommendation</Text>
              <Text style={styles.body}>
                {finding.recommendation || "No recommendation added."}
              </Text>

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
      </Page>
    </Document>
  );
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
  metaGrid: {
    gap: 4,
  },
  meta: {
    fontSize: 10,
    color: "#475569",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  body: {
    fontSize: 10,
    lineHeight: 1.5,
    color: "#475569",
    marginBottom: 8,
  },
  finding: {
    marginBottom: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
  },
  findingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    borderRadius: 6,
  },
  caption: {
    marginTop: 6,
    fontSize: 9,
    color: "#64748B",
    lineHeight: 1.4,
  },
});