import React, { useRef } from "react";
import { Pressable, Text, Animated, View } from "react-native";
import * as Haptics from "expo-haptics";
import { T, shadow } from "../theme";

/**
 * Big tap-friendly button with press animation + optional haptic.
 * Variants: primary (default), secondary (cyan), ghost (glass).
 */
export default function Btn({ title, onPress, variant = "primary", disabled, big, style }) {
  const scale = useRef(new Animated.Value(1)).current;

  const bg =
    variant === "secondary" ? ["#29e3ff", "#0099ff"]
    : variant === "ghost"   ? null
    :                          ["#ff5f8a", "#ff2d6f"];

  const colors = {
    primary:   { bg: "#ff2d6f", shadowColor: "#a10038" },
    secondary: { bg: "#0099ff", shadowColor: "#0055a8" },
    ghost:     { bg: "rgba(255,255,255,0.12)", shadowColor: "rgba(0,0,0,0.5)" },
  }[variant];

  return (
    <Pressable
      onPressIn={() => {
        Animated.spring(scale, { toValue: 0.95, useNativeDriver: true, speed: 40, bounciness: 0 }).start();
        if (!disabled) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
      }}
      onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 8 }).start()}
      onPress={disabled ? undefined : onPress}
      style={({ pressed }) => [{ opacity: disabled ? 0.55 : 1 }, style]}
    >
      <Animated.View
        style={[{
          minHeight: big ? 70 : 58,
          minWidth: 220,
          paddingHorizontal: 28,
          paddingVertical: 14,
          borderRadius: big ? 22 : 18,
          backgroundColor: colors.bg,
          borderColor: variant === "ghost" ? "rgba(255,255,255,0.25)" : "transparent",
          borderWidth: variant === "ghost" ? 1 : 0,
          alignItems: "center",
          justifyContent: "center",
          transform: [{ scale }],
        }, shadow(8, 22, 0.4)]}
      >
        <Text style={{
          color: "#fff",
          fontSize: big ? 22 : 18,
          fontWeight: "900",
          letterSpacing: 0.3,
        }}>{title}</Text>
      </Animated.View>
    </Pressable>
  );
}
