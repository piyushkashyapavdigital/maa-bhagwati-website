import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import React from 'react';
import { Text, View } from 'react-native';
import { GradientHeader } from '../components/GradientHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { INR, colors } from '../theme';
import type { RootStackParamList } from '../navigation/types';

type R = RouteProp<RootStackParamList, 'OrderSuccess'>;

export function OrderSuccessScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { params } = useRoute<R>();

  return (
    <Screen>
      <GradientHeader title="Order placed 🙏" subtitle="Dhanyavaad!" />
      <View className="flex-1 items-center justify-center p-8">
        <View
          className="h-24 w-24 items-center justify-center rounded-full"
          style={{ backgroundColor: `${colors.leaf}18` }}
        >
          <Text className="text-5xl">✅</Text>
        </View>
        <Text className="mt-5 text-center text-xl font-extrabold text-ink">
          Payment successful!
        </Text>
        <Text className="mt-2 text-center text-sm leading-6 text-muted">
          Amount paid: {INR(params.total)}{'\n'}
          Payment ID: {params.paymentId}
        </Text>
        <View className="mt-8 w-full gap-3">
          <PrimaryButton
            title="Track my orders"
            onPress={() => nav.replace('Main', { screen: 'Orders' })}
          />
          <PrimaryButton
            title="Continue shopping"
            variant="gold"
            onPress={() => nav.replace('Main', { screen: 'Home' })}
          />
        </View>
      </View>
    </Screen>
  );
}
