import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React from 'react';
import { FlatList, Image, Pressable, Text, View } from 'react-native';
import { useCart } from '../cart';
import { EmptyState } from '../components/EmptyState';
import { GradientHeader } from '../components/GradientHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { Thumb } from '../components/Thumb';
import { DELIVERY_CHARGE, FREE_DELIVERY_ABOVE } from '../config';
import { INR, colors } from '../theme';
import type { RootStackParamList } from '../navigation/types';

export function CartScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { items, increase, decrease, remove, subtotal, count } = useCart();

  const delivery =
    subtotal === 0 || subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_CHARGE;

  return (
    <Screen>
      <GradientHeader title="Cart" subtitle={`${count} items`} />
      {items.length === 0 ? (
        <EmptyState
          title="Cart is empty 🛒"
          message="Add some shuddh samagri to get started."
        />
      ) : (
        <View className="flex-1">
          <FlatList
            data={items}
            keyExtractor={(i) => i.productId}
            contentContainerStyle={{ padding: 16, paddingBottom: 16 }}
            renderItem={({ item }) => (
              <View className="mb-3 flex-row rounded-2xl border border-line bg-white p-3">
                <View className="h-16 w-16 items-center justify-center overflow-hidden rounded-xl bg-cream">
                  {item.image ? (
                    <Image
                      source={{ uri: item.image }}
                      className="h-full w-full"
                      resizeMode="cover"
                    />
                  ) : (
                    <Thumb image={item.image} size={48} />
                  )}
                </View>
                <View className="ml-3 flex-1">
                  <Text className="text-sm font-bold text-ink" numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text className="text-[11px] text-muted">
                    {INR(item.priceSnapshot)} × {item.quantity}
                  </Text>
                  <View className="mt-1.5 flex-row items-center justify-between">
                    <View
                      className="flex-row items-center rounded-lg"
                      style={{ backgroundColor: `${colors.maroon}14` }}
                    >
                      <Pressable
                        onPress={() => decrease(item.productId)}
                        className="px-2.5 py-1"
                      >
                        <Text className="text-sm font-extrabold text-maroon">−</Text>
                      </Pressable>
                      <Text className="min-w-5 text-center text-xs font-extrabold text-maroon">
                        {item.quantity}
                      </Text>
                      <Pressable
                        onPress={() => increase(item.productId)}
                        className="px-2.5 py-1"
                      >
                        <Text className="text-sm font-extrabold text-maroon">+</Text>
                      </Pressable>
                    </View>
                    <Text className="text-sm font-extrabold text-maroon">
                      {INR(item.priceSnapshot * item.quantity)}
                    </Text>
                  </View>
                </View>
                <Pressable onPress={() => remove(item.productId)} className="p-1 pl-2">
                  <Text className="text-base text-muted">🗑</Text>
                </Pressable>
              </View>
            )}
          />
          <View className="border-t border-line bg-white px-5 py-4">
            <View className="mb-1 flex-row justify-between">
              <Text className="text-xs text-muted">Subtotal</Text>
              <Text className="text-xs font-bold text-ink">{INR(subtotal)}</Text>
            </View>
            <View className="mb-2 flex-row justify-between">
              <Text className="text-xs text-muted">Delivery</Text>
              <Text
                className={`text-xs font-bold ${delivery === 0 ? 'text-leaf' : 'text-ink'}`}
              >
                {delivery === 0 ? 'FREE 🎉' : INR(delivery)}
              </Text>
            </View>
            <View className="mb-3 flex-row justify-between">
              <Text className="text-sm font-extrabold text-ink">Total</Text>
              <Text className="text-base font-extrabold text-maroon">
                {INR(subtotal + delivery)}
              </Text>
            </View>
            <PrimaryButton
              title={`Checkout · ${INR(subtotal + delivery)}`}
              onPress={() => nav.navigate('Checkout')}
            />
          </View>
        </View>
      )}
    </Screen>
  );
}
