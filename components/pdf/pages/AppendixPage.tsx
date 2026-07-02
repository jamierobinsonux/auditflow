import { Text, View } from "@react-pdf/renderer";
import { Figure } from "../layout/Figure";
import { ReportPage } from "../layout/ReportPage";
import { SectionHeader } from "../layout/SectionHeader";
import { styles } from "../styles";
import type { ReportTheme } from "../theme";

export function AppendixPage({ images, findings, annotations, theme, sectionNumber = "06" }: { images: any[]; findings: any[]; annotations: any[]; theme: ReportTheme; sectionNumber?: string }) {
  return (
    <ReportPage theme={theme} section="Evidence Appendix">
      <SectionHeader number={sectionNumber} title="Evidence Appendix" kicker="Supporting screenshots and annotation notes are included here for reference." theme={theme} />
      {images.map((image, index) => {
        const finding = findings.find((item) => item.id === image.finding_id);
        const notes = annotations.filter((annotation) => annotation.evidence_image_id === image.id || annotation.image_id === image.id);
        return (
          <View key={image.id || index} style={{ marginBottom: 24 }} wrap={false}>
            <Text style={styles.h3}>{finding?.title || "Evidence item"}</Text>
            <Figure
              src={image.image_url || image.url || image.public_url}
              caption={image.evidence_name || image.caption || finding?.title || "Evidence screenshot."}
              index={index + 1}
              theme={theme}
              annotations={notes}
            />
          </View>
        );
      })}
    </ReportPage>
  );
}
