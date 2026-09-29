import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useAuth } from '../auth';
import { useCart } from '../cart';
import { APP_VERSION_NAME } from '../config';
import { GradientHeader } from '../components/GradientHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import type { RootStackParamList } from '../navigation/types';

const ROWS: { title: string; sub: string; icon: string; go: 'Contact' | 'Orders' | 'Shop' }[] = [
  { title: 'My Orders', sub: 'Track parcels & history', icon: '📦', go: 'Orders' },
  { title: 'Shop Samagri', sub: 'Browse everything', icon: '🛍', go: 'Shop' },
  { title: 'Contact Us', sub: 'Bulk orders & help: 79868-20055', icon: '📞', go: 'Contact' },
];

export function AccountScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { ready, user, signOut } = useAuth();
  const { clear } = useCart();

  if (!ready || !user) {
    return (
      <Screen>
        <GradientHeader title="Account" subtitle="Namaste 🙏" />
        <View className="flex-1 items-center justify-center p-8">
          <View className="w-full">
            <PrimaryButton title="Sign in" onPress={() => nav.navigate('Auth')} />
          </View>
        </View>
      </Screen>
    );
  }

  return (
    <Screen>
      <GradientHeader
        title="Namaste 🙏"
        subtitle={user.email ?? 'Welcome'}
        right={
          <View className="h-10 w-10 items-center justify-center rounded-full bg-gold">
            <Text className="text-xl">🪔</Text>
          </View>
        }
      />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        <View className="mb-4 rounded-2xl border border-line bg-white p-4">
          <Text className="text-[11px] font-bold uppercase tracking-wide text-muted">
            Signed in as
          </Text>
          <Text className="mt-0.5 text-base font-extrabold text-ink">
            {user.email}
          </Text>
        </View>

        {ROWS.map((r) => (
          <Pressable
            key={r.title}
            onPress={() =>
              r.go === 'Orders'
                ? nav.navigate('Main', { screen: 'Orders' })
                : r.go === 'Shop'
                  ? nav.navigate('Main', { screen: 'Shop' })
                  : nav.navigate('Contact')
            }
            className="mb-2 flex-row items-center rounded-2xl border border-line bg-white p-4"
          >
            <Text className="text-2xl">{r.icon}</Text>
            <View className="ml-3 flex-1">
              <Text className="text-sm font-extrabold text-ink">{r.title}</Text>
              <Text className="text-xs text-muted">{r.sub}</Text>
            </View>
            <Text className="text-xl text-gold-dark">›</Text>
          </Pressable>
        ))}

        <View className="mt-4">
          <PrimaryButton
            title="Log out"
            variant="danger"
            onPress={async () => {
              await signOut();
              clear();
            }}
          />
        </View>
        <Text className="mt-6 text-center text-xs text-muted">
          Maa Bhagwati Pooja Bhandar · v{APP_VERSION_NAME}
        </Text>
      </ScrollView>
    </Screen>
  );
}
