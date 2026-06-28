import { Text, View } from "@react-pdf/renderer";
import { ReportPage } from "../layout/ReportPage";
import { SectionHeader } from "../layout/SectionHeader";
import type { ReportTheme } from "../theme";

export type ContentsItem = {
  number: string;
  title: string;
};

export function ContentsPage({
  theme,
  items,
}: {
  theme: ReportTheme;
  items: ContentsItem[];
}) {
  return (
    <ReportPage theme={theme} section="Contents">
      <SectionHeader number="00" title="Contents" theme={theme} />
      <View style={{ marginTop: 4 }}>
        {items.map((item) => (
          <View
            key={`${item.number}-${item.title}`}
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingVertical: 15,
              borderBottomWidth: 1,
              borderBottomColor: theme.border,
            }}
            wrap={false}
          >
            <Text
              style={{
                width: 54,
                fontSize: 9.5,
                color: theme.accent,
                letterSpacing: 1.6,
              }}
            >
              {item.number}
            </Text>
            <Text style={{ fontSize: 15, color: theme.text }}>
              {item.title}
            </Text>
          </View>
        ))}
      </View>
    </ReportPage>
  );
}
