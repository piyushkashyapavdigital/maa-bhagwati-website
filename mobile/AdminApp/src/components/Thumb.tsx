import React, { useState } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import { resolveImage } from '../api';

/** Product/banner image placeholder. */
export function Thumb({
  image,
  size = 48,
  color,
}: {
  image?: string | null;
  size?: number;
  color?: string;
}) {
  const uri = resolveImage(image);
  const [failed, setFailed] = useState(false);

  if (uri && !failed) {
    return (
      <Image
        source={{ uri }}
        onError={() => setFailed(true)}
        style={{ width: size, height: size, borderRadius: size / 4 }}
        resizeMode="cover"
      />
    );
  }

  return (
    <View
      className="items-center justify-center"
      style={{
        width: size,
        height: size,
        borderRadius: size / 4,
        backgroundColor: color ?? '#F3E8D8',
      }}
    >
      <Text style={{ fontSize: size * 0.45 }} />
    </View>
  );
}
