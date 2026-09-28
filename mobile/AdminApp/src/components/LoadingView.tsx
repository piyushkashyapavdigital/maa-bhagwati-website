import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export function LoadingView({ label = 'Loading…' }: { label?: string }) {
  return (
    <View className="flex-1 items-center justify-center py-16">
      <View className="h-14 w-14 items-center justify-center rounded-full bg-white shadow-sm">
        <ActivityIndicator color="#6B1D1D" />
      </View>
      <Text className="mt-3 text-sm font-semibold text-muted">{label}</Text>
    </View>
  );
}
