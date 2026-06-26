import { Text, View } from "@react-pdf/renderer";
import { pdfStyles } from "./PdfStyles";

export function SectionTitle({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  return (
    <View style={pdfStyles.sectionHeader} wrap={false}>
      <Text style={pdfStyles.eyebrow}>{eyebrow}</Text>
      <Text style={pdfStyles.sectionTitle}>{title}</Text>
    </View>
  );
}