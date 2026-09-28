import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { PrimaryButton } from './PrimaryButton';

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmTitle = 'Confirm',
  destructive,
  loading,
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title: string;
  message?: string;
  confirmTitle?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View className="flex-1 items-center justify-center bg-black/50 px-8">
        <View className="w-full max-w-sm rounded-3xl border border-line bg-white p-6 shadow-lg">
          <View className="mb-3 h-1.5 w-12 rounded-full bg-gold" />
          <Text className="text-lg font-extrabold text-maroon">{title}</Text>
          {message ? (
            <Text className="mt-2 text-sm leading-5 text-muted">{message}</Text>
          ) : null}
          <View className="mt-6 gap-3">
            <PrimaryButton
              title={confirmTitle}
              variant={destructive ? 'danger' : 'primary'}
              loading={loading}
              onPress={onConfirm}
            />
            <PrimaryButton title="Cancel" variant="ghost" onPress={onCancel} disabled={loading} />
          </View>
        </View>
      </View>
    </Modal>
  );
}
