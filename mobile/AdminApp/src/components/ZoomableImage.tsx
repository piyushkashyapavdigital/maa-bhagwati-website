import React from 'react';
import { Image, View, StyleSheet } from 'react-native';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

const MIN_SCALE = 1;
const MAX_SCALE = 3;

export function ZoomableImage({
  source,
  style,
}: {
  source: { uri: string };
  style?: { width?: number | string; height?: number | string };
}) {
  const scale = useSharedValue(MIN_SCALE);
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const savedTx = useSharedValue(0);
  const savedTy = useSharedValue(0);

  const pinch = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.max(MIN_SCALE, Math.min(MAX_SCALE, scale.value * e.scale));
    })
    .onEnd(() => {
      if (scale.value < MIN_SCALE + 0.1) {
        scale.value = withSpring(MIN_SCALE);
        tx.value = withSpring(0);
        ty.value = withSpring(0);
        savedTx.value = 0;
        savedTy.value = 0;
      }
    });

  const pan = Gesture.Pan()
    .onStart(() => {
      savedTx.value = tx.value;
      savedTy.value = ty.value;
    })
    .onUpdate((e) => {
      tx.value = savedTx.value + e.translationX;
      ty.value = savedTy.value + e.translationY;
    });

  const composed = Gesture.Simultaneous(pinch, pan);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: tx.value },
      { translateY: ty.value },
    ],
  }));

  return (
    <View style={[styles.container, style, styles.overflow]}>
      <GestureDetector gesture={composed}>
        <Animated.View style={[styles.imageWrap, animatedStyle]}>
          <Image source={source} style={style} resizeMode="contain" />
        </Animated.View>
      </GestureDetector>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  overflow: {
    overflow: 'hidden',
  },
  imageWrap: {
    justifyContent: 'center',
    alignItems: 'center',
  },
});
