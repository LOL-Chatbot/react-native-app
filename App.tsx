import { StatusBar } from "expo-status-bar";
import { ReactNode, useState } from "react";
import { StyleSheet, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { AppShell, TabKey } from "./src/components/AppShell";
import { ChampionsScreen } from "./src/screens/ChampionsScreen";
import { ChatScreen } from "./src/screens/ChatScreen";
import { SpellTimerScreen } from "./src/screens/SpellTimerScreen";
import { colors } from "./src/theme/colors";

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>("chat");

  return (
    <SafeAreaProvider>
      <StatusBar style="dark" />
      <View style={styles.safeArea}>
        <AppShell activeTab={activeTab} onChangeTab={setActiveTab}>
          <ScreenSlot visible={activeTab === "chat"}>
            <ChatScreen />
          </ScreenSlot>
          <ScreenSlot visible={activeTab === "champions"}>
            <ChampionsScreen />
          </ScreenSlot>
          <ScreenSlot visible={activeTab === "spells"}>
            <SpellTimerScreen />
          </ScreenSlot>
        </AppShell>
      </View>
    </SafeAreaProvider>
  );
}

function ScreenSlot({ visible, children }: { visible: boolean; children: ReactNode }) {
  return (
    <View pointerEvents={visible ? "auto" : "none"} style={[styles.screen, !visible && styles.hiddenScreen]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background
  },
  screen: {
    flex: 1
  },
  hiddenScreen: {
    display: "none"
  }
});
