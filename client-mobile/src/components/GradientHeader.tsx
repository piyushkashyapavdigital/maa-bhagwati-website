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
      style={{ paddingTop: insets.top + 12, paddingBottom: 18, paddingHorizontal: 16 }}
    >
      <View className="flex-row items-center">
        {onBack ? (
          <Pressable
            onPress={onBack}
            hitSlop={12}
            className="mr-3 h-10 w-10 items-center justify-center rounded-full bg-white/15"
            accessibilityLabel="Go back"
          >
            <Text className="text-lg text-gold-light">‹</Text>
          </Pressable>
        ) : null}
        <View className="flex-1">
          <Text className="text-2xl font-extrabold text-white">{title}</Text>
          {subtitle ? (
            <Text className="mt-0.5 text-sm text-gold-light">{subtitle}</Text>
          ) : null}
        </View>
        {right}
      </View>
      <View className="mt-3 h-1 w-16 rounded-full bg-gold" />
    </LinearGradient>
  );
}
