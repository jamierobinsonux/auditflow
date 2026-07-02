import { Text, View } from "@react-pdf/renderer";
import { styles } from "../styles";

export function TextSection({ title, children }: { title: string; children: string }) {
  return (
    <View style={{ marginTop: 9 }} minPresenceAhead={45}>
      <Text style={styles.h3}>{title}</Text>
      <Text style={[styles.body, { marginTop: 3 }]}>{children}</Text>
    </View>
  );
}
