import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { apiClient } from "../api/client";
import { Card, ErrorNotice, Input, PrimaryButton } from "../components/Ui";
import { colors } from "../theme/colors";

type Message = {
  id: string;
  role: "user" | "assistant" | "status";
  text: string;
};

const quickQuestions = ["징크스 원딜 빌드", "미드 카운터", "듀오 추천"];

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
        { id: `${Date.now()}-assistant`, role: "assistant", text: data.answer }
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
              <View
                key={item.id}
                style={[
                  styles.message,
                  item.role === "user" && styles.userMessage,
                  item.role === "status" && styles.statusMessage
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    item.role === "user" && styles.userMessageText,
                    item.role === "status" && styles.statusMessageText
                  ]}
                >
                  {item.text}
                </Text>
              </View>
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
