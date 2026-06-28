import { Image, Text, View } from "@react-pdf/renderer";
import { styles } from "../styles";
import type { ReportTheme } from "../theme";

export function Figure({
  src,
  caption,
  index,
  theme,
}: {
  src: string;
  caption?: string | null;
  index?: number;
  theme: ReportTheme;
}) {
  if (!src) return null;

  return (
    <View style={{ marginTop: 16, marginBottom: 22 }} wrap={false}>
      <Image src={src} style={styles.figureImage} />
      <Text style={[styles.figureCaption, { color: theme.mutedText }]}> 
        {index ? `Figure ${index}. ` : ""}
        {caption || "Evidence screenshot."}
      </Text>
    </View>
  );
}
