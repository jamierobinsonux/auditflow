import path from "path";
import { Image, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { pdfStyles } from "./PdfStyles";

export function CoverPage({ project }: { project: any }) {
  const logoPath = path.join(process.cwd(), "public", "AFLogo.png");

  return (
    <Page size="A4" style={pdfStyles.coverPage}>
      <View style={styles.top}>
        <View style={styles.logoRow}>
          <Image src={logoPath} style={styles.logoIcon} />
          <Text style={styles.logo}>AuditFlow</Text>
        </View>

        <Text style={styles.eyebrow}>UX Audit Report</Text>
      </View>

      <View style={styles.main}>
        <Text style={styles.title}>{project.name}</Text>
        <Text style={styles.subtitle}>
          A structured review of usability friction, user journey gaps, and
          prioritized product recommendations.
        </Text>
      </View>

      <View style={styles.metaGrid}>
        <Meta label="Client" value={project.client_name || "—"} />
        <Meta label="Audit Type" value={project.audit_type || "—"} />
        <Meta label="Status" value={project.status || "—"} />
        <Meta label="Generated" value={new Date().toLocaleDateString()} />
      </View>
    </Page>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaItem}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 120,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  logoIcon: {
    width: 22,
    height: 22,
  },
  logo: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#7C3AED",
  },
  eyebrow: {
    fontSize: 10,
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  main: {
    marginBottom: 96,
  },
  title: {
    fontSize: 38,
    fontWeight: "bold",
    lineHeight: 1.1,
    maxWidth: 430,
  },
  subtitle: {
    marginTop: 16,
    fontSize: 13,
    lineHeight: 1.6,
    color: "#475569",
    maxWidth: 420,
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  metaItem: {
    width: "47%",
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
  },
  metaLabel: {
    fontSize: 8,
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#0F172A",
  },
});