import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { apiClient } from "../api/client";
import { Card, ErrorNotice, ImageBadge, Input, PrimaryButton, SectionTitle } from "../components/Ui";
import { colors } from "../theme/colors";
import { BuildData, NamedImage, Position } from "../types/api";

const positions: Position[] = ["TOP", "JUNGLE", "MID", "ADC", "SUPPORT"];

export function BuildScreen() {
  const [championId, setChampionId] = useState("징크스");
  const [position, setPosition] = useState<Position>("ADC");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [build, setBuild] = useState<BuildData | null>(null);

  const loadBuild = async () => {
    if (!championId.trim()) {
      setError("챔피언 이름을 입력해 주세요.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await apiClient.getChampionBuild(championId.trim(), position);
      setBuild(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "빌드 조회에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card>
        <SectionTitle title="챔피언 빌드 조회" subtitle="챔피언과 포지션을 선택하세요" />
        <View style={styles.formRow}>
          <View style={styles.inputGrow}>
            <Input value={championId} onChangeText={setChampionId} placeholder="챔피언 이름" />
          </View>
          <Text style={styles.positionValue}>{position}</Text>
        </View>
        <View style={styles.positionRow}>
          {positions.map((item) => (
            <Pressable
              key={item}
              onPress={() => setPosition(item)}
              style={[styles.positionChip, item === position && styles.positionChipActive]}
            >
              <Text style={[styles.positionText, item === position && styles.positionTextActive]}>{item}</Text>
            </Pressable>
          ))}
        </View>
        <PrimaryButton label={loading ? "조회 중" : "조회"} onPress={loadBuild} disabled={loading} />
      </Card>

      {error ? <ErrorNotice message={error} /> : null}

      {build ? (
        <View style={styles.resultWrap}>
          <View style={styles.hero}>
            <ImageBadge item={build.champion_image ?? null} size={58} />
            <View style={styles.heroText}>
              <Text style={styles.heroTitle}>
                {build.champion_id} · {build.position}
              </Text>
              <Text style={styles.heroSubtitle}>{build.summary ?? "OP.GG MCP 기반 종합 빌드"}</Text>
            </View>
          </View>

          <BuildRow title="룬" subtitle={`${build.runes?.primary_style ?? "-"} · ${build.runes?.secondary_style ?? "-"}`} items={build.runes?.primary_rune_images} />
          <BuildRow title="스펠" subtitle={build.spells?.map((item) => item.name).join(" · ") || "추천 스펠"} items={build.spells} />
          <BuildRow title="시작 아이템" subtitle={build.items?.start_items?.map((item) => item.name).join(" · ") || "시작 아이템"} items={build.items?.start_items} />
          <BuildRow title="코어 아이템" subtitle={build.items?.core_items?.map((item) => item.name).join(" · ") || "코어 아이템"} items={build.items?.core_items} />
          <BuildRow title="스킬" subtitle={build.skills?.description ?? build.skills?.priority?.join(" > ") ?? "스킬 선마"} items={build.skills?.priority_images} />

          <Card>
            <SectionTitle title="카운터" subtitle="상대하기 까다로운 챔피언" />
            {(build.counters ?? []).length > 0 ? (
              build.counters?.slice(0, 3).map((counter) => (
                <View key={counter.champion_id} style={styles.counterRow}>
                  <ImageBadge item={counter.image ?? null} size={36} />
                  <View style={styles.counterTextWrap}>
                    <Text style={styles.counterName}>{counter.name_ko}</Text>
                    <Text style={styles.counterReason}>{counter.reason ?? "OP.GG 기준 까다로운 매치업입니다."}</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.emptyText}>조회된 카운터 정보가 없습니다.</Text>
            )}
          </Card>
        </View>
      ) : null}
    </ScrollView>
  );
}

function BuildRow({ title, subtitle, items }: { title: string; subtitle: string; items?: NamedImage[] }) {
  return (
    <Card>
      <View style={styles.buildRow}>
        <View style={styles.buildText}>
          <Text style={styles.buildTitle}>{title}</Text>
          <Text style={styles.buildSubtitle}>{subtitle}</Text>
        </View>
        <View style={styles.iconRow}>
          {(items ?? []).slice(0, 3).map((item) => (
            <ImageBadge key={`${title}-${item.name}`} item={item} size={32} />
          ))}
        </View>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 14,
    padding: 20,
    paddingBottom: 28
  },
  formRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 10
  },
  inputGrow: {
    flex: 1
  },
  positionValue: {
    width: 84,
    height: 44,
    borderRadius: 8,
    textAlign: "center",
    textAlignVertical: "center",
    color: colors.primary,
    fontWeight: "800",
    backgroundColor: colors.primarySoft
  },
  positionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 14
  },
  positionChip: {
    height: 32,
    borderRadius: 8,
    paddingHorizontal: 10,
    justifyContent: "center",
    backgroundColor: colors.surfaceMuted
  },
  positionChipActive: {
    backgroundColor: colors.primary
  },
  positionText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "700"
  },
  positionTextActive: {
    color: colors.surface
  },
  resultWrap: {
    gap: 12
  },
  hero: {
    flexDirection: "row",
    gap: 14,
    alignItems: "center",
    paddingVertical: 4
  },
  heroText: {
    flex: 1
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: colors.text
  },
  heroSubtitle: {
    marginTop: 4,
    fontSize: 13,
    color: colors.textMuted
  },
  buildRow: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12
  },
  buildText: {
    flex: 1
  },
  buildTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: colors.text
  },
  buildSubtitle: {
    marginTop: 3,
    fontSize: 13,
    color: colors.textMuted
  },
  iconRow: {
    flexDirection: "row",
    gap: 4
  },
  counterRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
    paddingVertical: 8
  },
  counterTextWrap: {
    flex: 1
  },
  counterName: {
    fontSize: 14,
    fontWeight: "800",
    color: colors.text
  },
  counterReason: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textMuted
  },
  emptyText: {
    color: colors.textMuted
  }
});
