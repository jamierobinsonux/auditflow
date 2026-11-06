import { Text, View } from "@react-pdf/renderer";
import { pdfStyles } from "./PdfStyles";
import type { ReportTheme } from "./report-theme";

export function SectionTitle({
  eyebrow,
  title,
  theme,
}: {
  eyebrow: string;
  title: string;
  theme: ReportTheme;
}) {
  return (
    <View style={pdfStyles.sectionHeader} wrap={false} minPresenceAhead={90}>
      <Text style={[pdfStyles.eyebrow, { color: theme.primaryColor }]}>
        {eyebrow}
      </Text>
      <Text style={pdfStyles.sectionTitle}>{title}</Text>
    </View>
  );
}
