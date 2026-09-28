import React from 'react';
import { Text, View } from 'react-native';
import { statusColors } from '../theme';

export function StatusBadge({ status }: { status: string }) {
  const color = statusColors[status] ?? '#78716C';
  return (
    <View
      className="rounded-full px-2.5 py-1"
      style={{ backgroundColor: `${color}22` }}
    >
      <Text className="text-[11px] font-bold" style={{ color }}>
        {status}
      </Text>
    </View>
  );
}
