import React from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCart } from '../cart';
import { INR, colors } from '../theme';
import type { Product } from '../types';
import type { RootStackParamList } from '../navigation/types';
import { Thumb } from './Thumb';

export function QtyStepper({ product }: { product: Product }) {
  const { getQuantity, setQuantity, increase, decrease } = useCart();
  const qty = getQuantity(product.id);

  if (qty === 0) {
    return (
      <Pressable
        onPress={() => setQuantity(product, 1)}
        className="rounded-xl px-4 py-2"
        style={{ backgroundColor: colors.maroon }}
      >
        <Text className="text-center text-xs font-extrabold text-white">ADD +</Text>
      </Pressable>
    );
  }
  return (
    <View
      className="flex-row items-center rounded-xl"
      style={{ backgroundColor: colors.maroon }}
    >
      <Pressable onPress={() => decrease(product.id)} className="px-3 py-2">
        <Text className="text-sm font-extrabold text-white">−</Text>
      </Pressable>
      <Text className="min-w-6 text-center text-xs font-extrabold text-white">
        {qty}
      </Text>
      <Pressable onPress={() => increase(product.id)} className="px-3 py-2">
        <Text className="text-sm font-extrabold text-white">+</Text>
      </Pressable>
    </View>
  );
}

export function ProductCard({ product }: { product: Product }) {
  const nav =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  return (
    <Pressable
      onPress={() => nav.navigate('Product', { id: product.id })}
      className="flex-1 rounded-2xl border border-line bg-white p-2.5"
    >
      <View className="mb-2 aspect-square items-center justify-center overflow-hidden rounded-xl bg-cream">
        {product.image ? (
          <Image
            source={{ uri: product.image }}
            className="h-full w-full"
            resizeMode="cover"
          />
        ) : (
          <Thumb image={product.image} size={64} />
        )}
      </View>
      <Text className="text-xs font-bold text-ink" numberOfLines={2}>
        {product.name}
      </Text>
      <Text className="mt-0.5 text-[10px] text-muted" numberOfLines={1}>
        {product.reference_quantity ?? product.referenceQuantity ?? product.unit}
      </Text>
      <View className="mt-1.5 flex-row items-center justify-between">
        <Text className="text-sm font-extrabold text-maroon">
          {INR(product.price)}
        </Text>
        <QtyStepper product={product} />
      </View>
    </Pressable>
  );
}
