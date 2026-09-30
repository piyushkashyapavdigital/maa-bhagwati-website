import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, TextInput, View } from 'react-native';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { Footer } from '../components/Footer';
import { GradientHeader } from '../components/GradientHeader';
import { LoadingView } from '../components/LoadingView';
import { ProductCard } from '../components/ProductCard';
import { Screen } from '../components/Screen';
import { useShop } from '../shop';
import { colors } from '../theme';
import type { MainTabParamList, RootStackParamList } from '../navigation/types';

type R = RouteProp<MainTabParamList, 'Shop'>;

export function ShopScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<R>();
  const { ready, error, categories, products, refresh } = useShop();
  const [query, setQuery] = useState(route.params?.q ?? '');
  const [catFilter, setCatFilter] = useState('');

  // Home search lands here with ?q — pick it up every time.
  useEffect(() => {
    if (route.params?.q !== undefined) setQuery(route.params.q);
  }, [route.params?.q]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (catFilter && (p.category_id ?? p.categoryId) !== catFilter) return false;
      if (q && !`${p.name} ${p.unit}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [products, query, catFilter]);

  if (!ready) {
    return (
      <Screen>
        <GradientHeader title="Shop" subtitle="Sabhi samagri" />
        <LoadingView label="Loading shop…" />
      </Screen>
    );
  }

  return (
    <Screen>
      <GradientHeader title="Shop" subtitle={`${products.length} items`} />
      <View className="px-4 pt-3">
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Search samagri… (e.g. dhoop)"
          placeholderTextColor="#A8A29E"
          className="rounded-xl border border-line bg-white px-4 py-3 text-base text-ink"
        />
        <View className="mt-2 flex-row flex-wrap gap-2">
          <Text
            onPress={() => setCatFilter('')}
            className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
              !catFilter ? 'border-maroon bg-maroon text-white' : 'border-line bg-white text-muted'
            }`}
          >
            All
          </Text>
          {categories.map((c) => (
            <Text
              key={c.id}
              onPress={() => setCatFilter(catFilter === c.id ? '' : c.id)}
              className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
                catFilter === c.id
                  ? 'border-maroon bg-maroon text-white'
                  : 'border-line bg-white text-muted'
              }`}
            >
              {c.name}
            </Text>
          ))}
        </View>
      </View>
      <ErrorBanner message={error} onRetry={refresh} />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 40 }}>
        {filtered.length === 0 ? (
          <EmptyState title="No samagri found" message="Try another search." />
        ) : query.trim() ? (
          // Search mode — horizontal card index with images.
          <View>
            <Text className="mb-2 px-1 text-xs font-bold text-muted">
              {filtered.length} result{filtered.length === 1 ? '' : 's'} for “{query.trim()}”
            </Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={160}
              decelerationRate="fast"
              className="-mx-4 px-4"
            >
              {filtered.map((p) => (
                <View key={p.id} style={{ width: 150 }} className="mr-2.5">
                  <ProductCard product={p} compact />
                </View>
              ))}
            </ScrollView>
          </View>
        ) : (
          <View className="flex-row flex-wrap gap-2.5">
            {filtered.map((p) => (
              <View key={p.id} style={{ width: '48%' }}>
                <ProductCard product={p} />
              </View>
            ))}
          </View>
        )}
        <Footer />
      </ScrollView>
    </Screen>
  );
}
