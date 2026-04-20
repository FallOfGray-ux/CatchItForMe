import React, { useEffect, useMemo, useRef } from "react";
import { Animated, View, Dimensions } from "react-native";

/**
 * Burst of colored squares flying from screen center.
 * Pure Animated — no dependencies.
 */
const COLORS = ["#ff2d6f", "#ffd23f", "#29e3ff", "#7b2cff", "#7ae25e", "#fff"];

export default function Confetti({ count = 30 }) {
  const { width, height } = Dimensions.get("window");
  const pieces = useMemo(
    () => new Array(count).fill(0).map((_, i) => {
      const angle = Math.random() * Math.PI * 2;
      const dist  = 120 + Math.random() * 260;
      return {
        color: COLORS[i % COLORS.length],
        tx: Math.cos(angle) * dist,
        ty: Math.sin(angle) * dist,
        rot: Math.random() * 720 - 360,
        delay: Math.random() * 80,
      };
    }),
    [count]
  );

  return (
    <View pointerEvents="none" style={{
      position: "absolute",
      top: 0, left: 0, right: 0, bottom: 0,
      alignItems: "center", justifyContent: "center",
    }}>
      {pieces.map((p, i) => (
        <Piece key={i} {...p} cx={width / 2} cy={height / 2} />
      ))}
    </View>
  );
}

function Piece({ color, tx, ty, rot, delay }) {
  const t = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.timing(t, { toValue: 1, duration: 1100, useNativeDriver: true }),
    ]).start();
  }, []);

  const translateX = t.interpolate({ inputRange: [0, 1], outputRange: [0, tx] });
  const translateY = t.interpolate({ inputRange: [0, 1], outputRange: [0, ty] });
  const rotate     = t.interpolate({ inputRange: [0, 1], outputRange: ["0deg", `${rot}deg`] });
  const opacity    = t.interpolate({ inputRange: [0, 0.1, 1], outputRange: [0, 1, 0] });

  return (
    <Animated.View style={{
      position: "absolute",
      width: 10, height: 14,
      backgroundColor: color,
      borderRadius: 2,
      opacity,
      transform: [{ translateX }, { translateY }, { rotate }],
    }} />
  );
}
