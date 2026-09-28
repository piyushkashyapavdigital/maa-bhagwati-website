import React, { useCallback, useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { api } from '../api';
import { ErrorBanner } from '../components/ErrorBanner';
import { GradientHeader } from '../components/GradientHeader';
import { LoadingView } from '../components/LoadingView';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { StatusBadge } from '../components/StatusBadge';
import type { RootStackParamList } from '../navigation/types';
import { INR, colors, formatDateTime } from '../theme';
import type { Order, OrderStatus } from '../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'OrderDetail'>;

const NEXT: Partial<Record<OrderStatus, { to: OrderStatus; label: string }[]>> = {
  Pending: [
    { to: 'Confirmed', label: 'Confirm order' },
    { to: 'Failed', label: 'Mark failed' },
  ],
  Confirmed: [
    { to: 'Shipped', label: 'Mark shipped' },
    { to: 'Failed', label: 'Mark failed' },
  ],
  Shipped: [{ to: 'Delivered', label: 'Mark delivered' }],
  Delivered: [],
  Failed: [{ to: 'Confirmed', label: 'Reactivate' }],
};

export function OrderDetailScreen({ navigation, route }: Props) {
  const { id } = route.params;
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      const res = await api.get<{ order: Order }>(`/api/admin/orders/${id}`);
      setOrder(res.order);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load order');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const setStatus = async (status: OrderStatus) => {
    setSaving(true);
    setError('');
    try {
      const res = await api.patch<{ order: Order }>(`/api/admin/orders/${id}`, { status });
      setOrder(res.order);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !order) {
    return (
      <Screen>
        <GradientHeader title="Order" onBack={() => navigation.goBack()} />
        <LoadingView label="Loading order" />
      </Screen>
    );
  }

  const actions = NEXT[order.status] ?? [];

  return (
    <Screen>
      <GradientHeader
        title={`Order #${order.id}`}
        subtitle={formatDateTime(order.date)}
        onBack={() => navigation.goBack()}
        right={<StatusBadge status={order.status} />}
      />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
        <ErrorBanner message={error} onRetry={load} />

        <View className="mb-4 rounded-2xl border border-line bg-white p-4">
          <Text className="mb-2 text-sm font-extrabold uppercase tracking-wide text-maroon">
            Customer
          </Text>
          <Text className="text-base font-bold text-ink">{order.customer.name}</Text>
          <Pressable
            onPress={() => Linking.openURL(`tel:${order.customer.phone}`)}
            className="mt-1"
          >
            <Text className="text-sm font-semibold text-sky underline">
               {order.customer.phone}
            </Text>
          </Pressable>
          {order.customer.email ? (
            <Text className="text-sm text-muted">{order.customer.email}</Text>
          ) : null}
          <Text className="mt-2 text-sm leading-5 text-muted">
            {order.customer.address1}
            {order.customer.address2 ? `, ${order.customer.address2}` : ''}
            {'\n'}
            {order.customer.city}, {order.customer.state}  {order.customer.pincode}
            {order.customer.landmark ? `\nLandmark: ${order.customer.landmark}` : ''}
          </Text>
          {order.customer.notes ? (
            <Text className="mt-2 rounded-xl bg-cream p-2 text-xs italic text-muted">
               {order.customer.notes}
            </Text>
          ) : null}
        </View>

        <View className="mb-4 rounded-2xl border border-line bg-white p-4">
          <Text className="mb-3 text-sm font-extrabold uppercase tracking-wide text-maroon">
            Items
          </Text>
          {order.items.map((item, i) => (
            <View
              key={`${item.id}-${i}`}
              className="flex-row items-center justify-between border-b border-line py-2.5 last:border-0"
            >
              <View className="flex-1 pr-3">
                <Text className="text-sm font-bold text-ink">{item.name}</Text>
                <Text className="text-xs text-muted">
                  {INR(item.price)} × {item.qty}
                </Text>
              </View>
              <Text className="text-sm font-extrabold text-maroon">
                {INR(item.price * item.qty)}
              </Text>
            </View>
          ))}
          <View className="mt-3 border-t border-line pt-3">
            <Row label="Subtotal" value={INR(order.subtotal)} />
            <Row label="Delivery" value={order.deliveryCharge ? INR(order.deliveryCharge) : 'Free'} />
            <View className="mt-2 flex-row justify-between">
              <Text className="text-base font-extrabold text-maroon">Total</Text>
              <Text className="text-base font-extrabold text-maroon">{INR(order.total)}</Text>
            </View>
          </View>
        </View>

        <View className="mb-4 rounded-2xl border border-line bg-white p-4">
          <Text className="mb-2 text-sm font-extrabold uppercase tracking-wide text-maroon">
            Payment
          </Text>
          <Text className="text-xs text-muted">Order ID: {order.rzpOrderId}</Text>
          {order.paymentId ? (
            <Text className="text-xs text-muted">Payment ID: {order.paymentId}</Text>
          ) : null}
        </View>

        {actions.length > 0 ? (
          <View className="gap-3">
            {actions.map((a) => (
              <PrimaryButton
                key={a.to}
                title={a.label}
                variant={a.to === 'Failed' ? 'danger' : a.to === 'Confirmed' ? 'primary' : 'gold'}
                loading={saving}
                onPress={() => setStatus(a.to)}
              />
            ))}
          </View>
        ) : (
          <View className="rounded-2xl border border-leaf/30 bg-leaf/10 p-4">
            <Text className="text-center text-sm font-bold text-leaf">
               Order {order.status.toLowerCase()}  no further actions
            </Text>
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-0.5">
      <Text className="text-sm text-muted">{label}</Text>
      <Text className="text-sm font-semibold text-ink">{value}</Text>
    </View>
  );
}
