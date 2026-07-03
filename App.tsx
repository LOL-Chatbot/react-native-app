import { StatusBar } from "expo-status-bar";
import { SafeAreaView, StyleSheet } from "react-native";
import { useState } from "react";

import { AppShell, TabKey } from "./src/components/AppShell";
import { BuildScreen } from "./src/screens/BuildScreen";
import { ChampionsScreen } from "./src/screens/ChampionsScreen";
import { ChatScreen } from "./src/screens/ChatScreen";
import { SpellTimerScreen } from "./src/screens/SpellTimerScreen";
import { colors } from "./src/theme/colors";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("chat");

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <AppShell activeTab={activeTab} onChangeTab={setActiveTab}>
        {activeTab === "chat" && <ChatScreen />}
        {activeTab === "build" && <BuildScreen />}
        {activeTab === "champions" && <ChampionsScreen onOpenBuild={() => setActiveTab("build")} />}
        {activeTab === "spells" && <SpellTimerScreen />}
      </AppShell>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  }
});
