import React from 'react';
import { Pressable, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GRADIENT_HEADER } from '../theme';

export function GradientHeader({
  title,
  subtitle,
  onBack,
  right,
}: {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}) {
  const insets = useSafeAreaInsets();
  return (
    <LinearGradient
      colors={GRADIENT_HEADER}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ paddingTop: insets.top + 6, paddingBottom: 12, paddingHorizontal: 16 }}
    >
      <View className="flex-row items-center">
        {onBack ? (
          <Pressable
            onPress={onBack}
            hitSlop={12}
            className="mr-2.5 h-9 w-9 items-center justify-center rounded-full bg-white/15"
            accessibilityLabel="Go back"
          >
            <Text className="text-lg text-gold-light">‹</Text>
          </Pressable>
        ) : null}
        <View className="flex-1">
          <Text className="text-xl font-extrabold text-white">{title}</Text>
          {subtitle ? (
            <Text className="text-xs text-gold-light">{subtitle}</Text>
          ) : null}
        </View>
        {right}
      </View>
      <View className="mt-2 h-1 w-12 rounded-full bg-gold" />
    </LinearGradient>
  );
}
