import React, { useEffect, useRef } from "react";
import { Pressable, Animated, View } from "react-native";

/**
 * Absolutely-positioned tappable mouse.
 * Props:
 *   x, y: pixel coordinates within the parent (centered on that point)
 *   rare: boolean — shows gold mouse with glow
 *   onTap: () => void
 */
export default function Mouse({ x, y, rare, onTap }) {
  const scale = useRef(new Animated.Value(0)).current;
  const wiggle = useRef(new Animated.Value(0)).current;

  // Spawn pop + continuous wiggle.
  useEffect(() => {
    scale.setValue(0);
    Animated.spring(scale, { toValue: 1, useNativeDriver: true, friction: 4, tension: 140 }).start();

    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(wiggle, { toValue: 1,  duration: rare ? 180 : 260, useNativeDriver: true }),
        Animated.timing(wiggle, { toValue: -1, duration: rare ? 180 : 260, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [x, y, rare]);

  const rotate = wiggle.interpolate({ inputRange: [-1, 1], outputRange: ["-6deg", "6deg"] });

  return (
    <View pointerEvents="box-none" style={{
      position: "absolute",
      left: x - 36,
      top: y - 36,
      width: 72, height: 72,
      alignItems: "center", justifyContent: "center",
    }}>
      {/* Puff cloud behind the mouse — a simple expanding circle */}
      <Puff />
      <Pressable
        onPress={onTap}
        hitSlop={12}
        style={{ padding: 6 }}
      >
        <Animated.Text
          style={{
            fontSize: 54,
            transform: [{ scale }, { rotate }],
            textShadowColor: rare ? "gold" : "rgba(0,0,0,0.4)",
            textShadowRadius: rare ? 18 : 6,
          }}
        >
          {rare ? "🐭" : "🐁"}
        </Animated.Text>
      </Pressable>
    </View>
  );
}

function Puff() {
  const p = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    p.setValue(0);
    Animated.timing(p, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);
  const scale = p.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1.6] });
  const opacity = p.interpolate({ inputRange: [0, 1], outputRange: [0.8, 0] });
  return (
    <Animated.View style={{
      position: "absolute",
      width: 70, height: 70, borderRadius: 35,
      backgroundColor: "rgba(255,255,255,0.9)",
      transform: [{ scale }],
      opacity,
    }} />
  );
}
