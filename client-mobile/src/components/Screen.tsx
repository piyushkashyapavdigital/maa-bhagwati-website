import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export function Screen({
  children,
  edges = ['top', 'bottom'],
}: {
  children: React.ReactNode;
  edges?: ('top' | 'bottom')[];
}) {
  return (
    <SafeAreaView edges={edges} className="flex-1 bg-cream">
      <StatusBar barStyle="light-content" />
      {children}
    </SafeAreaView>
  );
}
