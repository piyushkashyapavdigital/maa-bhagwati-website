import React, { useRef } from 'react';
import { Animated, Pressable, type PressableProps, type ViewStyle } from 'react-native';

/**
 * Pressable with a soft spring scale — taps feel smooth, not instant.
 * Drop-in replacement for Pressable on cards and tiles.
 */
export function SmoothPressable({
  children,
  onPress,
  style,
  ...rest
}: Omit<PressableProps, 'style'> & {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
}) {
  const scale = useRef(new Animated.Value(1)).current;

  const pressIn = () =>
    Animated.spring(scale, {
      toValue: 0.96,
      useNativeDriver: true,
      speed: 40,
      bounciness: 4,
    }).start();
  const pressOut = () =>
    Animated.spring(scale, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 6,
    }).start();

  return (
    <Pressable
      onPress={onPress}
      onPressIn={pressIn}
      onPressOut={pressOut}
      android_ripple={{ color: 'rgba(107,29,29,0.08)', borderless: false }}
      {...rest}
    >
      <Animated.View style={[{ transform: [{ scale }] }, style]}>
        {children}
      </Animated.View>
    </Pressable>
  );
}
