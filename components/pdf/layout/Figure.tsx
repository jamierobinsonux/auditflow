import { Image, Text, View } from "@react-pdf/renderer";
import { styles } from "../styles";
import type { ReportTheme } from "../theme";

type FigureAnnotation = {
  id?: string;
  label?: string | number | null;
  note?: string | null;
  text?: string | null;
  x_position?: number | null;
  y_position?: number | null;
};

function getAnnotationLabel(annotation: FigureAnnotation, index: number) {
  return annotation.label ? String(annotation.label) : String(index + 1);
}

function getAnnotationNote(annotation: FigureAnnotation) {
  return annotation.note || annotation.text || null;
}

export function Figure({
  src,
  caption,
  index,
  theme,
  annotations = [],
}: {
  src: string;
  caption?: string | null;
  index?: number;
  theme: ReportTheme;
  annotations?: FigureAnnotation[];
}) {
  if (!src) return null;

  const validAnnotations = annotations.filter(
    (annotation) =>
      typeof annotation.x_position === "number" &&
      typeof annotation.y_position === "number"
  );

  return (
    <View style={{ marginTop: 4, marginBottom: 8 }} wrap={false}>
      <View style={{ position: "relative", width: "100%" }}>
        <Image src={src} style={styles.figureImage} />

        {validAnnotations.map((annotation, annotationIndex) => {
          const label = getAnnotationLabel(annotation, annotationIndex);

          return (
            <View
              key={annotation.id || `${label}-${annotationIndex}`}
              style={{
                position: "absolute",
                left: `${annotation.x_position}%`,
                top: `${annotation.y_position}%`,
                width: 18,
                height: 18,
                marginLeft: -9,
                marginTop: -9,
                borderRadius: 9,
                backgroundColor: theme.accent,
                borderWidth: 1.5,
                borderColor: "#FFFFFF",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: "#FFFFFF",
                  fontSize: 8,
                  fontWeight: "bold",
                  lineHeight: 1,
                }}
              >
                {label}
              </Text>
            </View>
          );
        })}
      </View>

      <Text style={[styles.figureCaption, { color: theme.mutedText }]}>
        {index ? `Figure ${index}. ` : ""}
        {caption || "Evidence screenshot."}
      </Text>

      {validAnnotations.length > 0 && (
        <View
          style={{
            marginTop: 5,
            paddingTop: 5,
            borderTopWidth: 1,
            borderTopColor: theme.border,
          }}
        >
          <Text style={[styles.label, { color: theme.faintText }]}>
            Evidence notes
          </Text>
          {validAnnotations.map((annotation, annotationIndex) => {
            const label = getAnnotationLabel(annotation, annotationIndex);
            const note = getAnnotationNote(annotation);

            if (!note) return null;

            return (
              <Text
                key={annotation.id || `note-${label}-${annotationIndex}`}
                style={[styles.small, { marginTop: 3, color: theme.mutedText }]}
              >
                {label}. {note}
              </Text>
            );
          })}
        </View>
      )}
    </View>
  );
}
