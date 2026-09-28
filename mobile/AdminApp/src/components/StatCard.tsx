import React from 'react';
import { Text, View } from 'react-native';

export function StatCard({
  label,
  value,
  caption,
  color,
}: {
  label: string;
  value: string;
  caption?: string;
  color: string;
}) {
  return (
    <View
      className="flex-1 rounded-2xl p-4 shadow-sm"
      style={{ backgroundColor: color }}
    >
      <View className="flex-row items-center justify-between">
        <Text className="text-xs font-semibold uppercase tracking-wide text-white/80">
          {label}
        </Text>
        <Text className="text-lg" />
      </View>
      <Text className="mt-2 text-2xl font-extrabold text-white">{value}</Text>
      {caption ? (
        <Text className="mt-0.5 text-xs text-white/75">{caption}</Text>
      ) : null}
    </View>
  );
}
