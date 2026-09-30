import React, { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  Text,
  View,
  type NativeScrollEvent,
  type NativeSyntheticEvent,
} from 'react-native';
import type { Banner } from '../api';

const MAX_BANNERS = 10;
const AUTOPLAY_MS = 4000;

function BannerSlide({
  item,
  width,
  height,
  onPress,
}: {
  item: Banner;
  width: number;
  height: number;
  onPress: (link?: string) => void;
}) {
  return (
    <Pressable
      onPress={() => onPress(item.link)}
      className="mr-2.5 overflow-hidden rounded-3xl border border-gold/30 bg-white"
      style={{ width, height }}
    >
      {item.image ? (
        // aspect enforced by the fixed frame + cover: ANY upload ratio
        // (long, square, wide) fills perfectly, no headache.
        <Image
          source={{ uri: item.image }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
        />
      ) : null}
      {item.title ? (
        <View className="absolute bottom-2 left-2 rounded-lg bg-black/50 px-2 py-1">
          <Text className="text-xs font-bold text-white">{item.title}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

/**
 * Smooth auto-playing banner slider (paging + dots).
 * Caps at 10 banners — extras are ignored.
 */
export function BannerSlider({
  banners,
  onPress,
  height = 170,
  cardWidth = 300,
}: {
  banners: Banner[];
  onPress: (link?: string) => void;
  height?: number;
  cardWidth?: number;
}) {
  const items = banners.slice(0, MAX_BANNERS);
  const ref = useRef<FlatList<Banner>>(null);
  const [index, setIndex] = useState(0);
  const paused = useRef(false);

  useEffect(() => {
    if (items.length < 2) return;
    const t = setInterval(() => {
      if (paused.current) return;
      setIndex((i) => {
        const next = (i + 1) % items.length;
        try {
          ref.current?.scrollToIndex({ index: next, animated: true });
        } catch {
          // race with unmount/layout — next tick recovers
        }
        return next;
      });
    }, AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [items.length]);

  if (items.length === 0) return null;

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    setIndex(Math.round(x / (cardWidth + 10)));
  };

  return (
    <View className="mb-4">
      <FlatList
        ref={ref}
        data={items}
        keyExtractor={(b) => b.id}
        horizontal
        pagingEnabled={false}
        snapToInterval={cardWidth + 10}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        onTouchStart={() => {
          paused.current = true;
        }}
        onTouchEnd={() => {
          paused.current = false;
        }}
        renderItem={({ item }) => (
          <BannerSlide
            item={item}
            width={cardWidth}
            height={height}
            onPress={onPress}
          />
        )}
      />
      {items.length > 1 ? (
        <View className="mt-2 flex-row items-center justify-center gap-1.5">
          {items.map((b, i) => (
            <View
              key={b.id}
              className={
                i === index
                  ? 'h-2 w-4 rounded-full bg-maroon'
                  : 'h-1.5 w-1.5 rounded-full bg-maroon/30'
              }
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}
