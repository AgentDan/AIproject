/**
 * Простая тестовая игра: лови бабочек (мягкие цвета, русский текст).
 */
import React, { useCallback, useEffect, useState } from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { StatusBar } from "expo-status-bar";

const BG = "#fff5f9";
const LILAC = "#7b1fa2";
const PINK_BTN = "#ec407a";
const FIELD_BORDER = "#f8bbd9";
const ROUND_SEC = 18;

function randomSpot() {
  return {
    leftPct: 2 + Math.random() * 74,
    topPct: 6 + Math.random() * 58,
  };
}

function praiseFor(score) {
  if (score === 0) return "Не грусти — в следующий раз получится!";
  if (score < 6) return "Молодец, хорошо получается!";
  if (score < 12) return "Здорово, ты быстрая!";
  return "Вау, суперрезультат!";
}

export default function App() {
  const [phase, setPhase] = useState("menu");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(ROUND_SEC);
  const [spot, setSpot] = useState(() => randomSpot());

  const startGame = useCallback(() => {
    setScore(0);
    setTimeLeft(ROUND_SEC);
    setSpot(randomSpot());
    setPhase("play");
  }, []);

  useEffect(() => {
    if (phase !== "play") return;
    const id = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setPhase("over");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  const onCatch = () => {
    if (phase !== "play") return;
    setScore((s) => s + 1);
    setSpot(randomSpot());
  };

  return (
    <View style={styles.root}>
      <StatusBar style="dark" backgroundColor={BG} />
      <Text style={styles.title}>Бабочки в саду</Text>
      <Text style={styles.subtitle}>
        Нажимай на бабочку, пока она порхает. У тебя {ROUND_SEC} секунд.
      </Text>

      <View style={styles.hud}>
        <Text style={styles.hudItem}>Поймала: {score}</Text>
        <Text style={[styles.hudItem, phase === "play" && timeLeft <= 5 && styles.hudUrgent]}>
          Время: {timeLeft} сек
        </Text>
      </View>

      {phase === "menu" && (
        <Pressable onPress={startGame} style={({ pressed }) => [styles.mainBtn, pressed && styles.mainBtnPressed]}>
          <Text style={styles.mainBtnText}>Играть</Text>
        </Pressable>
      )}

      {phase === "over" && (
        <View style={styles.overWrap}>
          <Text style={styles.overEmoji}>✨</Text>
          <Text style={styles.overTitle}>Раунд окончен</Text>
          <Text style={styles.overLine}>Бабочек поймано: {score}</Text>
          <Text style={styles.praise}>{praiseFor(score)}</Text>
          <Pressable onPress={startGame} style={({ pressed }) => [styles.mainBtn, pressed && styles.mainBtnPressed]}>
            <Text style={styles.mainBtnText}>Ещё раз</Text>
          </Pressable>
        </View>
      )}

      {phase === "play" && (
        <View style={styles.meadow}>
          <Pressable
            onPress={onCatch}
            style={[styles.butterflyWrap, { left: `${spot.leftPct}%`, top: `${spot.topPct}%` }]}
            hitSlop={12}
          >
            <Text style={styles.butterflyEmoji} allowFontScaling={false}>
              🦋
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: BG,
    paddingTop: Platform.OS === "android" ? 48 : 56,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: LILAC,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: "#6a1b9a",
    opacity: 0.92,
    marginBottom: 14,
  },
  hud: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  hudItem: {
    fontSize: 17,
    fontWeight: "600",
    color: "#ad1457",
  },
  hudUrgent: {
    color: "#c2185b",
  },
  meadow: {
    flex: 1,
    marginBottom: 16,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: FIELD_BORDER,
    overflow: "hidden",
  },
  butterflyWrap: {
    position: "absolute",
    minWidth: 64,
    minHeight: 64,
    justifyContent: "center",
    alignItems: "center",
  },
  butterflyEmoji: {
    fontSize: 52,
    textAlign: "center",
  },
  mainBtn: {
    alignSelf: "center",
    marginTop: 28,
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 999,
    backgroundColor: PINK_BTN,
    elevation: 2,
    shadowColor: "#880e4f",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  mainBtnPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  mainBtnText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
  overWrap: {
    marginTop: 16,
    alignItems: "center",
    paddingHorizontal: 8,
  },
  overEmoji: {
    fontSize: 40,
    marginBottom: 6,
  },
  overTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: LILAC,
    marginBottom: 8,
  },
  overLine: {
    fontSize: 18,
    color: "#4a148c",
    marginBottom: 10,
  },
  praise: {
    fontSize: 16,
    lineHeight: 22,
    color: "#6a1b9a",
    textAlign: "center",
    marginBottom: 22,
  },
});
