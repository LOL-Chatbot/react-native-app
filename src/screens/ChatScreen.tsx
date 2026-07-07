import { useState } from "react";
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { apiClient } from "../api/client";
import { Card, ErrorNotice, ImageBadge, Input, PrimaryButton, SectionTitle } from "../components/Ui";
import { colors } from "../theme/colors";
import { BuildData, ChatAttachment, CounterChampion, CounterData, NamedImage, RuneOption, RuneTree, StatShardRow } from "../types/api";

type Message = {
  id: string;
  role: "user" | "assistant" | "status";
  text: string;
  attachments?: ChatAttachment[];
};

const quickQuestions = ["징크스 원딜 빌드", "아리 미드 카운터", "듀오 추천"];

export function ChatScreen() {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "궁금한 챔피언, 포지션, 상대 조합을 입력하면 OP.GG MCP 데이터 기준으로 답변합니다."
    }
  ]);

  const send = async (override?: string) => {
    const text = (override ?? message).trim();
    if (!text || loading) return;

    setMessage("");
    setError("");
    setLoading(true);
    setMessages((prev) => [
      ...prev,
      { id: `${Date.now()}-user`, role: "user", text },
      { id: `${Date.now()}-status`, role: "status", text: "OP.GG 데이터 조회 중..." }
    ]);

    try {
      const data = await apiClient.sendChat(text);
      setMessages((prev) => [
        ...prev.filter((item) => item.role !== "status"),
        {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          text: sanitizeAnswer(data.answer),
          attachments: data.attachments ?? []
        }
      ]);
    } catch (err) {
      setMessages((prev) => prev.filter((item) => item.role !== "status"));
      setError(err instanceof Error ? err.message : "답변 생성에 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.label}>빠른 질문</Text>
        <View style={styles.chips}>
          {quickQuestions.map((question) => (
            <Pressable key={question} onPress={() => send(question)} style={styles.chip}>
              <Text style={styles.chipText}>{question}</Text>
            </Pressable>
          ))}
        </View>

        <Card>
          <View style={styles.chatList}>
            {messages.map((item) => (
              <MessageBlock key={item.id} message={item} />
            ))}
          </View>
        </Card>

        {error ? <ErrorNotice message={error} /> : null}
      </ScrollView>

      <View style={styles.inputBar}>
        <View style={styles.inputWrap}>
          <Input value={message} onChangeText={setMessage} placeholder="질문을 입력하세요" />
        </View>
        <PrimaryButton label={loading ? "조회 중" : "전송"} onPress={() => send()} disabled={loading} />
      </View>
    </KeyboardAvoidingView>
  );
}

function MessageBlock({ message }: { message: Message }) {
  return (
    <View style={[styles.messageBlock, message.role === "user" && styles.userMessageBlock]}>
      <View
        style={[
          styles.message,
          message.role === "user" && styles.userMessage,
          message.role === "status" && styles.statusMessage
        ]}
      >
        <Text
          style={[
            styles.messageText,
            message.role === "user" && styles.userMessageText,
            message.role === "status" && styles.statusMessageText
          ]}
        >
          {message.text}
        </Text>
      </View>

      {message.role === "assistant" && message.attachments?.length ? (
        <View style={styles.attachments}>
          {message.attachments.map((attachment, index) => (
            <ChatAttachmentCard key={getAttachmentKey(attachment, index)} attachment={attachment} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function ChatAttachmentCard({ attachment }: { attachment: ChatAttachment }) {
  if (attachment.type === "champion_build") {
    return <ChatBuildCard build={(attachment as { data: BuildData }).data} title={attachment.title} />;
  }

  if (attachment.type === "counters") {
    return <ChatCounterCard counters={(attachment as { data: CounterData }).data} title={attachment.title} />;
  }

  return null;
}

function ChatBuildCard({ build, title }: { build: BuildData; title: string }) {
  const counters = build.counters ?? [];

  return (
    <View style={styles.attachmentCard}>
      <View style={styles.attachmentHero}>
        <ImageBadge item={build.champion_image ?? null} size={58} />
        <View style={styles.attachmentHeroText}>
          <Text style={styles.attachmentTitle}>{title}</Text>
          <Text style={styles.attachmentSubtitle}>{build.summary ?? "OP.GG MCP 기반 빌드 요약"}</Text>
        </View>
      </View>

      {build.runes?.primary_tree || build.runes?.secondary_tree ? (
        <RuneSummaryCard
          primaryTree={build.runes.primary_tree ?? null}
          secondaryTree={build.runes.secondary_tree ?? null}
          statShardRows={build.runes.stat_shard_rows ?? []}
        />
      ) : (
        <MiniBuildRow
          title="룬"
          subtitle={`${build.runes?.primary_style ?? "-"} · ${build.runes?.secondary_style ?? "-"}`}
          items={[build.runes?.keystone, ...(build.runes?.primary_rune_images ?? [])].filter(Boolean) as NamedImage[]}
        />
      )}
      <MiniBuildRow title="스펠" subtitle={names(build.spells)} items={build.spells} />
      <MiniBuildRow title="시작" subtitle={names(build.items?.start_items)} items={build.items?.start_items} />
      <MiniBuildRow title="신발" subtitle={names(build.items?.boots)} items={build.items?.boots} />
      <MiniBuildRow title="코어" subtitle={names(build.items?.core_items)} items={build.items?.core_items} />
      <MiniBuildRow
        title="스킬"
        subtitle={build.skills?.priority?.join(" > ") || "스킬 선마"}
        items={build.skills?.priority_images}
      />

      {counters.length > 0 ? (
        <View style={styles.counterMiniList}>
          <Text style={styles.miniTitle}>카운터</Text>
          {counters.slice(0, 3).map((counter, index) => (
            <CounterRow key={getCounterKey(counter, index)} counter={counter} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

function ChatCounterCard({ counters, title }: { counters: CounterData; title: string }) {
  return (
    <View style={styles.attachmentCard}>
      <SectionTitle title={title} subtitle="상대하기 까다로운 챔피언" />
      {counters.counters.length > 0 ? (
        counters.counters.slice(0, 5).map((counter, index) => (
          <CounterRow key={getCounterKey(counter, index)} counter={counter} />
        ))
      ) : (
        <Text style={styles.emptyText}>조회된 카운터 정보가 없습니다.</Text>
      )}
    </View>
  );
}

function RuneSummaryCard({
  primaryTree,
  secondaryTree,
  statShardRows
}: {
  primaryTree?: RuneTree | null;
  secondaryTree?: RuneTree | null;
  statShardRows?: StatShardRow[];
}) {
  return (
    <View style={styles.runeCard}>
      <Text style={styles.miniTitle}>룬</Text>
      <View style={styles.runeTrees}>
        {primaryTree ? <RuneTreeView tree={primaryTree} title="메인 룬" /> : null}
        {secondaryTree ? <RuneTreeView tree={secondaryTree} title="보조 룬" compact /> : null}
      </View>
      {statShardRows?.length ? (
        <View style={styles.statShardPanel}>
          <Text style={styles.runeTreeTitle}>능력치</Text>
          {statShardRows.map((row, index) => (
            <View key={`stat-${index}`} style={styles.runeSlotRow}>
              {row.runes.map((rune) => (
                <RuneIcon key={`${index}-${rune.id}`} rune={rune} size={22} />
              ))}
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function RuneTreeView({ tree, title, compact }: { tree: RuneTree; title: string; compact?: boolean }) {
  return (
    <View style={styles.runeTreePanel}>
      <Text style={styles.runeTreeTitle}>
        {title} · {tree.name}
      </Text>
      {tree.slots.map((slot, index) => (
        <View key={`${tree.style_id ?? tree.name}-${index}`} style={styles.runeSlotRow}>
          {slot.runes.map((rune) => (
            <RuneIcon key={rune.id} rune={rune} size={compact ? 22 : 24} />
          ))}
        </View>
      ))}
    </View>
  );
}

function RuneIcon({ rune, size }: { rune: RuneOption; size: number }) {
  const uri = rune.image?.image_url ?? undefined;
  return (
    <View
      style={[
        styles.runeIcon,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          opacity: rune.selected ? 1 : 0.28
        },
        rune.selected && styles.runeIconSelected
      ]}
    >
      {uri ? (
        <Image
          source={{ uri }}
          style={{
            width: size,
            height: size,
            borderRadius: size / 2,
            tintColor: rune.selected ? undefined : "#94A3B8"
          }}
        />
      ) : (
        <Text style={[styles.runeFallback, rune.selected && styles.runeFallbackSelected]}>{rune.name.slice(0, 1)}</Text>
      )}
    </View>
  );
}

function MiniBuildRow({ title, subtitle, items }: { title: string; subtitle: string; items?: NamedImage[] }) {
  return (
    <View style={styles.miniRow}>
      <View style={styles.miniText}>
        <Text style={styles.miniTitle}>{title}</Text>
        <Text style={styles.miniSubtitle}>{subtitle || "-"}</Text>
      </View>
      <View style={styles.iconRow}>
        {(items ?? []).slice(0, 6).map((item, index) => (
          <ImageBadge key={getNamedImageKey(title, item, index)} item={item} size={34} />
        ))}
      </View>
    </View>
  );
}

function CounterRow({ counter }: { counter: CounterChampion }) {
  return (
    <View style={styles.counterRow}>
      <ImageBadge item={counter.image ?? null} size={34} />
      <View style={styles.counterTextWrap}>
        <Text style={styles.counterName}>{counter.name_ko}</Text>
        <Text style={styles.counterReason}>{counter.reason ?? "OP.GG 기준 까다로운 매치업입니다."}</Text>
      </View>
    </View>
  );
}

function sanitizeAnswer(value: string) {
  return value.replace(/<img[^>]*>/g, "").replace(/\n{3,}/g, "\n\n").trim();
}

function names(items?: NamedImage[]) {
  return items?.map((item) => item.name).join(" · ") || "-";
}

function getAttachmentKey(attachment: ChatAttachment, index: number) {
  return [attachment.type, attachment.title, index].filter(Boolean).join("-");
}

function getNamedImageKey(title: string, item: NamedImage, index: number) {
  return [title, item.image?.image_key, item.name, index].filter(Boolean).join("-");
}

function getCounterKey(counter: CounterChampion, index: number) {
  return [counter.champion_id, counter.name_ko, index].filter(Boolean).join("-");
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  scrollContent: {
    gap: 14,
    padding: 20,
    paddingBottom: 18
  },
  label: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.text
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8
  },
  chip: {
    height: 32,
    borderRadius: 8,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft
  },
  chipText: {
    color: colors.primary,
    fontWeight: "700",
    fontSize: 13
  },
  chatList: {
    minHeight: 360,
    gap: 14
  },
  messageBlock: {
    width: "100%",
    alignSelf: "flex-start",
    gap: 8
  },
  userMessageBlock: {
    alignSelf: "flex-end"
  },
  message: {
    maxWidth: "86%",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: colors.surfaceMuted,
    alignSelf: "flex-start"
  },
  userMessage: {
    backgroundColor: colors.primary,
    alignSelf: "flex-end"
  },
  statusMessage: {
    backgroundColor: "#ECFDF5"
  },
  messageText: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 21
  },
  userMessageText: {
    color: colors.surface
  },
  statusMessageText: {
    color: colors.available,
    fontWeight: "700"
  },
  attachments: {
    width: "100%",
    alignSelf: "stretch",
    gap: 12
  },
  attachmentCard: {
    width: "100%",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 14,
    gap: 12
  },
  attachmentHero: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingBottom: 2
  },
  attachmentHeroText: {
    flex: 1,
    minWidth: 0
  },
  attachmentTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    lineHeight: 23
  },
  attachmentSubtitle: {
    marginTop: 4,
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18
  },
  miniRow: {
    minHeight: 72,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.surfaceMuted,
    gap: 8
  },
  miniText: {
    width: "100%"
  },
  miniTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900"
  },
  miniSubtitle: {
    marginTop: 3,
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18
  },
  iconRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7
  },
  runeCard: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.surfaceMuted,
    gap: 10
  },
  runeTrees: {
    flexDirection: "row",
    gap: 10
  },
  runeTreePanel: {
    flex: 1,
    minWidth: 0,
    gap: 7
  },
  runeTreeTitle: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: "800"
  },
  runeSlotRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6
  },
  runeIcon: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden"
  },
  runeIconSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft
  },
  runeFallback: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: "900"
  },
  runeFallbackSelected: {
    color: colors.primary
  },
  statShardPanel: {
    gap: 7
  },
  counterMiniList: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: colors.surfaceMuted,
    gap: 8
  },
  counterRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10
  },
  counterTextWrap: {
    flex: 1,
    minWidth: 0
  },
  counterName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900"
  },
  counterReason: {
    marginTop: 3,
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13
  },
  inputBar: {
    flexDirection: "row",
    gap: 10,
    padding: 14,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  inputWrap: {
    flex: 1
  }
});
