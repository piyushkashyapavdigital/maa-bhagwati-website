import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { GradientHeader } from '../components/GradientHeader';
import { Screen } from '../components/Screen';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme';

const MENU: {
  key: keyof RootStackParamList;
  title: string;
  subtitle: string;
  color: string;
}[] = [
  {
    key: 'Categories',
    title: 'Categories',
    subtitle: 'Shop sections & visibility',
    color: '#B91C1C',
  },
  {
    key: 'Banners',
    title: 'Banners',
    subtitle: 'Homepage promotional strips',
    color: '#EA580C',
  },
  {
    key: 'Messages',
    title: 'Messages',
    subtitle: 'Website contact enquiries',
    color: '#0284C7',
  },
  {
    key: 'Settings',
    title: 'Settings',
    subtitle: 'API URL, images, logout',
    color: '#7C3AED',
  },
];

export function MoreScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <Screen>
      <GradientHeader title="More" subtitle="Tools & settings " />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {MENU.map((m) => (
          <Pressable
            key={m.key}
            onPress={() => nav.navigate(m.key as never)}
            className="mb-3 flex-row items-center rounded-2xl border border-line bg-white p-4 shadow-sm active:opacity-80"
          >
            <View
              className="h-12 w-12 items-center justify-center rounded-2xl"
              style={{ backgroundColor: `${m.color}18` }}
            >
              <Text className="text-2xl" />
            </View>
            <View className="ml-3 flex-1">
              <Text className="text-base font-extrabold text-ink">{m.title}</Text>
              <Text className="text-xs text-muted">{m.subtitle}</Text>
            </View>
            <Text className="text-xl text-gold-dark">›</Text>
          </Pressable>
        ))}

        <View className="mt-4 items-center rounded-3xl border border-gold/40 bg-gold/10 p-6">
          <Text className="text-3xl"></Text>
          <Text className="mt-2 text-sm font-extrabold text-maroon">
            Maa Bhagwati Pooja Bhandar
          </Text>
          <Text className="mt-1 text-center text-xs text-muted">
            Admin app · data shared with the website{'\n'}via https://maa-bhagwati.vercel.app
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
