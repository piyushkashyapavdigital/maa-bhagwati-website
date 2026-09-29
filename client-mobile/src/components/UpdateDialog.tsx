import React, { useState } from 'react';
import { Modal, Text, View } from 'react-native';
import { PrimaryButton } from './PrimaryButton';
import { downloadUpdate, skipVersion, type RemoteVersion } from '../update';

export function UpdateDialog({
  remote,
  onLater,
}: {
  remote: RemoteVersion;
  onLater: () => void;
}) {
  const [started, setStarted] = useState(false);

  const start = async () => {
    setStarted(true);
    await downloadUpdate(remote);
  };

  const skip = async () => {
    await skipVersion(remote.versionCode);
    onLater();
  };

  return (
    <Modal visible transparent animationType="fade">
      <View className="flex-1 items-center justify-center bg-black/50 p-6">
        <View className="w-full rounded-3xl bg-white p-6">
          <Text className="text-center text-4xl">🎉</Text>
          <Text className="mt-3 text-center text-lg font-extrabold text-ink">
            New update available!
          </Text>
          <Text className="mt-1 text-center text-sm font-bold text-maroon">
            v{remote.versionName}
          </Text>
          {remote.notes ? (
            <Text className="mt-2 text-center text-xs leading-5 text-muted">
              {remote.notes}
            </Text>
          ) : null}
          {started ? (
            <Text className="mt-3 text-center text-xs leading-5 text-leaf">
              Downloading… when it finishes, tap the{'\n'}"Maa Bhagwati
              update" notification to install. ✅{'\n\n'}No notification? Open
              Files → Downloads → tap the maa-bhagwati APK file.
            </Text>
          ) : null}
          <View className="mt-5 gap-3">
            {!started ? (
              <PrimaryButton title="⬇ Download update" onPress={start} />
            ) : null}
            <PrimaryButton
              title={started ? 'Close' : 'Later'}
              variant="ghost"
              onPress={onLater}
            />
            {!started ? (
              <Text
                className="text-center text-xs font-bold text-muted"
                onPress={skip}
              >
                Skip this version
              </Text>
            ) : null}
          </View>
          <Text className="mt-3 text-center text-[11px] text-muted">
            Your cart and login are kept after updating.
          </Text>
        </View>
      </View>
    </Modal>
  );
}
