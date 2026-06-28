import { StyleSheet } from "@react-pdf/renderer";

export const pdfStyles = StyleSheet.create({
  page: {
    paddingTop: 70,
    paddingBottom: 62,
    paddingHorizontal: 52,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#0F172A",
    backgroundColor: "#FFFFFF",
  },

  coverPage: {
    padding: 56,
    fontFamily: "Helvetica",
    backgroundColor: "#F8FAFC",
    color: "#0F172A",
  },

  fixedHeader: {
    position: "absolute",
    top: 28,
    left: 52,
    right: 52,
    height: 26,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
    paddingBottom: 10,
  },

  fixedFooter: {
    position: "absolute",
    bottom: 28,
    left: 52,
    right: 52,
    height: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
    paddingTop: 8,
  },

  headerText: {
    fontSize: 8,
    color: "#64748B",
  },

  footerText: {
    fontSize: 8,
    color: "#64748B",
  },

  sectionHeader: {
    marginBottom: 22,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },

  eyebrow: {
    fontSize: 8,
    color: "#7C3AED",
    textTransform: "uppercase",
    letterSpacing: 1.4,
    marginBottom: 6,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    lineHeight: 1.22,
    color: "#0F172A",
  },

  h2: {
    fontSize: 13.5,
    fontWeight: "bold",
    color: "#0F172A",
    lineHeight: 1.35,
  },

  h3: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#0F172A",
    lineHeight: 1.4,
  },

  body: {
    fontSize: 9.5,
    lineHeight: 1.65,
    color: "#475569",
  },

  smallBody: {
    fontSize: 8.5,
    lineHeight: 1.5,
    color: "#64748B",
  },

  label: {
    fontSize: 7.5,
    fontWeight: "bold",
    color: "#334155",
    marginTop: 12,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  badge: {
    fontSize: 7.5,
    fontWeight: "bold",
    paddingVertical: 4,
    paddingHorizontal: 7,
    borderRadius: 6,
  },

  statCard: {
    flex: 1,
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 9,
    backgroundColor: "#FFFFFF",
  },

  statValue: {
    fontSize: 23,
    fontWeight: "bold",
    color: "#0F172A",
  },

  statLabel: {
    marginTop: 5,
    fontSize: 7.5,
    color: "#64748B",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  image: {
    width: "100%",
    maxHeight: 285,
    objectFit: "contain",
  },

  imageFrame: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 6,
    padding: 8,
    backgroundColor: "#FFFFFF",
  },

  caption: {
    marginTop: 7,
    fontSize: 8,
    color: "#64748B",
    lineHeight: 1.45,
  },

  divider: {
    marginTop: 14,
    marginBottom: 14,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },

  watermark: {
    position: "absolute",
    top: 350,
    left: 120,
    transform: "rotate(-35deg)",
    fontSize: 52,
    color: "#F1F5F9",
    fontWeight: "bold",
    letterSpacing: 4,
  },
});
