import { StyleSheet } from "@react-pdf/renderer";

export const styles = StyleSheet.create({
  page: {
    paddingTop: 66,
    paddingBottom: 58,
    paddingHorizontal: 58,
    fontFamily: "Helvetica",
    color: "#0F172A",
    backgroundColor: "#FFFFFF",
    fontSize: 10,
  },
  pageContent: { flexGrow: 1 },
  coverPage: {
    paddingTop: 66,
    paddingBottom: 56,
    paddingHorizontal: 62,
    fontFamily: "Helvetica",
    color: "#0F172A",
    backgroundColor: "#FFFFFF",
  },
  label: {
    fontSize: 7.25,
    letterSpacing: 1.15,
    textTransform: "uppercase",
    color: "#64748B",
  },
  h1: {
    fontSize: 24,
    fontWeight: "bold",
    lineHeight: 1.16,
    color: "#0F172A",
  },
  h2: {
    fontSize: 14.5,
    fontWeight: "bold",
    lineHeight: 1.3,
    color: "#0F172A",
  },
  h3: {
    fontSize: 11.5,
    fontWeight: "bold",
    lineHeight: 1.35,
    color: "#0F172A",
  },
  body: {
    fontSize: 10.2,
    lineHeight: 1.62,
    color: "#475569",
  },
  lead: {
    fontSize: 11.6,
    lineHeight: 1.58,
    color: "#334155",
  },
  small: {
    fontSize: 8.25,
    lineHeight: 1.42,
    color: "#64748B",
  },
  divider: { borderTopWidth: 1, borderTopColor: "#E2E8F0" },
  sectionBlock: { marginTop: 24 },
  figureImage: { width: "100%", maxHeight: 245, objectFit: "contain" },
  figureCaption: {
    marginTop: 3,
    fontSize: 8.3,
    lineHeight: 1.4,
    color: "#64748B",
  },
});
