import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  PressableProps,
  Text,
  View,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { colors } from '../theme';

type Variant = 'primary' | 'gold' | 'danger' | 'ghost';

export function PrimaryButton({
  title,
  variant = 'primary',
  loading,
  disabled,
  style,
  ...rest
}: PressableProps & {
  title: string;
  variant?: Variant;
  loading?: boolean;
  disabled?: boolean;
  style?: object;
}) {
  const off = disabled || loading;

  const inner = (
    <View className="flex-row items-center justify-center gap-2">
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'gold' || variant === 'ghost' ? colors.maroon : '#fff'}
        />
      ) : null}
      <Text
        className={`text-base font-bold ${
          variant === 'gold' || variant === 'ghost' ? 'text-maroon' : 'text-white'
        }`}
      >
        {title}
      </Text>
    </View>
  );

  if (variant === 'primary' || variant === 'danger') {
    return (
      <Pressable disabled={off} style={style} {...rest}>
        <LinearGradient
          colors={
            variant === 'danger'
              ? [colors.ruby, '#9F1239']
              : [colors.maroonLight, colors.maroon]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className={`items-center justify-center rounded-xl px-5 py-3.5 ${
            off ? 'opacity-50' : ''
          }`}
        >
          {inner}
        </LinearGradient>
      </Pressable>
    );
  }

  return (
    <Pressable
      disabled={off}
      style={style}
      className={`items-center justify-center rounded-xl px-5 py-3.5 ${
        variant === 'gold'
          ? 'bg-gold'
          : 'border border-line bg-white'
      } ${off ? 'opacity-50' : 'active:opacity-80'}`}
      {...rest}
    >
      {inner}
    </Pressable>
  );
}
