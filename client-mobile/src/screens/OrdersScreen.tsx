import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { api } from '../api';
import { useAuth } from '../auth';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { Footer } from '../components/Footer';
import { GradientHeader } from '../components/GradientHeader';
import { LoadingView } from '../components/LoadingView';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { INR, colors, formatDate } from '../theme';
import type { Order } from '../types';
import type { RootStackParamList } from '../navigation/types';

export function OrdersScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setError('');
    try {
      const res = await api.myOrders();
      setOrders(res.orders ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      if (user) load();
      else setLoading(false);
    }, [user, load]),
  );

  if (!user) {
    return (
      <Screen>
        <GradientHeader title="My Orders" subtitle="Track parcels" />
        <View className="flex-1 items-center justify-center p-8">
          <Text className="text-center text-sm leading-6 text-muted">
            Sign in to see your orders and track delivery.
          </Text>
          <View className="mt-5 w-full">
            <PrimaryButton title="Sign in" onPress={() => nav.navigate('Auth')} />
          </View>
        </View>
      </Screen>
    );
  }

  if (loading) {
    return (
      <Screen>
        <GradientHeader title="My Orders" subtitle="Track parcels" />
        <LoadingView label="Loading orders…" />
      </Screen>
    );
  }

  return (
    <Screen>
      <GradientHeader
        title="My Orders"
        subtitle={`${orders.length} total`}
      />
      <ErrorBanner message={error} onRetry={load} />
      <FlatList
        data={orders}
        keyExtractor={(o) => o.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ListFooterComponent={orders.length > 0 ? <Footer /> : <></>}
        ListEmptyComponent={
          <EmptyState
            title="No orders yet"
            message="Your confirmed orders will appear here."
          />
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => nav.navigate('OrderDetail', { id: item.id })}
            className="mb-3 rounded-2xl border border-line bg-white p-4"
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-extrabold text-ink">
                {(item.items ?? []).reduce((s, i) => s + (i.qty ?? 0), 0)} items
              </Text>
              <Text
                className="rounded-full px-2.5 py-1 text-[10px] font-extrabold text-white"
                style={{
                  backgroundColor:
                    item.status === 'Delivered'
                      ? colors.leaf
                      : item.status === 'Failed'
                        ? colors.ruby
                        : colors.mango,
                }}
              >
                {item.status}
              </Text>
            </View>
            <Text className="mt-1 text-xs text-muted">
              {formatDate(item.date)} · #{String(item.id).slice(-8)}
            </Text>
            <Text className="mt-2 text-base font-extrabold text-maroon">
              {INR(item.total)}
            </Text>
          </Pressable>
        )}
      />
    </Screen>
  );
}
