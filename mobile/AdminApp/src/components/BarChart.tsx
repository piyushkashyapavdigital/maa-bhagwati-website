import React from 'react';
import { Text, View } from 'react-native';
import { INR } from '../theme';

export interface BarDatum {
  label: string;
  value: number;
  caption?: string;
}

/** Views-drawn bar chart (no chart library). */
export function BarChart({
  data,
  height = 140,
  color = '#D4AF37',
  emptyLabel = 'No data yet',
}: {
  data: BarDatum[];
  height?: number;
  color?: string;
  emptyLabel?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);

  if (!data.length || data.every((d) => d.value === 0)) {
    return (
      <View
        className="items-center justify-center rounded-2xl border border-line bg-white"
        style={{ height: height + 40 }}
      >
        <Text className="text-3xl" />
        <Text className="mt-2 text-sm text-muted">{emptyLabel}</Text>
      </View>
    );
  }

  return (
    <View className="rounded-2xl border border-line bg-white p-4">
      <View className="flex-row items-end" style={{ height }}>
        {data.map((d, i) => {
          const h = d.value === 0 ? 4 : Math.max(6, (d.value / max) * height);
          const isMax = d.value === max && d.value > 0;
          return (
            <View key={`${d.label}-${i}`} className="flex-1 items-center px-[2px]">
              {isMax ? (
                <Text className="mb-1 text-[9px] font-bold text-maroon">
                  {INR(d.value)}
                </Text>
              ) : null}
              <View
                className="w-full rounded-t-md"
                style={{
                  height: h,
                  backgroundColor: d.value === 0 ? '#EADDCB' : color,
                  opacity: d.value === 0 ? 1 : isMax ? 1 : 0.75,
                }}
              />
            </View>
          );
        })}
      </View>
      <View className="mt-2 flex-row">
        {data.map((d, i) => (
          <View key={`l-${d.label}-${i}`} className="flex-1 items-center px-[2px]">
            <Text className="text-[8px] text-muted" numberOfLines={1}>
              {d.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
