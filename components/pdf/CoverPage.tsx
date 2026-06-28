import { Image, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { pdfStyles } from "./PdfStyles";
import type { ReportTheme } from "./report-theme";

export function CoverPage({
  project,
  theme,
  generatedAt,
  totalFindings,
}: {
  project: any;
  theme: ReportTheme;
  generatedAt: Date;
  totalFindings: number;
}) {
  return (
    <Page size="A4" style={pdfStyles.coverPage}>
      <View style={[styles.accentBar, { backgroundColor: theme.primaryColor }]} />

      <View style={styles.top}>
        <View style={styles.logoRow}>
          {theme.logoSrc && <Image src={theme.logoSrc} style={styles.logoIcon} />}
          <Text style={[styles.logo, { color: theme.primaryColor }]}>
            {theme.brandName}
          </Text>
        </View>

        <Text style={styles.eyebrow}>UX Audit Report</Text>
      </View>

      <View style={styles.main}>
        <Text style={styles.title}>{project.name}</Text>
        <Text style={styles.subtitle}>
          A client-ready review of usability friction, user journey gaps, and
          prioritized recommendations for improving the product experience.
        </Text>
      </View>

      <View style={styles.metaGrid}>
        <Meta label="Client" value={project.client_name || "—"} />
        <Meta label="Audit Type" value={project.audit_type || "—"} />
        <Meta label="Status" value={project.status || "—"} />
        <Meta label="Findings" value={String(totalFindings)} />
        <Meta label="Generated" value={generatedAt.toLocaleDateString()} />
        <Meta label="Prepared By" value={theme.preparedBy || theme.brandName} />
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>{theme.footerText}</Text>
      </View>
    </Page>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metaItem} wrap={false}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  accentBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 8,
  },
  top: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 118,
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  logoIcon: {
    width: 24,
    height: 24,
    objectFit: "contain",
    marginRight: 8,
  },
  logo: {
    fontSize: 16,
    fontWeight: "bold",
  },
  eyebrow: {
    fontSize: 9,
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 1.6,
  },
  main: {
    marginBottom: 78,
  },
  title: {
    fontSize: 38,
    fontWeight: "bold",
    lineHeight: 1.1,
    maxWidth: 430,
  },
  subtitle: {
    marginTop: 16,
    fontSize: 12.5,
    lineHeight: 1.55,
    color: "#475569",
    maxWidth: 420,
  },
  metaGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  metaItem: {
    width: "48%",
    marginRight: "2%",
    marginBottom: 12,
    padding: 13,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
  },
  metaLabel: {
    fontSize: 7.5,
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.7,
    marginBottom: 4,
  },
  metaValue: {
    fontSize: 10.5,
    fontWeight: "bold",
    color: "#0F172A",
  },
  footer: {
    position: "absolute",
    bottom: 42,
    left: 56,
    right: 56,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 12,
  },
  footerText: {
    fontSize: 8.5,
    color: "#64748B",
  },
});
