import React, { useEffect, useState } from "react";
import { View, Text } from "react-native";
import Cat from "../components/Cat";
import Btn from "../components/Btn";
import { CAT_LINES, pick } from "../content";
import { T } from "../theme";

export default function HomeScreen({ profile, onStart, onShop }) {
  const firstEver = profile.total_wins === 0 && profile.total_fails === 0;
  const [msg, setMsg] = useState(() => pick(firstEver ? CAT_LINES.first_ever : CAT_LINES.home));

  // Idle nag after 8.5s
  useEffect(() => {
    const t = setTimeout(() => setMsg(pick(CAT_LINES.idle_too_long)), 8500);
    return () => clearTimeout(t);
  }, [msg]);

  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 22, gap: 16 }}>
      <Text style={{
        fontSize: 50, fontWeight: "900", color: T.gold, letterSpacing: -1.5, textAlign: "center",
        textShadowColor: "rgba(0,0,0,0.3)", textShadowRadius: 6, textShadowOffset: { width: 3, height: 3 },
      }}>Catch It For Me</Text>
      <Text style={{
        color: T.textDim, textAlign: "center", fontSize: 15, fontWeight: "600",
        maxWidth: 320, lineHeight: 20,
      }}>
        Your cat refuses to do its job. Tap the mouse before it escapes.
      </Text>
      <Cat skinId={profile.skin_id} message={msg} />
      <View style={{ gap: 14, alignItems: "center", width: "100%", maxWidth: 340 }}>
        <Btn title="Start Hunt 🐭" big onPress={onStart} />
        <Btn title="Shop 🛍️" variant="secondary" onPress={onShop} />
      </View>
    </View>
  );
}
