import React, { useEffect, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { onPushEvent, type PushEvent } from '../push';

/** Floating banner for foreground pushes. Renders above all screens. */
export function PushBanner({ onOpen }: { onOpen: (e: PushEvent) => void }) {
  const insets = useSafeAreaInsets();
  const [event, setEvent] = useState<PushEvent | null>(null);

  useEffect(() => onPushEvent(setEvent), []);

  useEffect(() => {
    if (!event) return;
    const t = setTimeout(() => setEvent(null), 8000);
    return () => clearTimeout(t);
  }, [event]);

  if (!event) return null;

  return (
    <View
      className="absolute left-4 right-4 z-50"
      style={{ top: insets.top + 8 }}
      pointerEvents="box-none"
    >
      <Pressable
        onPress={() => {
          onOpen(event);
          setEvent(null);
        }}
        className="rounded-2xl border border-gold/50 bg-maroon p-4 shadow-lg"
      >
        <View className="flex-row items-center">
          <Text className="mr-2 text-2xl">🔔</Text>
          <View className="flex-1">
            <Text className="text-sm font-extrabold text-white" numberOfLines={1}>
              {event.title}
            </Text>
            <Text className="text-xs text-gold-light" numberOfLines={2}>
              {event.body}
            </Text>
          </View>
          <Text className="ml-2 text-base text-gold-light">›</Text>
        </View>
      </Pressable>
    </View>
  );
}
