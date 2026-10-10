import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Linking,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BannerSlider } from '../components/BannerSlider';
import { ErrorBanner } from '../components/ErrorBanner';
import { Footer } from '../components/Footer';
import { LoadingView } from '../components/LoadingView';
import { ProductCard } from '../components/ProductCard';
import { Screen } from '../components/Screen';
import { SmoothPressable } from '../components/SmoothPressable';
import { UpdateDialog } from '../components/UpdateDialog';
import { useShop } from '../shop';
import { INR, colors } from '../theme';
import { dealOf } from '../types';
import { fetchRemoteVersion, getSkippedCode, isUpdateAvailable, type RemoteVersion } from '../update';
import type { RootStackParamList } from '../navigation/types';

// Preset Category Icons & Accent Colors for the 4 App Categories
const CATEGORY_META: Record<string, { icon: string; bg: string; border: string }> = {
  'mukhya-pooja-samagri': {
    icon: '🌸',
    bg: '#FDF2F8',
    border: '#F472B6',
  },
  'rudrabhishek-samagri': {
    icon: '🪨',
    bg: '#F0FDFA',
    border: '#2DD4BF',
  },
  'havan-samagri': {
    icon: '🔥',
    bg: '#FFF7ED',
    border: '#FB923C',
  },
  'pooja-bartan-aavashyak-saman': {
    icon: '🏺',
    bg: '#FEFCE8',
    border: '#FACC15',
  },
};

export function HomeScreen() {
  const insets = useSafeAreaInsets();
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { ready, error, categories, products, banners, refresh } = useShop();
  const [refreshing, setRefreshing] = useState(false);
  const [update, setUpdate] = useState<RemoteVersion | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Live countdown to midnight for Deal of the Day
  const [timer, setTimer] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date(now);
      end.setHours(24, 0, 0, 0);
      const diff = Math.max(0, end.getTime() - now.getTime());
      setTimer({
        h: Math.floor(diff / 3_600_000),
        m: Math.floor((diff % 3_600_000) / 60_000),
        s: Math.floor((diff % 60_000) / 1000),
      });
    };
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  // Re-check on every Home visit (not just first mount).
  useFocusEffect(
    useCallback(() => {
      let alive = true;
      Promise.all([fetchRemoteVersion(), getSkippedCode()]).then(([r, skipped]) => {
        if (alive && isUpdateAvailable(r) && r!.versionCode !== skipped) setUpdate(r);
      });
      return () => {
        alive = false;
      };
    }, []),
  );

  const submitSearch = () => {
    nav.navigate('Main', {
      screen: 'Shop',
      params: { q: searchQuery.trim() },
    });
  };

  // Restrict quick categories strictly to top 4 categories from app
  const top4Categories = useMemo(() => categories.slice(0, 4), [categories]);

  // Real cover photo per category (first product image) — no emoji slop.
  const catCover = useMemo(() => {
    const m = new Map<string, string>();
    for (const p of products) {
      const cid = p.category_id ?? p.categoryId;
      if (cid && p.image && !m.has(cid)) m.set(cid, p.image);
    }
    return m;
  }, [products]);

  // Deal of the Day — real admin-managed deals (deal % in admin product editor).
  // Hidden entirely until at least one product has a deal.
  const dealProducts = useMemo(() => {
    return products
      .filter((p) => dealOf(p) > 0)
      .sort((a, b) => dealOf(b) - dealOf(a))
      .slice(0, 10);
  }, [products]);

  // Admin-managed banners per placement (uploaded in admin app → Banners).
  const topBanners = useMemo(
    () => banners.filter((b) => (b.placement ?? 'home_top') === 'home_top'),
    [banners],
  );
  const midBanners = useMemo(
    () => banners.filter((b) => b.placement === 'home_mid'),
    [banners],
  );

  const openBanner = (link?: string) => {
    if (!link) return;
    const m = /^\/category\/([\w-]+)\/?$/.exec(link.trim());
    if (m) {
      nav.navigate('Category', { slug: m[1]! });
      return;
    }
    if (/^https?:\/\//i.test(link)) Linking.openURL(link).catch(() => {});
  };

  // Trending items
  const trendingProducts = useMemo(() => products.slice(2, 10), [products]);

  if (!ready) {
    return (
      <Screen>
        <LoadingView label="Loading samagri…" />
      </Screen>
    );
  }

  return (
    <Screen>
      <View className="flex-1 bg-cream/40">
      {update ? (
        <UpdateDialog remote={update} onLater={() => setUpdate(null)} />
      ) : null}

      {/* ── RICH HEADER WITH GRADIENT (NO BREADCRUMB ON TOP LEFT) ── */}
      <LinearGradient
        colors={['#6B1D1D', '#4A1010', '#350B0B']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ paddingTop: insets.top + 2, paddingBottom: 8, paddingHorizontal: 14 }}
      >
        {/* Top Header Row — brand only */}
        <View className="flex-row items-center justify-between">
          {/* Left: Brand Logo & Title */}
          <View className="flex-row items-center gap-2">
            <View className="h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-white border border-gold/40">
              <Image
                source={require('../../assets/logo.png')}
                style={{ width: 30, height: 30 }}
                resizeMode="contain"
              />
            </View>
            <View>
              <Text className="text-sm font-extrabold tracking-wide text-white leading-tight">
                Maa Bhagwati
              </Text>
              <Text className="text-[10px] font-semibold text-gold-light leading-none">
                Pooja Bhandar
              </Text>
            </View>
          </View>
        </View>

        {/* Search Bar Input Row — submits to Shop */}
        <View className="mt-2 flex-row items-center rounded-full bg-white px-3 py-1.5 shadow-sm">
          <Text className="mr-2 text-sm text-muted">🔍</Text>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={submitSearch}
            returnKeyType="search"
            placeholder="Search for pooja items, samagri, idols..."
            placeholderTextColor="#A8A29E"
            className="flex-1 py-0 text-xs text-ink font-medium"
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')} className="ml-2">
              <Text className="text-sm text-muted">✕</Text>
            </Pressable>
          ) : null}
        </View>
      </LinearGradient>

      {/* ── MAIN SCROLLABLE CONTENT ── */}
      <FlatList
        data={[]}
        renderItem={() => null}
        contentContainerStyle={{ paddingBottom: 40 }}
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
          <View className="pt-3 px-4">
            <ErrorBanner message={error} onRetry={refresh} />

            {/* 1. ADMIN BANNERS (home_top) — smooth auto slider, max 10. */}
            {topBanners.length > 0 ? (
              <BannerSlider banners={topBanners} onPress={openBanner} />
            ) : null}

            {/* 2. TOP QUICK CATEGORY CIRCLES (ONLY 4 CATEGORIES) */}
            <View className="mb-5">
              <View className="flex-row items-center justify-between px-1 mb-2.5">
                <Text className="text-xs font-extrabold uppercase tracking-wide text-maroon">
                  Categories
                </Text>
                <Text
                  className="text-xs font-bold text-gold-dark"
                  onPress={() => nav.navigate('Main', { screen: 'Shop' })}
                >
                  View all →
                </Text>
              </View>

              <View className="flex-row items-start justify-between">
                {top4Categories.map((c) => (
                  <SmoothPressable
                    key={c.id}
                    onPress={() => nav.navigate('Category', { slug: c.slug })}
                    className="items-center overflow-hidden rounded-2xl border border-line/60 bg-maroon"
                    style={{ width: '23%', aspectRatio: 1 }}
                  >
                    {catCover.get(c.id) ? (
                      <Image
                        source={{ uri: catCover.get(c.id)! }}
                        className="absolute h-full w-full"
                        resizeMode="cover"
                      />
                    ) : (
                      <View className="absolute h-full w-full items-center justify-center bg-maroon">
                        <Text className="text-3xl">🪔</Text>
                      </View>
                    )}
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.75)']}
                      className="absolute bottom-0 left-0 right-0 justify-end p-1.5"
                      style={{ height: '55%' }}
                    >
                      <Text
                        className="text-[10px] font-extrabold text-white leading-tight"
                        numberOfLines={2}
                      >
                        {c.name}
                      </Text>
                    </LinearGradient>
                  </SmoothPressable>
                ))}
              </View>
            </View>

            {/* 3. SECONDARY FESTIVE ESSENTIALS BANNER */}
            <View className="mb-5 overflow-hidden rounded-2xl border border-maroon/20 bg-maroon p-3.5 shadow">
              <LinearGradient
                colors={['#8B1D1D', '#5E1010']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="flex-row items-center justify-between"
              >
                <View className="flex-1 pr-2">
                  <View className="flex-row items-center gap-1">
                    <Text className="text-xs">⚡</Text>
                    <Text className="text-xs font-bold text-gold-light">
                      Festive Essentials
                    </Text>
                  </View>
                  <Text className="text-sm font-extrabold text-white mt-0.5">
                    Special Collection
                  </Text>
                  <Text className="text-[10px] text-white/80">
                    Get everything for your upcoming poojas
                  </Text>

                  <Pressable
                    onPress={() => nav.navigate('Main', { screen: 'Shop' })}
                    className="mt-2.5 inline-flex self-start rounded-full bg-gold px-3 py-1.5"
                  >
                    <Text className="text-[10px] font-extrabold text-maroon">
                      Shop Collection →
                    </Text>
                  </Pressable>
                </View>
                <Text className="text-4xl">🎁</Text>
              </LinearGradient>
            </View>

            {/* 4. DEAL OF THE DAY (real admin deals, ends midnight).
                Hidden until a product has Deal % set in the admin app. */}
            {dealProducts.length > 0 ? (
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-3 px-1">
                <View className="flex-row items-center gap-2">
                  <Text className="text-sm">🔥</Text>
                  <Text className="text-sm font-extrabold text-ink">
                    Deal of the Day
                  </Text>
                  {/* Countdown Timer */}
                  <View className="flex-row items-center gap-1 ml-1">
                    <View className="rounded-md bg-ruby px-1.5 py-0.5">
                      <Text className="text-[10px] font-black text-white">
                        {String(timer.h).padStart(2, '0')}
                      </Text>
                    </View>
                    <Text className="text-[10px] font-bold text-ruby">:</Text>
                    <View className="rounded-md bg-ruby px-1.5 py-0.5">
                      <Text className="text-[10px] font-black text-white">
                        {String(timer.m).padStart(2, '0')}
                      </Text>
                    </View>
                    <Text className="text-[10px] font-bold text-ruby">:</Text>
                    <View className="rounded-md bg-ruby px-1.5 py-0.5">
                      <Text className="text-[10px] font-black text-white">
                        {String(timer.s).padStart(2, '0')}
                      </Text>
                    </View>
                  </View>
                </View>

                <Pressable onPress={() => nav.navigate('Main', { screen: 'Shop' })}>
                  <Text className="text-xs font-bold text-ruby">
                    View all →
                  </Text>
                </Pressable>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="-mx-4 px-4"
              >
                {dealProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    compact
                  />
                ))}
              </ScrollView>
            </View>
            ) : null}

            {/* 5. SHOP BY CATEGORY (2x2 GRID FOR THE 4 CATEGORIES) */}
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-3 px-1">
                <Text className="text-sm font-extrabold text-ink">
                  Shop by Category
                </Text>
                <Pressable onPress={() => nav.navigate('Main', { screen: 'Shop' })}>
                  <Text className="text-xs font-bold text-ruby">
                    View all →
                  </Text>
                </Pressable>
              </View>

              <View className="flex-row flex-wrap justify-between gap-y-3">
                {top4Categories.map((c) => {
                  const itemsCount = products.filter(
                    (p) => (p.category_id ?? p.categoryId) === c.id
                  ).length;
                  const cover = catCover.get(c.id);
                  return (
                    <SmoothPressable
                      key={c.id}
                      onPress={() => nav.navigate('Category', { slug: c.slug })}
                      className="w-[48%] overflow-hidden rounded-2xl border border-line/60 bg-maroon"
                      style={{ aspectRatio: 1 }}
                    >
                      {cover ? (
                        <Image
                          source={{ uri: cover }}
                          className="absolute h-full w-full"
                          resizeMode="cover"
                        />
                      ) : (
                        <View className="absolute h-full w-full items-center justify-center bg-maroon">
                          <Text className="text-5xl">🪔</Text>
                        </View>
                      )}
                      <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.8)']}
                        className="absolute bottom-0 left-0 right-0 justify-end p-3"
                        style={{ height: '50%' }}
                      >
                        <Text className="text-sm font-extrabold text-white" numberOfLines={2}>
                          {c.name}
                        </Text>
                        <Text className="text-[11px] font-semibold text-gold-light mt-0.5">
                          {itemsCount > 0 ? `${itemsCount} items →` : 'Explore →'}
                        </Text>
                      </LinearGradient>
                    </SmoothPressable>
                  );
                })}
              </View>
            </View>

            {/* 5b. ADMIN MID BANNERS (home_mid placement) */}
            {midBanners.length > 0 ? (
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                className="mb-6"
              >
                {midBanners.map((b) => (
                  <Pressable
                    key={b.id}
                    onPress={() => openBanner(b.link)}
                    className="mr-2.5 overflow-hidden rounded-2xl border border-line bg-white"
                    style={{ width: 280, height: 120 }}
                  >
                    <Image
                      source={{ uri: b.image }}
                      className="h-full w-full"
                      resizeMode="cover"
                    />
                    {b.title ? (
                      <View className="absolute bottom-2 left-2 rounded-lg bg-black/50 px-2 py-1">
                        <Text className="text-xs font-bold text-white">
                          {b.title}
                        </Text>
                      </View>
                    ) : null}
                  </Pressable>
                ))}
              </ScrollView>
            ) : null}

            {/* 6. TRENDING NOW SECTION */}
            <View className="mb-6">
              <View className="flex-row items-center justify-between mb-3 px-1">
                <View className="flex-row items-center gap-1.5">
                  <Text className="text-sm">🔥</Text>
                  <Text className="text-sm font-extrabold text-ink">
                    Trending Now
                  </Text>
                </View>
                <Pressable onPress={() => nav.navigate('Main', { screen: 'Shop' })}>
                  <Text className="text-xs font-bold text-ruby">
                    View all →
                  </Text>
                </Pressable>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                className="-mx-4 px-4"
              >
                {trendingProducts.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    showWishlist
                    compact
                  />
                ))}
              </ScrollView>
            </View>

            {/* FREE DELIVERY NOTICE */}
            <View className="mt-4 items-center rounded-2xl bg-cream border border-line/60 p-3.5">
              <Text className="text-xs font-medium text-muted">
                Free delivery within 2 km 🛵 · 🚚 ₹70 beyond
              </Text>
            </View>

            <Footer />
          </View>
        }
      />
      </View>
    </Screen>
  );
}
