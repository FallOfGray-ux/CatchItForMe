import React, { useState, useEffect, useRef } from "react";
import { View, Text, Share, Animated } from "react-native";
import Cat from "../components/Cat";
import Btn from "../components/Btn";
import Confetti from "../components/Confetti";
import { CAT_LINES, pick } from "../content";
import { T, shadow } from "../theme";

export default function ResultScreen({ profile, last, onAgain, onHome }) {
  const { won, rare, coinsEarned, streakAtTime, prevStreak } = last;
  const [msg] = useState(() => {
    if (won) {
      if (rare) return pick(CAT_LINES.win_rare);
      if (streakAtTime >= 3) return pick(CAT_LINES.win_streak_3);
      if (streakAtTime === 2) return pick(CAT_LINES.win_streak_2);
      return pick(CAT_LINES.win);
    } else {
      if (rare) return pick(CAT_LINES.fail_rare);
      if (prevStreak >= 2) return pick(CAT_LINES.fail_streak_3);
      if (prevStreak === 1) return pick(CAT_LINES.fail_streak_2);
      return pick(CAT_LINES.fail);
    }
  });

  // "Screen shake" on fail
  const shake = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!won) {
      Animated.sequence([
        Animated.timing(shake, { toValue: 1,  duration: 50, useNativeDriver: true }),
        Animated.timing(shake, { toValue: -1, duration: 50, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 1,  duration: 50, useNativeDriver: true }),
        Animated.timing(shake, { toValue: 0,  duration: 50, useNativeDriver: true }),
      ]).start();
    }
  }, []);
  const translateX = shake.interpolate({ inputRange: [-1, 1], outputRange: [-8, 8] });

  const share = async () => {
    const text = won
      ? `caught the mouse in Catch It For Me 🐭 (+${coinsEarned} coins${rare ? ", RARE!" : ""}). my cat is unimpressed.`
      : `the mouse escaped in Catch It For Me 🐭. my cat is judging me HARD.`;
    try { await Share.share({ message: text }); } catch {}
  };

  return (
    <Animated.View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 22, gap: 16, transform: [{ translateX }] }}>
      {won ? <Confetti count={30} /> : null}

      <Text style={{
        fontSize: 84, fontWeight: "900", letterSpacing: -3,
        color: won ? T.gold : "#ff5c5c",
        textShadowColor: "rgba(0,0,0,0.3)", textShadowRadius: 6, textShadowOffset: { width: 4, height: 4 },
      }}>
        {won ? "CAUGHT!" : "ESCAPED!"}
      </Text>

      <Cat skinId={profile.skin_id} message={msg} streaking={streakAtTime >= 2} />

      {won ? (
        <View style={[{
          backgroundColor: T.glass, borderColor: T.glassBorder, borderWidth: 1,
          paddingVertical: 12, paddingHorizontal: 22, borderRadius: 16, alignItems: "center",
        }, shadow(8, 20, 0.35)]}>
          <Text style={{ color: T.gold, fontSize: 22, fontWeight: "900" }}>
            +{coinsEarned} 🪙{rare ? "  (RARE!)" : ""}
          </Text>
          {streakAtTime > 1 ? (
            <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700", marginTop: 4 }}>
              {"🔥".repeat(Math.min(5, streakAtTime))} streak ×{streakAtTime}
            </Text>
          ) : null}
        </View>
      ) : null}

      <View style={{ gap: 12, alignItems: "center", width: "100%", maxWidth: 340 }}>
        <Btn title="Play Again" onPress={onAgain} />
        <Btn title="Home" variant="secondary" onPress={onHome} />
        <Btn title="Share Result 📤" variant="ghost" onPress={share} />
      </View>
    </Animated.View>
  );
}
