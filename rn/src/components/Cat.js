import React, { useEffect, useRef } from "react";
import { View, Text, Animated } from "react-native";
import { CAT_SKINS } from "../content";
import { shadow } from "../theme";

/**
 * The sarcastic cat + optional speech bubble.
 * Variants: centered (home/result) or corner (game HUD).
 */
export default function Cat({ skinId, message, corner = false, streaking = false }) {
  const skin = CAT_SKINS.find((s) => s.id === skinId) || CAT_SKINS[0];
  const rot = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;

  // Continuous breathing animation.
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(rot,   { toValue:  1, duration: 1500, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1.04, duration: 1500, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(rot,   { toValue: -1, duration: 1500, useNativeDriver: true }),
          Animated.timing(scale, { toValue: 1, duration: 1500, useNativeDriver: true }),
        ]),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  const rotate = rot.interpolate({ inputRange: [-1, 1], outputRange: ["-3deg", "3deg"] });
  const catSize = corner ? 62 : 112;

  return (
    <View style={[
      corner ? { alignItems: "flex-start" } : { alignItems: "center" },
      { gap: 10 },
    ]}>
      {message ? <Bubble text={message} corner={corner} /> : null}
      <Animated.Text
        style={[
          { fontSize: catSize, transform: [{ rotate }, { scale }] },
          streaking ? { textShadowColor: "#ff9f2d", textShadowRadius: 20 } : null,
        ]}
      >
        {skin.emoji}
      </Animated.Text>
    </View>
  );
}

function Bubble({ text, corner }) {
  const pop = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    pop.setValue(0);
    Animated.spring(pop, { toValue: 1, useNativeDriver: true, friction: 5, tension: 140 }).start();
  }, [text]);

  const scale = pop.interpolate({ inputRange: [0, 1], outputRange: [0.55, 1] });
  const opacity = pop;

  return (
    <Animated.View
      style={[
        {
          backgroundColor: "#fff",
          borderRadius: 18,
          paddingVertical: 10,
          paddingHorizontal: 14,
          maxWidth: corner ? 220 : 290,
          transform: [{ scale }],
          opacity,
        },
        shadow(10, 22, 0.3),
      ]}
    >
      <Text style={{
        color: "#150a2e",
        fontSize: corner ? 13.5 : 15,
        fontWeight: "700",
        lineHeight: corner ? 18 : 20,
      }}>{text}</Text>
      {/* Bubble tail */}
      <View style={{
        position: "absolute",
        left: 24,
        bottom: -8,
        width: 0,
        height: 0,
        borderLeftWidth: 9,
        borderRightWidth: 9,
        borderTopWidth: 10,
        borderLeftColor: "transparent",
        borderRightColor: "transparent",
        borderTopColor: "#fff",
      }} />
    </Animated.View>
  );
}
