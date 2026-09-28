import React from 'react';
import { StatusBar, View } from 'react-native';

export function Screen({
  children,
  edges = ['top'],
}: {
  children: React.ReactNode;
  edges?: ('top' | 'bottom')[];
}) {
  return (
    <View className="flex-1 bg-cream">
      <StatusBar barStyle="light-content" />
      {children}
    </View>
  );
}
