import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { api } from '../api';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { GradientHeader } from '../components/GradientHeader';
import { LoadingView } from '../components/LoadingView';
import { Screen } from '../components/Screen';
import { StatusBadge } from '../components/StatusBadge';
import type { RootStackParamList } from '../navigation/types';
import { INR, colors, formatDate } from '../theme';
import { ORDER_STATUSES, type Order, type OrderStatus } from '../types';

type Filter = 'All' | OrderStatus;

export function OrdersScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filter, setFilter] = useState<Filter>('All');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      const res = await api.get<{ orders: Order[] }>('/api/admin/orders');
      setOrders(res.orders);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load orders');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const unsub = nav.addListener('focus', load);
    return unsub;
  }, [nav, load]);

  const filtered = useMemo(
    () => (filter === 'All' ? orders : orders.filter((o) => o.status === filter)),
    [orders, filter]
  );

  const counts = useMemo(() => {
    const m: Record<string, number> = { All: orders.length };
    for (const s of ORDER_STATUSES) {
      m[s] = orders.filter((o) => o.status === s).length;
    }
    return m;
  }, [orders]);

  if (loading && !orders.length) {
    return (
      <Screen>
        <GradientHeader title="Orders" subtitle="Fulfilment queue" />
        <LoadingView label="Loading orders…" />
      </Screen>
    );
  }

  const filters: Filter[] = ['All', ...ORDER_STATUSES];

  return (
    <Screen>
      <GradientHeader
        title="Orders"
        subtitle={`${orders.length} total · ${counts['Failed'] ?? 0} failed`}
      />
      <View className="flex-row flex-wrap gap-2 px-4 pt-4">
        {filters.map((f) => {
          const active = filter === f;
          return (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              className={`rounded-full border px-3 py-1.5 ${
                active ? 'border-maroon bg-maroon' : 'border-line bg-white'
              }`}
            >
              <Text
                className={`text-xs font-bold ${active ? 'text-white' : 'text-muted'}`}
              >
                {f} ({counts[f] ?? 0})
              </Text>
            </Pressable>
          );
        })}
      </View>

      <ErrorBanner message={error} onRetry={load} />

      <FlatList
        data={filtered}
        keyExtractor={(o) => o.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor={colors.maroon}
          />
        }
        ListEmptyComponent={
          <EmptyState title="No orders here" message="Orders placed on the website will show up." />
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => nav.navigate('OrderDetail', { id: item.id })}
            className="mb-3 rounded-2xl border border-line bg-white p-4 shadow-sm active:opacity-80"
          >
            <View className="flex-row items-center justify-between">
              <Text className="text-sm font-extrabold text-ink">{item.customer.name}</Text>
              <StatusBadge status={item.status} />
            </View>
            <Text className="mt-1 text-xs text-muted">
              {formatDate(item.date)} · {item.items.length} item{item.items.length === 1 ? '' : 's'} ·
              {item.customer.city}
            </Text>
            <View className="mt-2 flex-row items-center justify-between">
              <Text className="text-xs text-muted">#{item.id}</Text>
              <Text className="text-base font-extrabold text-maroon">{INR(item.total)}</Text>
            </View>
          </Pressable>
        )}
      />
    </Screen>
  );
}
