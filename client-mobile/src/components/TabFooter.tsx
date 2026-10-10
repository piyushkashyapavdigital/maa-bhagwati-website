import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useCart } from '../cart';
import { colors } from '../theme';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';

const ITEMS: { screen: keyof MainTabParamList; icon: string; label: string }[] = [
  { screen: 'Home', icon: 'home', label: 'Home' },
  { screen: 'Shop', icon: 'grid-view', label: 'Shop' },
  { screen: 'Cart', icon: 'shopping-cart', label: 'Cart' },
  { screen: 'Orders', icon: 'receipt-long', label: 'Orders' },
  { screen: 'Account', icon: 'person', label: 'Account' },
];

/**
 * Global bottom nav for stack screens (category, product, checkout…).
 * Same icons + colors as the main tab bar. Tab screens already have
 * the system tab bar — don't add this there.
 */
export function TabFooter() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  const { count } = useCart();

  return (
    <View
      className="flex-row border-t border-line bg-white px-2"
      style={{ paddingBottom: 6 + insets.bottom, paddingTop: 6 }}
    >
      {ITEMS.map((it) => {
        const active = route.name === it.screen;
        const color = active ? colors.maroon : '#A8A29E';
        return (
          <Pressable
            key={it.screen}
            onPress={() => nav.navigate('Main', { screen: it.screen })}
            className="relative flex-1 items-center py-1"
          >
            <Icon name={it.icon} size={24} color={color} />
            {it.screen === 'Cart' && count > 0 ? (
              <View className="absolute right-4 top-0 min-w-4 items-center rounded-full bg-ruby px-1">
                <Text className="text-[9px] font-extrabold text-white">{count}</Text>
              </View>
            ) : null}
            <Text className="mt-0.5 text-[10px] font-bold" style={{ color }}>
              {it.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
