import { Text, View } from "@react-pdf/renderer";
import { styles } from "../styles";
import type { ReportTheme } from "../theme";

function titleSize(title: string) {
  if (title.length > 38) return 18.5;
  if (title.length > 28) return 20.5;
  return 22.5;
}

export function SectionHeader({
  number,
  title,
  kicker,
  theme,
}: {
  number: string;
  title: string;
  kicker?: string;
  theme: ReportTheme;
}) {
  return (
    <View style={{ marginBottom: 14 }} minPresenceAhead={60}>
      <Text style={[styles.label, { color: theme.accent, marginBottom: 8 }]}>
        {number}
      </Text>
      <Text style={[styles.h1, { fontSize: titleSize(title), maxWidth: 470 }]}>
        {title}
      </Text>
      {kicker && (
        <Text style={[styles.lead, { marginTop: 8, maxWidth: 450 }]}>
          {kicker}
        </Text>
      )}
      <View
        style={{
          marginTop: 12,
          width: 54,
          borderTopWidth: 2,
          borderTopColor: theme.accent,
        }}
      />
    </View>
  );
}
