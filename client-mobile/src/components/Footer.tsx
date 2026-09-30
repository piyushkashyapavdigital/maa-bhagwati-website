import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Linking, Text, View } from 'react-native';
import { colors } from '../theme';
import type { RootStackParamList } from '../navigation/types';

/**
 * Global footer — render at the end of every main-tab screen.
 * Contact info + links, one place to change them.
 */
export function Footer() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <View className="mt-6 overflow-hidden rounded-3xl bg-maroon p-5">
      <View className="flex-row items-center gap-2">
        <View className="h-9 w-9 items-center justify-center rounded-full bg-gold/20">
          <Text className="text-xl">🪔</Text>
        </View>
        <View>
          <Text className="text-sm font-extrabold text-white">
            Maa Bhagwati Pooja Bhandar
          </Text>
          <Text className="text-[11px] text-gold-light">
            Shuddh samagri, ghar tak 🪔
          </Text>
        </View>
      </View>

      <View className="mt-4 flex-row gap-2">
        <Text
          className="flex-1 rounded-xl bg-white/15 px-3 py-2.5 text-center text-xs font-bold text-white"
          onPress={() => nav.navigate('Main', { screen: 'Shop' })}
        >
          🛍 Shop
        </Text>
        <Text
          className="flex-1 rounded-xl bg-white/15 px-3 py-2.5 text-center text-xs font-bold text-white"
          onPress={() => nav.navigate('Contact')}
        >
          📞 Contact
        </Text>
        <Text
          className="flex-1 rounded-xl bg-white/15 px-3 py-2.5 text-center text-xs font-bold text-white"
          onPress={() => nav.navigate('Main', { screen: 'Orders' })}
        >
          📦 Orders
        </Text>
      </View>

      <Text
        className="mt-3 text-center text-sm font-extrabold text-gold-light"
        onPress={() => Linking.openURL('tel:7986820055')}
      >
        📞 79868-20055 (10 AM – 8 PM)
      </Text>
      <Text className="mt-1 text-center text-[10px] text-white/60">
        © 2026 Maa Bhagwati Pooja Bhandar · Made with bhakti in Bharat
      </Text>
    </View>
  );
}
