import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Linking,
  Pressable,
  RefreshControl,
  Text,
  View,
} from 'react-native';
import { api } from '../api';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { GradientHeader } from '../components/GradientHeader';
import { LoadingView } from '../components/LoadingView';
import { Screen } from '../components/Screen';
import type { RootStackParamList } from '../navigation/types';
import { colors, formatDateTime } from '../theme';
import type { ContactMessage } from '../types';

export function MessagesScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      const res = await api.get<{ messages: ContactMessage[] }>('/api/admin/messages');
      setMessages(res.messages);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load messages');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const unsub = nav.addListener('focus', load);
    return unsub;
  }, [nav, load]);

  const markRead = async (m: ContactMessage) => {
    if (m.read) return;
    try {
      await api.patch(`/api/admin/messages/${m.id}`, {});
      setMessages((prev) =>
        prev.map((x) => (x.id === m.id ? { ...x, read: true } : x))
      );
    } catch {
      // non-fatal
    }
  };

  const unread = messages.filter((m) => !m.read).length;

  if (loading && !messages.length) {
    return (
      <Screen>
        <GradientHeader title="Messages" onBack={() => nav.goBack()} />
        <LoadingView />
      </Screen>
    );
  }

  return (
    <Screen>
      <GradientHeader
        title="Messages"
        subtitle={`${unread} unread · from website contact form`}
        onBack={() => nav.goBack()}
      />
      <ErrorBanner message={error} onRetry={load} />
      <FlatList
        data={messages}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              load();
            }}
            tintColor={colors.maroon}
          />
        }
        ListEmptyComponent={
          <EmptyState
            title="No messages"
            message="Customer enquiries from the website contact form land here."
          />
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => markRead(item)}
            className={`mb-3 rounded-2xl border p-4 shadow-sm ${
              item.read ? 'border-line bg-white' : 'border-gold/50 bg-gold/10'
            }`}
          >
            <View className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                {!item.read ? (
                  <View className="h-2.5 w-2.5 rounded-full bg-ruby" />
                ) : null}
                <Text className="text-base font-extrabold text-ink">{item.name}</Text>
              </View>
              <Text className="text-[11px] text-muted">{formatDateTime(item.createdAt)}</Text>
            </View>
            <Text className="mt-2 text-sm leading-5 text-ink">{item.message}</Text>
            <Pressable
              onPress={() => Linking.openURL(`tel:${item.phone}`)}
              className="mt-2 self-start rounded-full bg-cream px-3 py-1.5"
            >
              <Text className="text-xs font-bold text-sky"> {item.phone}</Text>
            </Pressable>
            {!item.read ? (
              <Text className="mt-2 text-[11px] font-semibold text-muted">
                Tap to mark as read
              </Text>
            ) : null}
          </Pressable>
        )}
      />
    </Screen>
  );
}
