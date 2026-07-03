import { ReactNode } from "react";
import { Image, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { colors } from "../theme/colors";
import { ImageData, NamedImage } from "../types/api";

export function Card({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

export function PrimaryButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={[styles.primaryButton, disabled && styles.disabled]}>
      <Text style={styles.primaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function Input(props: { value: string; onChangeText: (value: string) => void; placeholder: string }) {
  return <TextInput {...props} placeholderTextColor={colors.textMuted} style={styles.input} />;
}

export function ErrorNotice({ message }: { message: string }) {
  return (
    <View style={styles.notice}>
      <Text style={styles.noticeText}>{message}</Text>
    </View>
  );
}

export function ImageBadge({ item, size = 38 }: { item?: NamedImage | ImageData | null; size?: number }) {
  const image = "image" in (item ?? {}) ? (item as NamedImage).image : (item as ImageData | undefined);
  const label = "name" in (item ?? {}) ? (item as NamedImage).name : image?.alt_text ?? "?";
  const uri = image?.image_url ?? undefined;

  return (
    <View style={[styles.imageBadge, { width: size, height: size, borderRadius: size / 2 }]}>
      {uri ? (
        <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />
      ) : (
        <Text style={styles.imageFallback}>{label.slice(0, 1)}</Text>
      )}
    </View>
  );
}

export function SectionTitle({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.sectionTitle}>
      <Text style={styles.sectionTitleText}>{title}</Text>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 8,
    padding: 16,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border
  },
  primaryButton: {
    height: 44,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary
  },
  disabled: {
    opacity: 0.5
  },
  primaryButtonText: {
    color: colors.surface,
    fontWeight: "800",
    fontSize: 15
  },
  input: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    fontSize: 14,
    color: colors.text,
    backgroundColor: colors.surface
  },
  notice: {
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#FEF2F2",
    borderWidth: 1,
    borderColor: "#FECACA"
  },
  noticeText: {
    color: colors.danger,
    fontSize: 13
  },
  imageBadge: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceMuted,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: "hidden"
  },
  imageFallback: {
    color: colors.primary,
    fontWeight: "800"
  },
  sectionTitle: {
    marginBottom: 10
  },
  sectionTitleText: {
    fontSize: 17,
    fontWeight: "800",
    color: colors.text
  },
  sectionSubtitle: {
    marginTop: 2,
    fontSize: 12,
    color: colors.textMuted
  }
});
