import { Text, View } from "@react-pdf/renderer";
import { ReportPage } from "../layout/ReportPage";
import { SectionHeader } from "../layout/SectionHeader";
import { styles } from "../styles";
import type { ReportTheme } from "../theme";

export function ConclusionPage({ theme, sectionNumber }: { theme: ReportTheme; sectionNumber: string }) {
  return (
    <ReportPage theme={theme} section="Conclusion">
      <SectionHeader number={sectionNumber} title="Conclusion" theme={theme} />
      <Text style={styles.lead}>This report should guide the next design iteration, roadmap discussion, or stakeholder review. Addressing the highest-severity and highest-impact issues first will create the clearest improvement in usability and product quality.</Text>
      <View style={{ marginTop: 40, borderTopWidth: 1, borderTopColor: theme.border, paddingTop: 18 }}>
        <Text style={styles.small}>Prepared by {theme.preparedBy}</Text>
        <Text style={[styles.small, { marginTop: 4 }]}>{theme.footerText}</Text>
      </View>
    </ReportPage>
  );
}
