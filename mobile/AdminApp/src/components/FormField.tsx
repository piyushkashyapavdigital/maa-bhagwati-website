import React from 'react';
import { Text, TextInput, TextInputProps, View } from 'react-native';

export function FormField({
  label,
  error,
  ...input
}: TextInputProps & { label: string; error?: string }) {
  return (
    <View className="mb-4">
      <Text className="mb-1.5 text-sm font-bold text-maroon">{label}</Text>
      <TextInput
        placeholderTextColor="#A8A29E"
        className="rounded-xl border border-line bg-white px-4 py-3 text-base text-ink"
        {...input}
      />
      {error ? <Text className="mt-1 text-xs font-semibold text-ruby">{error}</Text> : null}
    </View>
  );
}
