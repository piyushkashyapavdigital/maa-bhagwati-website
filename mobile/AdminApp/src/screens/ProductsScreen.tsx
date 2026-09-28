import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  TextInput,
  View,
} from 'react-native';
import { api } from '../api';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { GradientHeader } from '../components/GradientHeader';
import { LoadingView } from '../components/LoadingView';
import { Screen } from '../components/Screen';
import { Thumb } from '../components/Thumb';
import type { RootStackParamList } from '../navigation/types';
import { INR, categoryColorIndex, colorForIndex, colors } from '../theme';
import type { DBCategory, DBProduct } from '../types';

export function ProductsScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [categories, setCategories] = useState<DBCategory[]>([]);
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      const [p, c] = await Promise.all([
        api.get<{ products: DBProduct[] }>('/api/admin/products'),
        api.get<{ categories: DBCategory[] }>('/api/admin/categories'),
      ]);
      setProducts(p.products);
      setCategories(c.categories);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load products');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const unsub = nav.addListener('focus', load);
    return unsub;
  }, [nav, load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (catFilter && p.categoryId !== catFilter) return false;
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.unit.toLowerCase().includes(q)
      );
    });
  }, [products, query, catFilter]);

  if (loading && !products.length) {
    return (
      <Screen>
        <GradientHeader title="Products" subtitle="Manage catalogue" />
        <LoadingView label="Loading products" />
      </Screen>
    );
  }

  return (
    <Screen>
      <GradientHeader
        title="Products"
        subtitle={`${products.length} total · ${filtered.length} shown`}
        right={
          <Pressable
            onPress={() => nav.navigate('ProductEditor', {})}
            className="h-10 w-10 items-center justify-center rounded-full bg-gold"
            accessibilityLabel="Add product"
          >
            <Text className="text-xl font-black text-maroon">＋</Text>
          </Pressable>
        }
      />

      <View className="px-4 pt-4">
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search name, slug, unit"
          placeholderTextColor="#A8A29E"
          className="rounded-xl border border-line bg-white px-4 py-3 text-base text-ink"
        />
        <View className="mt-3 flex-row flex-wrap gap-2">
          <Chip
            label="All"
            active={catFilter === null}
            color={colors.maroon}
            onPress={() => setCatFilter(null)}
          />
          {categories.map((c, i) => (
            <Chip
              key={c.id}
              label={c.name}
              active={catFilter === c.id}
              color={colorForIndex(i)}
              onPress={() => setCatFilter(catFilter === c.id ? null : c.id)}
            />
          ))}
        </View>
      </View>

      <ErrorBanner message={error} onRetry={load} />

      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 96 }}
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
          <EmptyState
            title="No products found"
            message="Try another search, or add a new product."
            actionTitle="Add product"
            onAction={() => nav.navigate('ProductEditor', {})}
          />
        }
        renderItem={({ item }) => {
          const catIdx = categoryColorIndex(item.categoryId, categories);
          const cat = categories.find((c) => c.id === item.categoryId);
          const low = item.isActive && item.stock <= 5;
          return (
            <Pressable
              onPress={() => nav.navigate('ProductEditor', { id: item.id })}
              className="mb-3 flex-row items-center rounded-2xl border border-line bg-white p-3 shadow-sm active:opacity-80"
            >
              <Thumb image={item.image} color={`${colorForIndex(catIdx)}22`} />
              <View className="ml-3 flex-1">
                <View className="flex-row items-center gap-2">
                  <Text className="flex-1 text-base font-extrabold text-ink" numberOfLines={1}>
                    {item.name}
                  </Text>
                  {!item.isActive ? (
                    <View className="rounded-full bg-muted/15 px-2 py-0.5">
                      <Text className="text-[10px] font-bold text-muted">Hidden</Text>
                    </View>
                  ) : null}
                </View>
                <View className="mt-0.5 flex-row items-center gap-2">
                  <View
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: colorForIndex(catIdx) }}
                  />
                  <Text className="text-xs text-muted" numberOfLines={1}>
                    {cat?.name ?? item.categoryId} · {item.unit}
                  </Text>
                </View>
                <View className="mt-1 flex-row items-center gap-3">
                  <Text className="text-sm font-extrabold text-maroon">{INR(item.price)}</Text>
                  <Text
                    className={`text-xs font-bold ${low ? 'text-ruby' : 'text-leaf'}`}
                  >
                    {item.stock} in stock{low ? ' ' : ''}
                  </Text>
                </View>
              </View>
              <Text className="ml-2 text-xl text-gold-dark"></Text>
            </Pressable>
          );
        }}
      />

      <Pressable
        onPress={() => nav.navigate('ProductEditor', {})}
        className="absolute bottom-6 right-5 h-14 w-14 items-center justify-center rounded-full bg-maroon shadow-lg active:opacity-90"
        accessibilityLabel="Add product"
      >
        <Text className="text-2xl font-black text-gold">＋</Text>
      </Pressable>
    </Screen>
  );
}

function Chip({
  label,
  active,
  color,
  onPress,
}: {
  label: string;
  active: boolean;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="rounded-full border px-3 py-1.5"
      style={{
        borderColor: active ? color : colors.line,
        backgroundColor: active ? `${color}18` : colors.paper,
      }}
    >
      <Text className="text-xs font-bold" style={{ color: active ? color : colors.muted }}>
        {label}
      </Text>
    </Pressable>
  );
}
