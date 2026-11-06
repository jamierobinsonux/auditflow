import { Page, Text, View } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import { styles } from "../styles";
import type { ReportTheme } from "../theme";

export function ReportPage({
  children,
  theme,
  section,
}: {
  children: ReactNode;
  theme: ReportTheme;
  section?: string;
}) {
  return (
    <Page size="A4" style={styles.page} wrap>
      {theme.showWatermark && (
        <Text
          fixed
          style={{
            position: "absolute",
            top: 350,
            left: 92,
            fontSize: 48,
            color: "#F8FAFC",
            transform: "rotate(-32deg)",
            letterSpacing: 5,
          }}
        >
          CONFIDENTIAL
        </Text>
      )}

      <View
        fixed
        style={{
          position: "absolute",
          top: 32,
          left: 58,
          right: 58,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 7.5, color: theme.faintText }}>
          {theme.brandName}
        </Text>
        <Text style={{ fontSize: 7.5, color: theme.faintText }}>
          {section || "UX Audit Report"}
        </Text>
      </View>

      <View style={styles.pageContent}>{children}</View>

      <View
        fixed
        style={{
          position: "absolute",
          bottom: 30,
          left: 58,
          right: 58,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 7.5, color: theme.faintText }}>
          {theme.footerText}
        </Text>
        <Text
          style={{ fontSize: 7.5, color: theme.faintText }}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
        />
      </View>
    </Page>
  );
}
