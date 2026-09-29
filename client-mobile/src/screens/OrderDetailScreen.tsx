import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import React, { useEffect, useState } from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import { api } from '../api';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { GradientHeader } from '../components/GradientHeader';
import { LoadingView } from '../components/LoadingView';
import { Screen } from '../components/Screen';
import { Thumb } from '../components/Thumb';
import { INR, colors, formatDateTime } from '../theme';
import type { Order } from '../types';
import type { RootStackParamList } from '../navigation/types';

type R = RouteProp<RootStackParamList, 'OrderDetail'>;

export function OrderDetailScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<R>();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .myOrders()
      .then((res) => {
        setOrder((res.orders ?? []).find((o) => o.id === params.id) ?? null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed'))
      .finally(() => setLoading(false));
  }, [params.id]);

  if (loading) {
    return (
      <Screen>
        <GradientHeader title="Order" onBack={() => nav.goBack()} />
        <LoadingView label="Loading order…" />
      </Screen>
    );
  }

  if (!order) {
    return (
      <Screen>
        <GradientHeader title="Order" onBack={() => nav.goBack()} />
        <ErrorBanner message={error} />
        <EmptyState title="Not found" message="This order isn't on your account." />
      </Screen>
    );
  }

  const c = order.customer ?? ({} as Order['customer']);

  return (
    <Screen>
      <GradientHeader
        title={`Order ${order.status}`}
        subtitle={formatDateTime(order.date)}
        onBack={() => nav.goBack()}
      />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
        <View className="mb-3 rounded-2xl border border-line bg-white p-4">
          <Text className="mb-2 text-sm font-extrabold uppercase tracking-wide text-maroon">
            Items ({(order.items ?? []).length})
          </Text>
          {(order.items ?? []).map((i) => (
            <View key={i.id} className="mb-2 flex-row items-center">
              <View className="h-11 w-11 items-center justify-center overflow-hidden rounded-lg bg-cream">
                {i.image ? (
                  <Image source={{ uri: i.image }} className="h-full w-full" resizeMode="cover" />
                ) : (
                  <Thumb image={i.image} size={36} />
                )}
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-sm font-bold text-ink" numberOfLines={1}>
                  {i.name}
                </Text>
                <Text className="text-[11px] text-muted">
                  {i.qty} × {INR(i.price)}
                </Text>
              </View>
              <Text className="text-sm font-extrabold text-maroon">
                {INR(i.price * i.qty)}
              </Text>
            </View>
          ))}
          <View className="mt-2 border-t border-line pt-2">
            <View className="flex-row justify-between">
              <Text className="text-xs text-muted">Subtotal</Text>
              <Text className="text-xs font-bold">{INR(order.subtotal)}</Text>
            </View>
            <View className="flex-row justify-between">
              <Text className="text-xs text-muted">Delivery</Text>
              <Text className="text-xs font-bold">
                {order.deliveryCharge === 0 ? 'FREE 🎉' : INR(order.deliveryCharge)}
              </Text>
            </View>
            <View className="mt-1 flex-row justify-between">
              <Text className="text-sm font-extrabold">Total</Text>
              <Text className="text-base font-extrabold text-maroon">
                {INR(order.total)}
              </Text>
            </View>
          </View>
        </View>

        <View className="rounded-2xl border border-line bg-white p-4">
          <Text className="mb-2 text-sm font-extrabold uppercase tracking-wide text-maroon">
            Delivery address
          </Text>
          <Text className="text-sm font-bold text-ink">{c.name}</Text>
          <Text className="text-xs leading-5 text-muted">
            {c.address1}
            {c.address2 ? `, ${c.address2}` : ''}, {c.city}, {c.state} - {c.pincode}
            {'\n'}📞 {c.phone}
          </Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
