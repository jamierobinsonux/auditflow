import { StyleSheet } from "@react-pdf/renderer";

export const pdfStyles = StyleSheet.create({
  page: {
    paddingTop: 52,
    paddingBottom: 52,
    paddingHorizontal: 50,
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

  sectionHeader: {
    marginBottom: 24,
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
    lineHeight: 1.25,
  },

  body: {
    fontSize: 10,
    lineHeight: 1.8,
    color: "#475569",
    marginBottom: 12,
  },

  card: {
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    marginBottom: 18,
  },

  mutedCard: {
    padding: 20,
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    backgroundColor: "#F8FAFC",
    marginBottom: 20,
  },

  label: {
    fontSize: 8,
    fontWeight: "bold",
    color: "#0F172A",
    marginTop: 14,
    marginBottom: 6,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },

  badge: {
    fontSize: 8,
    color: "#6D28D9",
    backgroundColor: "#EDE9FE",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 6,
  },

  image: {
    width: "100%",
    maxHeight: 220,
    objectFit: "contain",
  },

  caption: {
    marginTop: 8,
    fontSize: 8,
    color: "#64748B",
    lineHeight: 1.5,
  },

  divider: {
    marginTop: 16,
    marginBottom: 16,
    borderTopWidth: 1,
    borderTopColor: "#E2E8F0",
  },
});