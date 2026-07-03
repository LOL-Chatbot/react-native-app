import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { apiClient } from "../api/client";
import { Card, ErrorNotice, ImageBadge, Input, SectionTitle } from "../components/Ui";
import { colors } from "../theme/colors";
import { ChampionTier, Position } from "../types/api";

const tabs: Array<{ label: string; value?: Position }> = [
  { label: "ALL" },
  { label: "TOP", value: "TOP" },
  { label: "JUG", value: "JUNGLE" },
  { label: "MID", value: "MID" },
  { label: "ADC", value: "ADC" },
  { label: "SUP", value: "SUPPORT" }
];

export function ChampionsScreen({ onOpenBuild }: { onOpenBuild: () => void }) {
  const [position, setPosition] = useState<Position | undefined>();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [champions, setChampions] = useState<ChampionTier[]>([]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      loadChampions();
    }, 250);
    return () => clearTimeout(timeout);
  }, [position, query]);

  const loadChampions = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await apiClient.getTierList(position, query.trim() || undefined);
      setChampions(data.champions ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "챔피언 티어표 조회에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Input value={query} onChangeText={setQuery} placeholder="챔피언 이름 검색" />
      <View style={styles.tabs}>
        {tabs.map((tab) => {
          const selected = tab.value === position || (!tab.value && !position);
          return (
            <Pressable key={tab.label} onPress={() => setPosition(tab.value)} style={[styles.tab, selected && styles.tabActive]}>
              <Text style={[styles.tabText, selected && styles.tabTextActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <SectionTitle title="라인별 메타 추천" subtitle={loading ? "조회 중..." : `${champions.length}개 챔피언`} />

      {error ? <ErrorNotice message={error} /> : null}

      {champions.length === 0 && !loading ? (
        <Card>
          <Text style={styles.emptyText}>검색 조건에 맞는 챔피언이 없습니다.</Text>
        </Card>
      ) : null}

      {champions.slice(0, 30).map((champion, index) => (
        <Pressable key={`${champion.champion_id}-${champion.position}-${index}`} onPress={onOpenBuild}>
          <Card>
            <View style={styles.championRow}>
              <ImageBadge item={champion.image ?? null} size={44} />
              <View style={styles.championText}>
                <Text style={styles.championName}>
                  {champion.name_ko} / {champion.position ?? "-"}
                </Text>
                <Text style={styles.championMeta}>
                  승률 {formatRate(champion.win_rate)} · 픽률 {formatRate(champion.pick_rate)} · 티어 {champion.tier ?? "-"}
                </Text>
              </View>
              <Text style={styles.detailText}>상세</Text>
            </View>
          </Card>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function formatRate(value?: number) {
  return typeof value === "number" ? `${value.toFixed(1)}%` : "-";
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
    padding: 20,
    paddingBottom: 28
  },
  tabs: {
    flexDirection: "row",
    gap: 7
  },
  tab: {
    height: 32,
    minWidth: 50,
    borderRadius: 8,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceMuted
  },
  tabActive: {
    backgroundColor: colors.primary
  },
  tabText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.textMuted
  },
  tabTextActive: {
    color: colors.surface
  },
  championRow: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    gap: 12
  },
  championText: {
    flex: 1
  },
  championName: {
    fontSize: 15,
    fontWeight: "900",
    color: colors.text
  },
  championMeta: {
    marginTop: 4,
    fontSize: 12,
    color: colors.textMuted
  },
  detailText: {
    fontSize: 12,
    fontWeight: "800",
    color: colors.primary
  },
  emptyText: {
    color: colors.textMuted
  }
});
