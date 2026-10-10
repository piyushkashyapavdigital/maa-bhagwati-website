import React, { useState } from 'react';
import { Modal, Text, View } from 'react-native';
import { PrimaryButton } from './PrimaryButton';
import {
  downloadApk,
  installApk,
  skipVersion,
  type RemoteVersion,
} from '../update';

type Phase =
  | { kind: 'idle' }
  | { kind: 'downloading'; pct: number }
  | { kind: 'ready'; file: string }
  | { kind: 'failed'; detail: string };

export function UpdateDialog({
  remote,
  onLater,
}: {
  remote: RemoteVersion;
  onLater: () => void;
}) {
  const [phase, setPhase] = useState<Phase>({ kind: 'idle' });

  const start = async () => {
    setPhase({ kind: 'downloading', pct: 0 });
    try {
      const file = await downloadApk(remote, (received, total) => {
        const pct =
          total > 0 ? Math.min(99, Math.round((received / total) * 100)) : 0;
        setPhase({ kind: 'downloading', pct });
      });
      if (file) setPhase({ kind: 'ready', file });
      else setPhase({ kind: 'failed', detail: 'Download finished but file missing.' });
    } catch (e) {
      setPhase({
        kind: 'failed',
        detail: e instanceof Error ? e.message : 'Download crashed.',
      });
    }
  };

  const install = async () => {
    if (phase.kind !== 'ready') return;
    try {
      const ok = await installApk(phase.file);
      if (!ok) setPhase({ kind: 'failed', detail: 'Installer refused to open.' });
    } catch (e) {
      setPhase({
        kind: 'failed',
        detail: e instanceof Error ? e.message : 'Install crashed.',
      });
    }
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

          {phase.kind === 'downloading' ? (
            <View className="mt-4">
              <View className="h-3 w-full overflow-hidden rounded-full bg-cream">
                <View
                  className="h-full rounded-full bg-leaf"
                  style={{ width: `${phase.pct}%` }}
                />
              </View>
              <Text className="mt-2 text-center text-xs font-bold text-muted">
                Downloading… {phase.pct}%
              </Text>
            </View>
          ) : null}

          {phase.kind === 'ready' ? (
            <Text className="mt-3 text-center text-xs leading-5 text-leaf">
              ✅ Downloaded! Tap Install below.{"\n"}First time: Android asks
              "Allow install from this app" → allow → Install.
            </Text>
          ) : null}

          {phase.kind === 'failed' ? (
            <Text className="mt-3 text-center text-xs leading-5 text-ruby">
              {phase.detail} Tap Download to retry — or open Files → Downloads
              and tap the maa-bhagwati APK.
            </Text>
          ) : null}

          <View className="mt-5 gap-3">
            {phase.kind === 'idle' || phase.kind === 'failed' ? (
              <PrimaryButton
                title={phase.kind === 'failed' ? '↻ Retry download' : '⬇ Download update'}
                onPress={start}
              />
            ) : null}
            {phase.kind === 'ready' ? (
              <PrimaryButton title="📲 Install now" onPress={install} />
            ) : null}
            <PrimaryButton title="Later" variant="ghost" onPress={onLater} />
            {phase.kind === 'idle' ? (
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
