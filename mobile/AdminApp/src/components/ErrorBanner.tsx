import React from 'react';
import { Text, View } from 'react-native';
import { PrimaryButton } from './PrimaryButton';

export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  if (!message) return null;
  return (
    <View className="mx-4 mb-3 rounded-2xl border border-ruby/30 bg-ruby/10 p-4">
      <Text className="text-sm font-semibold text-ruby">{message}</Text>
      {onRetry ? (
        <PrimaryButton title="Retry" variant="ghost" onPress={onRetry} style={{ marginTop: 8, alignSelf: 'flex-start' }} />
      ) : null}
    </View>
  );
}
