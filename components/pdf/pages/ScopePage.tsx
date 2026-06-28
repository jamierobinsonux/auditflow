import { Text, View } from "@react-pdf/renderer";
import { MetricTable } from "../layout/MetricTable";
import { ReportPage } from "../layout/ReportPage";
import { SectionHeader } from "../layout/SectionHeader";
import { styles } from "../styles";
import type { ReportTheme } from "../theme";

export function ScopePage({ project, theme, sectionNumber = "02" }: { project: any; theme: ReportTheme; sectionNumber?: string }) {
  return (
    <ReportPage theme={theme} section="Scope & Methodology">
      <SectionHeader number={sectionNumber} title="Scope & Methodology" kicker="This section documents what was reviewed and how the audit findings should be interpreted." theme={theme} />
      <View style={{ flexDirection: "row", gap: 34 }}>
        <View style={{ flex: 1 }}>
          <Text style={styles.h2}>Project details</Text>
          <MetricTable theme={theme} rows={[{ label: "Project", value: project.name || "-" }, { label: "Client", value: project.client_name || "-" }, { label: "Audit type", value: project.audit_type || "UX Audit" }, { label: "Status", value: project.status || "-" }]} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.h2}>Methodology</Text>
          <Text style={[styles.body, { marginTop: 10 }]}>Findings were reviewed through a structured UX audit lens, focusing on clarity, friction, user confidence, task completion, accessibility considerations, and consistency across the experience.</Text>
        </View>
      </View>
      {project.description && (
        <View style={styles.sectionBlock}>
          <Text style={styles.h2}>Project context</Text>
          <Text style={[styles.body, { marginTop: 10 }]}>{project.description}</Text>
        </View>
      )}
    </ReportPage>
  );
}
