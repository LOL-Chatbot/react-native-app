import { ReactNode } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { colors } from "../theme/colors";

export type TabKey = "chat" | "build" | "champions" | "spells";

type AppShellProps = {
  activeTab: TabKey;
  onChangeTab: (tab: TabKey) => void;
  children: ReactNode;
};

const tabs: Array<{ key: TabKey; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }> = [
  { key: "chat", label: "채팅", icon: "message-text-outline" },
  { key: "build", label: "빌드", icon: "sword-cross" },
  { key: "champions", label: "챔피언", icon: "shield-search" },
  { key: "spells", label: "스펠", icon: "timer-outline" }
];

const titles: Record<TabKey, string> = {
  chat: "채팅 추천",
  build: "종합 빌드",
  champions: "챔피언 탐색",
  spells: "점멸 타이머"
};

export function AppShell({ activeTab, onChangeTab, children }: AppShellProps) {
  return (
    <View style={styles.container}>
      <View style={styles.appBar}>
        <View>
          <Text style={styles.title}>{titles[activeTab]}</Text>
          <Text style={styles.subtitle}>OP.GG MCP 기반 LOL 도우미</Text>
        </View>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>ON</Text>
        </View>
      </View>

      <View style={styles.content}>{children}</View>

      <View style={styles.nav}>
        {tabs.map((tab) => {
          const selected = tab.key === activeTab;
          return (
            <Pressable
              key={tab.key}
              accessibilityRole="button"
              onPress={() => onChangeTab(tab.key)}
              style={[styles.navItem, selected && styles.navItemActive]}
            >
              <MaterialCommunityIcons
                name={tab.icon}
                size={22}
                color={selected ? colors.primary : colors.textMuted}
              />
              <Text style={[styles.navLabel, selected && styles.navLabelActive]}>{tab.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background
  },
  appBar: {
    height: 78,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.text
  },
  subtitle: {
    marginTop: 3,
    fontSize: 12,
    color: colors.textMuted
  },
  statusBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primarySoft
  },
  statusText: {
    fontSize: 11,
    fontWeight: "800",
    color: colors.primary
  },
  content: {
    flex: 1
  },
  nav: {
    height: 80,
    paddingHorizontal: 18,
    paddingTop: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border
  },
  navItem: {
    width: 72,
    height: 54,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center"
  },
  navItemActive: {
    backgroundColor: colors.primarySoft
  },
  navLabel: {
    marginTop: 3,
    fontSize: 12,
    color: colors.textMuted
  },
  navLabelActive: {
    color: colors.primary,
    fontWeight: "800"
  }
});
