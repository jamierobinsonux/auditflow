import { Image, Page, Text, View } from "@react-pdf/renderer";
import { styles } from "../styles";
import type { ReportTheme } from "../theme";

function coverTitleSize(title: string) {
  if (title.length > 58) return 28;
  if (title.length > 42) return 30;
  if (title.length > 30) return 32;
  return 34;
}

export function CoverPage({ project, theme }: { project: any; theme: ReportTheme }) {
  const generatedAt = new Date();
  const title = project.name || "UX Audit";

  return (
    <Page size="A4" style={styles.coverPage}>
      <View style={{ width: 48, height: 3, backgroundColor: theme.accent, marginBottom: 42 }} />

      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {theme.logoUrl && (
            <Image
              src={theme.logoUrl}
              style={{ width: 26, height: 26, objectFit: "contain", marginRight: 10 }}
            />
          )}
          <Text style={{ fontSize: 10.5, color: theme.mutedText }}>{theme.brandName}</Text>
        </View>
        <Text style={[styles.label, { color: theme.accent }]}>UX Audit Report</Text>
      </View>

      <View style={{ marginTop: 104, maxWidth: 470 }}>
        <Text
          style={{
            fontSize: coverTitleSize(title),
            lineHeight: 1.08,
            color: theme.text,
            fontWeight: "bold",
          }}
        >
          {title}
        </Text>
        <Text style={[styles.lead, { marginTop: 20, maxWidth: 420 }]}>A professional review of usability issues, journey friction, and prioritized recommendations for improving the product experience.</Text>
      </View>

      <View style={{ marginTop: "auto", borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 16 }}>
        <Meta label="Client" value={project.client_name || "-"} />
        <Meta label="Audit type" value={project.audit_type || "UX Audit"} />
        <Meta label="Prepared by" value={theme.preparedBy} />
        <Meta label="Generated" value={generatedAt.toLocaleDateString()} />
      </View>
    </Page>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flexDirection: "row", paddingVertical: 5 }} wrap={false}>
      <Text style={{ width: 100, fontSize: 8.2, color: "#64748B", textTransform: "uppercase", letterSpacing: 1 }}>{label}</Text>
      <Text style={{ fontSize: 10.2, color: "#0F172A" }}>{value}</Text>
    </View>
  );
}
