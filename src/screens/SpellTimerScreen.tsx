import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Card, PrimaryButton, SectionTitle } from "../components/Ui";
import { colors } from "../theme/colors";
import { Position } from "../types/api";

const flashCooldownSeconds = 300;
const lanes: Array<{ key: Position; label: string }> = [
  { key: "TOP", label: "탑" },
  { key: "JUNGLE", label: "정글" },
  { key: "MID", label: "미드" },
  { key: "ADC", label: "원딜" },
  { key: "SUPPORT", label: "서폿" }
];

type FlashRecords = Partial<Record<Position, number>>;

export function SpellTimerScreen() {
  const [running, setRunning] = useState(false);
  const [gameSeconds, setGameSeconds] = useState(0);
  const [records, setRecords] = useState<FlashRecords>({});
  const [notice, setNotice] = useState("게임 시작 후 상대 점멸 사용 시점을 기록하세요.");

  useEffect(() => {
    if (!running) return;
    const intervalId = setInterval(() => {
      setGameSeconds((value) => value + 1);
    }, 1000);
    return () => clearInterval(intervalId);
  }, [running]);

  const allReady = useMemo(() => Object.values(records).every((usedAt) => usedAt === undefined), [records]);

  const startGame = () => {
    setRunning(true);
    setNotice("게임 시간이 진행 중입니다.");
  };

  const reset = () => {
    setRunning(false);
    setGameSeconds(0);
    setRecords({});
    setNotice("전체 기록을 초기화했습니다.");
  };

  const recordFlash = (position: Position) => {
    if (!running) {
      setNotice("게임 시작 후 점멸을 기록할 수 있습니다.");
      return;
    }
    setRecords((prev) => ({ ...prev, [position]: gameSeconds }));
    setNotice(`${lanes.find((lane) => lane.key === position)?.label} 점멸을 ${formatTime(gameSeconds)}에 기록했습니다.`);
  };

  const cancelRecord = (position: Position) => {
    setRecords((prev) => {
      const next = { ...prev };
      delete next[position];
      return next;
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.hero}>
        <Text style={styles.heroLabel}>현재 게임 시간</Text>
        <Text style={styles.heroTime}>{formatTime(gameSeconds)}</Text>
        <View style={styles.heroButtons}>
          <View style={styles.heroButtonGrow}>
            <PrimaryButton label={running ? "진행 중" : "게임 시작"} onPress={startGame} disabled={running} />
          </View>
          <Pressable onPress={reset} style={styles.resetButton}>
            <Text style={styles.resetText}>초기화</Text>
          </Pressable>
        </View>
      </View>

      <Text style={styles.notice}>{notice}</Text>

      <SectionTitle title="상대 점멸 기록" subtitle={allReady ? "아직 기록된 점멸이 없습니다." : "재사용 가능 시간과 남은 시간을 확인하세요."} />

      {lanes.map((lane) => {
        const usedAt = records[lane.key];
        const availableAt = usedAt === undefined ? undefined : usedAt + flashCooldownSeconds;
        const remaining = availableAt === undefined ? 0 : Math.max(availableAt - gameSeconds, 0);
        const available = usedAt === undefined || remaining <= 0;

        return (
          <Card key={lane.key}>
            <View style={styles.laneRow}>
              <View style={styles.laneText}>
                <Text style={styles.laneName}>{lane.label} 점멸</Text>
                <Text style={[styles.laneStatus, available ? styles.available : styles.cooling]}>
                  {available ? "사용 가능" : `${formatTime(remaining)} 남음`}
                </Text>
                <Text style={styles.availableAt}>
                  {availableAt === undefined ? "재사용 가능 시간 -" : `재사용 가능 시간 ${formatTime(availableAt)}`}
                </Text>
              </View>
              <View style={styles.actions}>
                <Pressable onPress={() => recordFlash(lane.key)} style={styles.flashButton}>
                  <Text style={styles.flashButtonText}>점멸</Text>
                </Pressable>
                <Pressable onPress={() => cancelRecord(lane.key)} style={styles.cancelButton}>
                  <Text style={styles.cancelText}>취소</Text>
                </Pressable>
              </View>
            </View>
          </Card>
        );
      })}
    </ScrollView>
  );
}

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
    padding: 20,
    paddingBottom: 28
  },
  hero: {
    borderRadius: 8,
    padding: 22,
    backgroundColor: colors.text
  },
  heroLabel: {
    color: "#B8C3D6",
    fontSize: 14,
    fontWeight: "700"
  },
  heroTime: {
    marginTop: 4,
    color: colors.surface,
    fontSize: 44,
    fontWeight: "900"
  },
  heroButtons: {
    marginTop: 16,
    flexDirection: "row",
    gap: 10
  },
  heroButtonGrow: {
    flex: 1
  },
  resetButton: {
    height: 44,
    borderRadius: 8,
    paddingHorizontal: 16,
    justifyContent: "center",
    backgroundColor: "#334155"
  },
  resetText: {
    color: colors.surface,
    fontWeight: "800"
  },
  notice: {
    fontSize: 13,
    color: colors.textMuted
  },
  laneRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12
  },
  laneText: {
    flex: 1
  },
  laneName: {
    fontSize: 16,
    fontWeight: "900",
    color: colors.text
  },
  laneStatus: {
    marginTop: 5,
    fontSize: 14,
    fontWeight: "800"
  },
  available: {
    color: colors.available
  },
  cooling: {
    color: colors.warning
  },
  availableAt: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 12
  },
  actions: {
    gap: 8
  },
  flashButton: {
    width: 70,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary
  },
  flashButtonText: {
    color: colors.surface,
    fontWeight: "900"
  },
  cancelButton: {
    width: 70,
    height: 30,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceMuted
  },
  cancelText: {
    color: colors.textMuted,
    fontWeight: "800"
  }
});
