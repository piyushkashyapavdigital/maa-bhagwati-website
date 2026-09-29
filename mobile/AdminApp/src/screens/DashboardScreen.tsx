import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
import { api } from '../api';
import { BarChart } from '../components/BarChart';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { GradientHeader } from '../components/GradientHeader';
import { LoadingView } from '../components/LoadingView';
import { Screen } from '../components/Screen';
import { StatCard } from '../components/StatCard';
import { StatusBadge } from '../components/StatusBadge';
import { UpdateDialog } from '../components/UpdateDialog';
import { INR, colors, formatDate } from '../theme';
import { fetchRemoteVersion, getSkippedCode, isUpdateAvailable, type RemoteVersion } from '../update';
import type { RootStackParamList } from '../navigation/types';
import type { StatsPayload } from '../types';

export function DashboardScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [update, setUpdate] = useState<RemoteVersion | null>(null);

  const load = useCallback(async () => {
    setError('');
    try {
      const res = await api.get<{ stats: StatsPayload }>('/api/admin/stats');
      setStats(res.stats);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load stats');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    load();
    Promise.all([fetchRemoteVersion(), getSkippedCode()]).then(([r, skipped]) => {
      if (isUpdateAvailable(r) && r!.versionCode !== skipped) setUpdate(r);
    });
  }, [load]);

  const onRefresh = () => {
    setRefreshing(true);
    load();
  };

  if (loading && !stats) {
    return (
      <Screen>
        <GradientHeader title="Dashboard" subtitle="Shubh din " />
        <LoadingView label="Fetching shop stats" />
      </Screen>
    );
  }

  const t = stats?.totals;
  const week = stats?.revenueSeries.slice(-7) ?? [];

  return (
    <Screen>
      {update ? (
        <UpdateDialog remote={update} onLater={() => setUpdate(null)} />
      ) : null}
      <GradientHeader
        title="Dashboard"
        subtitle={new Date().toLocaleDateString('en-IN', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        })}
        right={
          <View className="h-10 w-10 items-center justify-center rounded-full bg-gold">
            <Text className="text-xl"></Text>
          </View>
        }
      />
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.maroon} />
        }
      >
        <ErrorBanner message={error} onRetry={load} />

        {t ? (
          <>
            <View className="mb-3 flex-row gap-3">
              <StatCard
                label="Revenue"
                value={INR(t.revenue)}
                caption="excl. failed"
                color={colors.maroon}
              />
              <StatCard
                label="Orders"
                value={String(t.orders)}
                caption={`${t.customers} customers`}
                color={colors.sky}
              />
            </View>
            <View className="mb-3 flex-row gap-3">
              <StatCard
                label="Products"
                value={String(t.products)}
                caption={`${t.activeProducts} live · ${t.categories} cats`}
                color={colors.teal}
              />
              <StatCard
                label="Alerts"
                value={String(stats!.lowStock.length + t.unreadMessages)}
                caption={`${stats!.lowStock.length} low stock · ${t.unreadMessages} msgs`}
                color={colors.violet}
              />
            </View>

            <View className="mb-3 rounded-2xl border border-line bg-white p-4">
              <Text className="mb-3 text-sm font-extrabold uppercase tracking-wide text-maroon">
                Last 7 days revenue
              </Text>
              <BarChart
                data={week.map((d) => ({
                  label: d.date.slice(8),
                  value: d.revenue,
                }))}
                height={110}
                color={colors.gold}
              />
            </View>

            {stats!.lowStock.length > 0 ? (
              <View className="mb-3 rounded-2xl border border-mango/40 bg-mango/10 p-4">
                <Text className="mb-2 text-sm font-extrabold text-mango">
                   Low stock ( 5)
                </Text>
                {stats!.lowStock.map((p) => (
                  <View
                    key={p.id}
                    className="flex-row items-center justify-between py-1.5"
                  >
                    <Text className="text-sm font-semibold text-ink">
                      {p.emoji} {p.name}
                    </Text>
                    <Text className="text-sm font-bold text-ruby">
                      {p.stock} {p.unit}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}

            <View className="rounded-2xl border border-line bg-white p-4">
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="text-sm font-extrabold uppercase tracking-wide text-maroon">
                  Recent orders
                </Text>
                <Text
                  className="text-xs font-bold text-gold-dark"
                  onPress={() => nav.navigate('Main', { screen: 'Orders' })}
                >
                  View all 
                </Text>
              </View>
              {stats!.recentOrders.length === 0 ? (
                <EmptyState title="No orders yet" message="Orders from the website will appear here." />
              ) : (
                stats!.recentOrders.map((o) => (
                  <View
                    key={o.id}
                    className="flex-row items-center justify-between border-b border-line py-3 last:border-0"
                  >
                    <View className="flex-1 pr-3">
                      <Text className="text-sm font-bold text-ink">{o.customerName}</Text>
                      <Text className="text-xs text-muted">
                        {formatDate(o.date)} · {o.itemsCount} item{o.itemsCount === 1 ? '' : 's'}
                      </Text>
                    </View>
                    <View className="items-end gap-1">
                      <Text className="text-sm font-extrabold text-maroon">{INR(o.total)}</Text>
                      <StatusBadge status={o.status} />
                    </View>
                  </View>
                ))
              )}
            </View>
          </>
        ) : (
          <EmptyState title="No stats" message="Is the API running?" />
        )}
      </ScrollView>
    </Screen>
  );
}
