import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Animated, Dimensions } from "react-native";
import * as Haptics from "expo-haptics";
import Cat from "../components/Cat";
import Mouse from "../components/Mouse";
import { CAT_LINES, pick, clamp } from "../content";

/**
 * Active round: spawns a mouse, moves every 500-1200ms, 5-10s timer.
 * Calls onFinish({ caught, rare }).
 */
export default function GameScreen({ profile, round, streak, onFinish }) {
  const { width, height } = Dimensions.get("window");

  // Playable rect (leaves room for HUD + cat corner).
  const padX = 40;
  const padTop = 180;
  const padBot = 80;

  const durationMs = useMemo(() => 5000 + Math.random() * 5000, [round]);
  const jumpMs = useMemo(
    () => clamp(1100 - round * 60, 300, 1200) - Math.random() * 200,
    [round]
  );
  const isRare = useMemo(() => Math.random() < 0.14, [round]);

  const [pos, setPos] = useState({ x: width / 2, y: height / 2 });
  const [remaining, setRemaining] = useState(durationMs);
  const [startMsg, setStartMsg] = useState(
    () => pick(isRare ? CAT_LINES.round_start_rare : CAT_LINES.round_start)
  );
  const [startedAt] = useState(() => Date.now());
  const finishedRef = useRef(false);
  const midFiredRef = useRef(false);
  const lowFiredRef = useRef(false);

  // Hide opener after ~1.8s
  useEffect(() => {
    const t = setTimeout(() => setStartMsg(null), 1800);
    return () => clearTimeout(t);
  }, []);

  const reposition = useCallback(() => {
    const x = padX + Math.random() * (width  - padX * 2);
    const y = padTop + Math.random() * (height - padTop - padBot);
    setPos({ x, y });
  }, [width, height]);

  useEffect(() => {
    reposition();
    const j = setInterval(reposition, jumpMs);
    return () => clearInterval(j);
  }, [jumpMs, reposition]);

  useEffect(() => {
    const tick = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const left = durationMs - elapsed;

      if (!midFiredRef.current && elapsed > durationMs * 0.5) {
        midFiredRef.current = true;
        setStartMsg(pick(CAT_LINES.mid_round));
        setTimeout(() => setStartMsg(null), 1500);
      }
      if (!lowFiredRef.current && left < 2000) {
        lowFiredRef.current = true;
        setStartMsg(pick(CAT_LINES.time_low));
        setTimeout(() => setStartMsg(null), 1400);
      }

      if (left <= 0) {
        clearInterval(tick);
        if (!finishedRef.current) {
          finishedRef.current = true;
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
          onFinish({ caught: false, rare: isRare });
        }
      } else setRemaining(left);
    }, 100);
    return () => clearInterval(tick);
  }, [durationMs, startedAt, onFinish, isRare]);

  const handleTap = () => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    Haptics.notificationAsync(
      isRare ? Haptics.NotificationFeedbackType.Success : Haptics.NotificationFeedbackType.Success
    ).catch(() => {});
    // Small delay so the user sees the catch land before we transition.
    setTimeout(() => onFinish({ caught: true, rare: isRare }), 250);
  };

  const pct = clamp((remaining / durationMs) * 100, 0, 100);

  return (
    <View style={{ flex: 1 }}>
      {/* Corner cat commentary */}
      <View style={{ position: "absolute", top: 110, left: 10, zIndex: 6 }}>
        <Cat skinId={profile.skin_id} message={startMsg} corner streaking={streak >= 2} />
      </View>

      {/* Timer bar */}
      <TimerBar pct={pct} low={remaining < 2000} />

      {/* The mouse */}
      <Mouse x={pos.x} y={pos.y} rare={isRare} onTap={handleTap} />
    </View>
  );
}

function TimerBar({ pct, low }) {
  const w = useRef(new Animated.Value(pct)).current;
  useEffect(() => {
    Animated.timing(w, { toValue: pct, duration: 110, useNativeDriver: false }).start();
  }, [pct]);
  const width = w.interpolate({ inputRange: [0, 100], outputRange: ["0%", "100%"] });

  return (
    <View style={{
      position: "absolute",
      top: 82, left: 14, right: 14, height: 10,
      borderRadius: 999, backgroundColor: "rgba(0,0,0,0.35)",
      borderWidth: 1, borderColor: "rgba(255,255,255,0.15)",
      overflow: "hidden", zIndex: 30,
    }}>
      <Animated.View style={{
        height: "100%",
        width,
        backgroundColor: low ? "#ff2d6f" : "#ffd23f",
      }} />
    </View>
  );
}
