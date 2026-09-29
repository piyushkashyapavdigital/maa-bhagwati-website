import React from 'react';
import { Text, View } from 'react-native';
import { PrimaryButton } from './PrimaryButton';

export function EmptyState({
  title,
  message,
  actionTitle,
  onAction,
}: {
  title: string;
  message?: string;
  actionTitle?: string;
  onAction?: () => void;
}) {
  return (
    <View className="items-center px-8 py-12">
      <View className="h-20 w-20 items-center justify-center rounded-full bg-white shadow-sm">
        <Text className="text-4xl" />
      </View>
      <Text className="mt-4 text-lg font-extrabold text-maroon">{title}</Text>
      {message ? (
        <Text className="mt-1 text-center text-sm text-muted">{message}</Text>
      ) : null}
      {actionTitle && onAction ? (
        <PrimaryButton
          title={actionTitle}
          variant="gold"
          onPress={onAction}
          style={{ marginTop: 16 }}
        />
      ) : null}
    </View>
  );
}
