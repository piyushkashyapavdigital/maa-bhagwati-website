import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useCart } from '../cart';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { GradientHeader } from '../components/GradientHeader';
import { LoadingView } from '../components/LoadingView';
import { ProductCard } from '../components/ProductCard';
import { Screen } from '../components/Screen';
import { UpdateDialog } from '../components/UpdateDialog';
import { useShop } from '../shop';
import { INR, colorForIndex, colors } from '../theme';
import { fetchRemoteVersion, isUpdateAvailable, type RemoteVersion } from '../update';
import type { RootStackParamList } from '../navigation/types';

export function HomeScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { ready, error, categories, products, banners, refresh } = useShop();
  const { count } = useCart();
  const [refreshing, setRefreshing] = React.useState(false);
  const [update, setUpdate] = React.useState<RemoteVersion | null>(null);

  React.useEffect(() => {
    fetchRemoteVersion().then((r) => {
      if (isUpdateAvailable(r)) setUpdate(r);
    });
  }, []);

  const featured = useMemo(() => products.slice(0, 10), [products]);

  if (!ready) {
    return (
      <Screen>
        <GradientHeader title="Maa Bhagwati" subtitle="Pooja Bhandar 🪔" />
        <LoadingView label="Loading samagri…" />
      </Screen>
    );
  }

  return (
    <Screen>
      {update ? (
        <UpdateDialog remote={update} onLater={() => setUpdate(null)} />
      ) : null}
      <GradientHeader
        title="Maa Bhagwati"
        subtitle="Pooja Bhandar 🪔"
        right={
          <Pressable
            onPress={() => nav.navigate('Main', { screen: 'Cart' })}
            className="relative h-10 w-10 items-center justify-center rounded-full bg-white/20"
          >
            <Text className="text-xl">🛒</Text>
            {count > 0 ? (
              <View className="absolute -right-1 -top-1 min-w-5 items-center rounded-full bg-gold px-1">
                <Text className="text-[10px] font-extrabold text-maroon">
                  {count}
                </Text>
              </View>
            ) : null}
          </Pressable>
        }
      />
      <FlatList
        data={[]}
        renderItem={() => null}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={async () => {
              setRefreshing(true);
              await refresh();
              setRefreshing(false);
            }}
            tintColor={colors.maroon}
          />
        }
        ListHeaderComponent={
          <View>
            <ErrorBanner message={error} onRetry={refresh} />

            {/* Banners (managed in admin app) */}
            {banners.length > 0 ? (
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                className="mb-5"
              >
                {banners.map((b) => (
                  <View
                    key={b.id}
                    className="mr-2.5 h-40 overflow-hidden rounded-2xl border border-line bg-white"
                    style={{ width: 300 }}
                  >
                    {b.image ? (
                      <Image
                        source={{ uri: b.image }}
                        className="h-full w-full"
                        resizeMode="cover"
                      />
                    ) : null}
                    {b.title ? (
                      <View className="absolute bottom-2 left-2 rounded-lg bg-black/50 px-2 py-1">
                        <Text className="text-xs font-bold text-white">
                          {b.title}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                ))}
              </ScrollView>
            ) : null}

            {/* Shop by category */}
            <Text className="mb-2 px-1 text-sm font-extrabold uppercase tracking-wide text-maroon">
              Shop by category
            </Text>
            <View className="mb-5 flex-row flex-wrap gap-2">
              {categories.map((c, i) => {
                const n = products.filter(
                  (p) => (p.category_id ?? p.categoryId) === c.id,
                ).length;
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => nav.navigate('Category', { slug: c.slug })}
                    className="rounded-2xl border border-line bg-white px-4 py-3"
                    style={{
                      borderLeftWidth: 4,
                      borderLeftColor: colorForIndex(i),
                      minWidth: '47%',
                      flexGrow: 1,
                    }}
                  >
                    <Text className="text-sm font-extrabold text-ink">
                      {c.name}
                    </Text>
                    <Text className="text-[11px] text-muted">{n} items</Text>
                  </Pressable>
                );
              })}
            </View>

            {/* Featured */}
            <View className="mb-2 flex-row items-center justify-between px-1">
              <Text className="text-sm font-extrabold uppercase tracking-wide text-maroon">
                Featured samagri ✨ New
              </Text>
              <Text
                className="text-xs font-bold text-gold-dark"
                onPress={() => nav.navigate('Main', { screen: 'Shop' })}
              >
                View all →
              </Text>
            </View>
            {featured.length === 0 ? (
              <EmptyState
                title="No products yet"
                message="Pull down to refresh."
              />
            ) : (
              <View className="flex-row flex-wrap gap-2.5">
                {featured.map((p) => (
                  <View key={p.id} style={{ width: '48%' }}>
                    <ProductCard product={p} />
                  </View>
                ))}
              </View>
            )}

            {/* Trust strip */}
            <View className="mt-5 flex-row gap-2">
              {[
                { icon: '🕉', label: 'Shuddh Samagri' },
                { icon: '🚚', label: 'Ghar Tak Delivery' },
                { icon: '🤝', label: 'Vishwas ka Saath' },
              ].map((b) => (
                <View
                  key={b.label}
                  className="flex-1 items-center rounded-2xl border border-line bg-white p-3"
                >
                  <Text className="text-xl">{b.icon}</Text>
                  <Text className="mt-1 text-center text-[10px] font-bold text-muted">
                    {b.label}
                  </Text>
                </View>
              ))}
            </View>

            <View className="mt-5 items-center rounded-2xl bg-cream p-4">
              <Text className="text-xs text-muted">
                Free delivery above {INR(500)} · 🚚 ₹70 below
              </Text>
            </View>
          </View>
        }
      />
    </Screen>
  );
}
