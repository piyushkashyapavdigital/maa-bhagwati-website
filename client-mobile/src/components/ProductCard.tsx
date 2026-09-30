import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCart } from '../cart';
import { INR, colors } from '../theme';
import { dealOf, dealTagOf, mrpOf } from '../types';
import type { Product } from '../types';
import type { RootStackParamList } from '../navigation/types';
import { SmoothPressable } from './SmoothPressable';
import { Thumb } from './Thumb';

export function QtyStepper({
  product,
  compact = false,
}: {
  product: Product;
  compact?: boolean;
}) {
  const { getQuantity, setQuantity, increase, decrease } = useCart();
  const qty = getQuantity(product.id);

  if (qty === 0) {
    return (
      <Pressable
        onPress={() => setQuantity(product, 1)}
        className={`items-center justify-center rounded-full bg-maroon ${
          compact ? 'h-7 w-7' : 'h-8 w-8'
        }`}
        style={{ backgroundColor: colors.maroon }}
        accessibilityLabel="Add to cart"
      >
        <Text className="text-center font-bold text-white">+</Text>
      </Pressable>
    );
  }
  return (
    <View
      className="flex-row items-center rounded-xl overflow-hidden"
      style={{ backgroundColor: colors.maroon }}
    >
      <Pressable onPress={() => decrease(product.id)} className="px-2 py-1">
        <Text className="text-xs font-extrabold text-white">−</Text>
      </Pressable>
      <Text className="min-w-4 text-center text-xs font-extrabold text-white">
        {qty}
      </Text>
      <Pressable onPress={() => increase(product.id)} className="px-2 py-1">
        <Text className="text-xs font-extrabold text-white">+</Text>
      </Pressable>
    </View>
  );
}

export interface ProductCardProps {
  product: Product;
  discountTag?: string;
  originalPrice?: number;
  showWishlist?: boolean;
  compact?: boolean;
}

export function ProductCard({
  product,
  discountTag,
  originalPrice,
  showWishlist = false,
  compact = false,
}: ProductCardProps) {
  const nav =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [isLiked, setIsLiked] = React.useState(false);

  // Admin-managed deal wins over ad-hoc props.
  const tag = discountTag ?? dealTagOf(product) ?? undefined;
  const mrp =
    originalPrice && originalPrice > product.price
      ? originalPrice
      : dealOf(product)
        ? mrpOf(product)
        : undefined;

  return (
    <SmoothPressable
      onPress={() => nav.navigate('Product', { id: product.id })}
      className={`rounded-2xl border border-line/70 bg-white shadow-sm ${
        compact ? 'w-36 p-2 mr-3' : 'w-full p-2.5'
      }`}
    >
      <View className="relative mb-2 aspect-square items-center justify-center overflow-hidden rounded-xl bg-cream/60">
        {tag ? (
          <View className="absolute top-1.5 left-1.5 z-10 rounded-md bg-teal px-1.5 py-0.5">
            <Text className="text-[9px] font-extrabold text-white uppercase tracking-tight">
              {tag}
            </Text>
          </View>
        ) : null}

        {showWishlist ? (
          <Pressable
            onPress={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
            }}
            className="absolute top-1.5 right-1.5 z-10 h-6 w-6 items-center justify-center rounded-full bg-white/80"
          >
            <Text className="text-[10px]">{isLiked ? '❤️' : '🤍'}</Text>
          </Pressable>
        ) : null}

        {product.image ? (
          <Image
            source={{ uri: product.image }}
            className="h-full w-full"
            resizeMode="cover"
          />
        ) : (
          <Thumb image={product.image} size={compact ? 48 : 64} />
        )}
      </View>

      <Text
        className="text-xs font-bold text-ink"
        numberOfLines={1}
      >
        {product.name}
      </Text>

      <Text className="mt-0.5 text-[10px] text-muted" numberOfLines={1}>
        {product.reference_quantity ?? product.referenceQuantity ?? product.unit ?? '1 pack'}
      </Text>

      <View className="mt-1.5 flex-row items-center justify-between">
        <View className="flex-row items-baseline gap-1">
          <Text className="text-xs font-extrabold text-maroon">
            {INR(product.price)}
          </Text>
          {mrp ? (
            <Text className="text-[10px] text-muted line-through">
              {INR(mrp)}
            </Text>
          ) : null}
        </View>
        <QtyStepper product={product} compact={compact} />
      </View>
    </SmoothPressable>
  );
}

