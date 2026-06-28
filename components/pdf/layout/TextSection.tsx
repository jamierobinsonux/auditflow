import { Text, View } from "@react-pdf/renderer";
import { styles } from "../styles";

export function TextSection({ title, children }: { title: string; children: string }) {
  return (
    <View style={{ marginTop: 14 }} minPresenceAhead={60}>
      <Text style={styles.h3}>{title}</Text>
      <Text style={[styles.body, { marginTop: 5 }]}>{children}</Text>
    </View>
  );
}
