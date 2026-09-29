import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import React, { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { EmptyState } from '../components/EmptyState';
import { GradientHeader } from '../components/GradientHeader';
import { LoadingView } from '../components/LoadingView';
import { ProductCard } from '../components/ProductCard';
import { Screen } from '../components/Screen';
import { useShop } from '../shop';
import type { RootStackParamList } from '../navigation/types';

type R = RouteProp<RootStackParamList, 'Category'>;

export function CategoryScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<R>();
  const { ready, categoryBySlug, productsIn } = useShop();
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'name'>('default');

  const category = categoryBySlug(params.slug);
  const list = useMemo(() => {
    const arr = category ? [...productsIn(category.id)] : [];
    if (sortBy === 'price-asc') arr.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-desc') arr.sort((a, b) => b.price - a.price);
    if (sortBy === 'name') arr.sort((a, b) => a.name.localeCompare(b.name));
    return arr;
  }, [category, productsIn, sortBy]);

  if (!ready) {
    return (
      <Screen>
        <GradientHeader title="…" onBack={() => nav.goBack()} />
        <LoadingView label="Loading…" />
      </Screen>
    );
  }

  return (
    <Screen>
      <GradientHeader
        title={category?.name ?? 'Not found'}
        subtitle={`${list.length} items`}
        onBack={() => nav.goBack()}
      />
      <View className="flex-row gap-2 px-4 pt-3">
        {(
          [
            ['default', 'Default'],
            ['price-asc', 'Price ↑'],
            ['price-desc', 'Price ↓'],
            ['name', 'A–Z'],
          ] as const
        ).map(([v, label]) => (
          <Text
            key={v}
            onPress={() => setSortBy(v)}
            className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
              sortBy === v
                ? 'border-maroon bg-maroon text-white'
                : 'border-line bg-white text-muted'
            }`}
          >
            {label}
          </Text>
        ))}
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {list.length === 0 ? (
          <EmptyState title="Empty category" message="Items coming soon." />
        ) : (
          <View className="flex-row flex-wrap gap-2.5">
            {list.map((p) => (
              <View key={p.id} style={{ width: '48%' }}>
                <ProductCard product={p} />
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
