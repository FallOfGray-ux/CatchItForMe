import React from "react";
import { View, Text } from "react-native";
import { T, shadow } from "../theme";

export function Pill({ children, style, textStyle }) {
  return (
    <View style={[{
      backgroundColor: T.glass,
      borderColor: T.glassBorder,
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 999,
      flexDirection: "row",
      alignItems: "center",
    }, shadow(6, 18, 0.3), style]}>
      <Text style={[{ color: "#fff", fontWeight: "800", fontSize: 15, letterSpacing: 0.3 }, textStyle]}>
        {children}
      </Text>
    </View>
  );
}

export function StreakPill({ streak }) {
  if (streak < 2) return null;
  return (
    <Pill
      style={{ backgroundColor: "#ff5f6d", borderColor: "rgba(255,255,255,0.25)" }}
      textStyle={{ color: "#fff" }}
    >
      🔥 ×{streak}
    </Pill>
  );
}
