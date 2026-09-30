import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';

const ITEMS: { screen: keyof MainTabParamList; icon: string; label: string }[] = [
  { screen: 'Dashboard', icon: '🏠', label: 'Home' },
  { screen: 'Products', icon: '🛍', label: 'Products' },
  { screen: 'Orders', icon: '📦', label: 'Orders' },
  { screen: 'More', icon: '☰', label: 'More' },
];

/**
 * Global bottom nav for stack screens (editor, detail, settings…).
 * Tab screens already have the system tab bar — don't add this there.
 */
export function TabFooter() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const insets = useSafeAreaInsets();

  return (
    <View
      className="flex-row border-t border-line bg-white px-2"
      style={{ paddingBottom: 6 + insets.bottom, paddingTop: 6 }}
    >
      {ITEMS.map((it) => {
        const active = route.name === it.screen;
        return (
          <Pressable
            key={it.screen}
            onPress={() => nav.navigate('Main', { screen: it.screen })}
            className="flex-1 items-center py-1"
          >
            <Text className="text-xl" style={{ opacity: active ? 1 : 0.45 }}>
              {it.icon}
            </Text>
            <Text
              className="mt-0.5 text-[10px] font-bold"
              style={{ color: active ? colors.maroon : '#A8A29E' }}
            >
              {it.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
