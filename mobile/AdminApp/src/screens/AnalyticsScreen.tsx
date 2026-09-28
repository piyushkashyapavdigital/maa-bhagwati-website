import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import { Modal, Pressable, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { api } from '../api';
import { BarChart } from '../components/BarChart';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { GradientHeader } from '../components/GradientHeader';
import { LoadingView } from '../components/LoadingView';
import { Screen } from '../components/Screen';
import { StatCard } from '../components/StatCard';
import type { RootStackParamList } from '../navigation/types';
import { INR, colorForIndex, colors } from '../theme';
import type { StatsPayload } from '../types';

const RANGES = [
  { label: '7D', days: 7 },
  { label: '14D', days: 14 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
];

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function AnalyticsScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [stats, setStats] = useState<StatsPayload | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [range, setRange] = useState(14);
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [showCustom, setShowCustom] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      let url = '/api/admin/stats';
      if (customFrom && customTo) {
        url += `?from=${customFrom}&to=${customTo}`;
      }
      const res = await api.get<{ stats: StatsPayload }>(url);
      setStats(res.stats);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [customFrom, customTo]);

  useEffect(() => {
    load();
  }, [load]);

  const applyCustom = () => {
    if (customFrom && customTo) {
      setShowCustom(false);
      load();
    }
  };

  const selectRange = (days: number) => {
    setRange(days);
    setCustomFrom('');
    setCustomTo('');
    setShowCustom(false);
    const to = new Date();
    const from = new Date(to.getTime() - (days - 1) * 86400000);
    setCustomFrom(formatDate(from));
    setCustomTo(formatDate(to));
  };

  if (loading && !stats) {
    return (
      <Screen>
        <GradientHeader title="Analytics" subtitle="Revenue insights" />
        <LoadingView label="Crunching numbers…" />
      </Screen>
    );
  }

  const s = stats!;
  const maxCat = Math.max(...s.categoryRevenue.map((c) => c.revenue), 1);
  const rangeLabel = customFrom && customTo
    ? `${customFrom} → ${customTo}`
    : `Last ${range} days`;

  return (
    <Screen>
      <GradientHeader title="Analytics" subtitle={rangeLabel} />
      <ScrollView
        className="flex-1"
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
      >
        <ErrorBanner message={error} onRetry={load} />

        {/* Range selector */}
        <View className="mb-4">
          <Text className="mb-2 px-1 text-sm font-extrabold uppercase tracking-wide text-maroon">
            Date range
          </Text>
          <View className="flex-row flex-wrap gap-2">
            {RANGES.map((r) => {
              const active = !customFrom && range === r.days;
              return (
                <Pressable
                  key={r.days}
                  onPress={() => selectRange(r.days)}
                  className="rounded-full border px-4 py-2"
                  style={{
                    borderColor: active ? colors.maroon : colors.line,
                    backgroundColor: active ? `${colors.maroon}18` : colors.paper,
                  }}
                >
                  <Text
                    className="text-xs font-bold"
                    style={{ color: active ? colors.maroon : colors.muted }}
                  >
                    {r.label}
                  </Text>
                </Pressable>
              );
            })}
            <Pressable
              onPress={() => setShowCustom(true)}
              className="rounded-full border px-4 py-2"
              style={{
                borderColor: customFrom ? colors.maroon : colors.line,
                backgroundColor: customFrom ? `${colors.maroon}18` : colors.paper,
              }}
            >
              <Text
                className="text-xs font-bold"
                style={{ color: customFrom ? colors.maroon : colors.muted }}
              >
                Custom
              </Text>
            </Pressable>
          </View>
        </View>

        {stats ? (
          <>
            <View className="mb-3 flex-row gap-3">
              <StatCard
                label="Revenue"
                value={INR(s.revenueSeries.reduce((a, d) => a + d.revenue, 0))}
                color={colors.maroon}
              />
              <StatCard
                label="Avg / order"
                value={
                  s.totals.orders
                    ? INR(Math.round(s.totals.revenue / Math.max(s.totals.orders - (s.ordersByStatus['Failed'] ?? 0), 1)))
                    : '₹0'
                }
                color={colors.teal}
              />
            </View>

            <View className="mb-3">
              <Text className="mb-2 px-1 text-sm font-extrabold uppercase tracking-wide text-maroon">
                Daily revenue ({rangeLabel})
              </Text>
              <BarChart
                data={s.revenueSeries.map((d) => ({
                  label: d.date.slice(5),
                  value: d.revenue,
                }))}
                height={130}
                color={colors.gold}
                emptyLabel="No sales in this period"
              />
            </View>

            <View className="mb-3 rounded-2xl border border-line bg-white p-4">
              <Text className="mb-3 text-sm font-extrabold uppercase tracking-wide text-maroon">
                Orders by status
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {Object.entries(s.ordersByStatus).map(([status, n]) => (
                  <View
                    key={status}
                    className="rounded-xl bg-cream px-3 py-2"
                    style={{ minWidth: 88 }}
                  >
                    <Text className="text-lg font-extrabold text-maroon">{n}</Text>
                    <Text className="text-[11px] font-semibold text-muted">{status}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View className="mb-3 rounded-2xl border border-line bg-white p-4">
              <Text className="mb-3 text-sm font-extrabold uppercase tracking-wide text-maroon">
                Top products (by qty)
              </Text>
              {s.topProducts.length === 0 ? (
                <Text className="text-sm text-muted">No non-failed sales yet.</Text>
              ) : (
                s.topProducts.map((p, i) => (
                  <View
                    key={p.id}
                    className="flex-row items-center justify-between border-b border-line py-2.5 last:border-0"
                  >
                    <View className="flex-row items-center flex-1 pr-3">
                      <View
                        className="mr-3 h-7 w-7 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${colorForIndex(i)}20` }}
                      >
                        <Text className="text-xs font-black" style={{ color: colorForIndex(i) }}>
                          {i + 1}
                        </Text>
                      </View>
                      <Text className="flex-1 text-sm font-bold text-ink" numberOfLines={1}>
                        {p.name}
                      </Text>
                    </View>
                    <View className="items-end">
                      <Text className="text-sm font-extrabold text-maroon">{INR(p.revenue)}</Text>
                      <Text className="text-[11px] text-muted">{p.qty} sold</Text>
                    </View>
                  </View>
                ))
              )}
            </View>

            <View className="rounded-2xl border border-line bg-white p-4">
              <Text className="mb-3 text-sm font-extrabold uppercase tracking-wide text-maroon">
                Revenue by category
              </Text>
              {s.categoryRevenue.length === 0 ? (
                <Text className="text-sm text-muted">Nothing sold yet.</Text>
              ) : (
                s.categoryRevenue.map((c, i) => {
                  const pct = Math.round((c.revenue / maxCat) * 100);
                  return (
                    <View key={c.categoryId} className="mb-3">
                      <View className="mb-1 flex-row justify-between">
                        <Text className="text-xs font-bold text-ink">{c.name}</Text>
                        <Text className="text-xs font-extrabold text-maroon">
                          {INR(c.revenue)}
                        </Text>
                      </View>
                      <View className="h-3 w-full overflow-hidden rounded-full bg-cream">
                        <View
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.max(pct, 4)}%`,
                            backgroundColor: colorForIndex(i),
                          }}
                        />
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </>
        ) : (
          <EmptyState title="No analytics" message="Is the API running?" />
        )}
      </ScrollView>

      {/* Custom date range modal */}
      <Modal visible={showCustom} transparent animationType="fade">
        <View className="flex-1 items-center justify-center bg-black/50 p-6">
          <View className="w-full rounded-3xl bg-white p-6">
            <Text className="mb-4 text-lg font-extrabold text-ink">Custom date range</Text>
            <Text className="mb-1 text-xs font-bold text-muted">From (YYYY-MM-DD)</Text>
            <TextInput
              value={customFrom}
              onChangeText={setCustomFrom}
              placeholder="2025-01-01"
              className="mb-3 rounded-xl border border-line bg-cream px-4 py-3 text-ink"
            />
            <Text className="mb-1 text-xs font-bold text-muted">To (YYYY-MM-DD)</Text>
            <TextInput
              value={customTo}
              onChangeText={setCustomTo}
              placeholder="2025-01-31"
              className="mb-4 rounded-xl border border-line bg-cream px-4 py-3 text-ink"
            />
            <View className="flex-row gap-3">
              <Pressable
                onPress={() => setShowCustom(false)}
                className="flex-1 rounded-xl border border-line bg-cream py-3"
              >
                <Text className="text-center text-sm font-bold text-muted">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={applyCustom}
                className="flex-1 rounded-xl py-3"
                style={{ backgroundColor: colors.maroon }}
              >
                <Text className="text-center text-sm font-bold text-white">Apply</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
