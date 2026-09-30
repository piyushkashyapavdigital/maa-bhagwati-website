import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import React from 'react';
import { Image, ScrollView, Text, View } from 'react-native';
import { EmptyState } from '../components/EmptyState';
import { GradientHeader } from '../components/GradientHeader';
import { ProductCard, QtyStepper } from '../components/ProductCard';
import { Screen } from '../components/Screen';
import { Thumb } from '../components/Thumb';
import { useShop } from '../shop';
import { INR, colors } from '../theme';
import { dealOf, dealTagOf, mrpOf } from '../types';
import type { RootStackParamList } from '../navigation/types';

type R = RouteProp<RootStackParamList, 'Product'>;

export function ProductScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<R>();
  const { productById, productsIn } = useShop();
  const product = productById(params.id);

  if (!product) {
    return (
      <Screen>
        <GradientHeader title="Product" onBack={() => nav.goBack()} />
        <EmptyState title="Not found" message="This item is unavailable." />
      </Screen>
    );
  }

  const related = productsIn(product.category_id ?? product.categoryId ?? '')
    .filter((p) => p.id !== product.id)
    .slice(0, 6);

  return (
    <Screen>
      <GradientHeader
        title={product.name}
        subtitle={`${product.reference_quantity ?? product.referenceQuantity ?? product.unit}`}
        onBack={() => nav.goBack()}
      />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
        <View className="mb-4 aspect-[4/3] items-center justify-center overflow-hidden rounded-3xl border border-line bg-white">
          {product.image ? (
            <Image
              source={{ uri: product.image }}
              className="h-full w-full"
              resizeMode="cover"
            />
          ) : (
            <Thumb image={product.image} size={120} />
          )}
        </View>

        <View className="mb-4 rounded-3xl border border-line bg-white p-5">
          <Text className="text-xl font-extrabold text-ink">{product.name}</Text>
          <Text className="mt-1 text-sm text-muted">
            {product.reference_quantity ?? product.referenceQuantity ?? product.unit}
            {'  ·  '}Stock: {product.stock > 0 ? `${product.stock}` : 'Out of stock'}
          </Text>
          <View className="mt-3 flex-row items-center justify-between">
            <View>
              <View className="flex-row items-center gap-2">
                <Text className="text-2xl font-extrabold text-maroon">
                  {INR(product.price)}
                </Text>
                {dealOf(product) ? (
                  <>
                    <Text className="text-sm text-muted line-through">
                      {INR(mrpOf(product))}
                    </Text>
                    <View className="rounded-md bg-teal px-1.5 py-0.5">
                      <Text className="text-[10px] font-extrabold text-white">
                        {dealTagOf(product)}
                      </Text>
                    </View>
                  </>
                ) : null}
              </View>
            </View>
            {product.stock > 0 ? (
              <QtyStepper product={product} />
            ) : (
              <Text className="text-sm font-bold text-ruby">Out of stock</Text>
            )}
          </View>
          <Text className="mt-3 text-xs leading-5 text-muted">
            Shuddh aur vishwasniya samagri, ghar tak delivery ke saath. 🚚 Free
            delivery above {INR(500)}.
          </Text>
        </View>

        {related.length > 0 ? (
          <View>
            <Text className="mb-2 px-1 text-sm font-extrabold uppercase tracking-wide text-maroon">
              You may also need
            </Text>
            <View className="flex-row flex-wrap gap-2.5">
              {related.map((p) => (
                <View key={p.id} style={{ width: '48%' }}>
                  <ProductCard product={p} />
                </View>
              ))}
            </View>
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
