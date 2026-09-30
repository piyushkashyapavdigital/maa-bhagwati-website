import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  Modal,
  Pressable,
  RefreshControl,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import { api, resolveImage, type ImageFile } from '../api';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { GradientHeader } from '../components/GradientHeader';
import { LoadingView } from '../components/LoadingView';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { TabFooter } from '../components/TabFooter';
import { ZoomableImage } from '../components/ZoomableImage';
import type { RootStackParamList } from '../navigation/types';
import { colors, formatDate } from '../theme';
import { BANNER_PLACEMENTS, type DBBanner, type DBCategory } from '../types';

export function BannersScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [banners, setBanners] = useState<DBBanner[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newImage, setNewImage] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newLink, setNewLink] = useState('');
  const [newPlacement, setNewPlacement] = useState<string>('home_top');
  const [linkCats, setLinkCats] = useState<DBCategory[]>([]);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<DBBanner | null>(null);

  const load = useCallback(async () => {
    setError('');
    try {
      const [bRes, cRes] = await Promise.all([
        api.get<{ banners: DBBanner[] }>('/api/admin/banners'),
        api.get<{ categories: DBCategory[] }>('/api/admin/categories').catch(() => ({ categories: [] as DBCategory[] })),
      ]);
      setBanners(bRes.banners);
      setLinkCats(cRes.categories);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const unsub = nav.addListener('focus', load);
    return unsub;
  }, [nav, load]);

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1600,
      maxHeight: 900,
    });
    const asset = res.assets?.[0];
    if (res.didCancel || !asset?.uri) return;
    setUploading(true);
    setError('');
    try {
      const file: ImageFile = {
        uri: asset.uri,
        name: asset.fileName ?? `banner-${Date.now()}.jpg`,
        type: asset.type ?? 'image/jpeg',
      };
      const up = await api.upload<{ path: string }>('/api/admin/upload', file);
      setNewImage(up.path);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const createBanner = async () => {
    if (!newImage) {
      setError('Pick a banner image first');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await api.post('/api/admin/banners', {
        image: newImage,
        title: newTitle.trim() || undefined,
        link: newLink.trim() || undefined,
        placement: newPlacement,
      });
      setCreating(false);
      setNewImage(null);
      setNewTitle('');
      setNewLink('');
      setNewPlacement('home_top');
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const toggle = async (b: DBBanner) => {
    try {
      await api.put(`/api/admin/banners/${b.id}`, { isActive: !b.isActive });
      setBanners((prev) =>
        prev.map((x) => (x.id === b.id ? { ...x, isActive: !x.isActive } : x))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    }
  };

  const cyclePlacement = async (b: DBBanner) => {
    const ids: string[] = BANNER_PLACEMENTS.map((p) => p.id);
    const next = ids[(ids.indexOf(b.placement) + 1) % ids.length] ?? ids[0];
    try {
      await api.put(`/api/admin/banners/${b.id}`, { placement: next });
      setBanners((prev) =>
        prev.map((x) => (x.id === b.id ? { ...x, placement: next } : x))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    }
  };

  const doDelete = async () => {
    if (!confirmDelete) return;
    setSaving(true);
    try {
      await api.del(`/api/admin/banners/${confirmDelete.id}`);
      setConfirmDelete(null);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !banners.length) {
    return (
      <Screen>
        <GradientHeader title="Banners" onBack={() => nav.goBack()} />
        <LoadingView />
      </Screen>
    );
  }

  return (
    <Screen>
      <GradientHeader
        title="Banners"
        subtitle={`${banners.length} promotional strips`}
        onBack={() => nav.goBack()}
        right={
          <Pressable
            onPress={() => setCreating(true)}
            className="h-10 w-10 items-center justify-center rounded-full bg-gold"
            accessibilityLabel="Add banner"
          >
            <Text className="text-xl font-black text-maroon">＋</Text>
          </Pressable>
        }
      />
      <ErrorBanner message={error} onRetry={load} />

      <FlatList
        data={banners}
        keyExtractor={(b) => b.id}
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
            title="No banners yet"
            message="Upload a wide image (2017×780 looks great) to promote sales on the homepage."
            actionTitle="Add banner"
            onAction={() => setCreating(true)}
          />
        }
        renderItem={({ item }) => (
          <View className="mb-4 overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
            <Image
              source={{ uri: resolveImage(item.image) }}
              style={{ width: '100%', height: 120 }}
              resizeMode="cover"
            />
            <View className="flex-row items-center p-4">
              <View className="flex-1">
                <Text className="text-sm font-extrabold text-ink">
                  {item.title || 'Untitled banner'}
                </Text>
                <Text className="text-xs text-muted">
                  {item.link || 'No link'} · added {formatDate(item.createdAt)}
                </Text>
                <Pressable
                  onPress={() => cyclePlacement(item)}
                  className="mt-1.5 self-start rounded-full bg-cream px-2.5 py-1"
                >
                  <Text className="text-[10px] font-extrabold text-maroon">
                    📍 {BANNER_PLACEMENTS.find((p) => p.id === item.placement)?.label ?? item.placement} · tap to move
                  </Text>
                </Pressable>
              </View>
              <Switch
                value={item.isActive}
                onValueChange={() => toggle(item)}
                trackColor={{ false: '#EADDCB', true: `${colors.leaf}66` }}
                thumbColor={item.isActive ? colors.leaf : '#A8A29E'}
              />
              <Pressable onPress={() => setConfirmDelete(item)} className="ml-3" hitSlop={8}>
                <Text className="text-lg text-ruby"></Text>
              </Pressable>
            </View>
          </View>
        )}
      />

      {/* Create dialog */}
      <Modal visible={creating} transparent animationType="fade" onRequestClose={() => setCreating(false)}>
        <View className="flex-1 items-center justify-center bg-black/50 px-6">
          <View className="w-full max-w-md rounded-3xl bg-white p-6">
            <View className="mb-1 h-1.5 w-12 rounded-full bg-gold" />
            <Text className="mb-3 text-lg font-extrabold text-maroon">New banner</Text>
            <Pressable
              onPress={pickImage}
              className="mb-4 items-center rounded-2xl border-2 border-dashed border-line bg-cream p-5"
            >
              {newImage ? (
                <ZoomableImage source={{ uri: resolveImage(newImage) ?? '' }} style={{ width: '100%', height: 100 }} />
              ) : (
                <>
                  <Text className="text-3xl" />
                  <Text className="mt-2 text-sm font-bold text-maroon">
                    {uploading ? 'Uploading' : 'Tap to choose image'}
                  </Text>
                </>
              )}
            </Pressable>
            <TextInput
              value={newTitle}
              onChangeText={setNewTitle}
              placeholder="Title (optional)"
              placeholderTextColor="#A8A29E"
              className="mb-3 rounded-xl border border-line px-4 py-3 text-base"
            />
            <Text className="mb-1.5 text-sm font-bold text-maroon">Opens (tap to choose)</Text>
            <View className="mb-4 flex-row flex-wrap gap-2 justify-center">
              <Pressable
                onPress={() => setNewLink('')}
                className={`rounded-full border px-3 py-1.5 ${
                  !newLink ? 'border-maroon bg-maroon' : 'border-line bg-white'
                }`}
              >
                <Text className={`text-xs font-bold ${!newLink ? 'text-white' : 'text-muted'}`}>
                  No link
                </Text>
              </Pressable>
              {linkCats.map((c) => {
                const v = `/category/${c.slug}`;
                const active = newLink === v;
                return (
                  <Pressable
                    key={c.id}
                    onPress={() => setNewLink(v)}
                    className={`rounded-full border px-3 py-1.5 ${
                      active ? 'border-maroon bg-maroon' : 'border-line bg-white'
                    }`}
                  >
                    <Text className={`text-xs font-bold ${active ? 'text-white' : 'text-muted'}`}>
                      {c.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text className="mb-1.5 text-sm font-bold text-maroon">Show at</Text>
            <View className="mb-4 flex-row gap-2 justify-center">
              {BANNER_PLACEMENTS.map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() => setNewPlacement(p.id)}
                  className={`rounded-full border px-3 py-1.5 ${
                    newPlacement === p.id
                      ? 'border-maroon bg-maroon'
                      : 'border-line bg-white'
                  }`}
                >
                  <Text
                    className={`text-xs font-bold ${
                      newPlacement === p.id ? 'text-white' : 'text-muted'
                    }`}
                  >
                    {p.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View className="gap-3">
              <PrimaryButton
                title={saving ? 'Saving' : 'Create banner'}
                loading={saving}
                onPress={createBanner}
              />
              <PrimaryButton
                title="Cancel"
                variant="ghost"
                onPress={() => setCreating(false)}
                disabled={saving}
              />
            </View>
          </View>
        </View>
      </Modal>

      <ConfirmDialog
        visible={confirmDelete !== null}
        title="Delete banner?"
        message={confirmDelete ? `"${confirmDelete.title || confirmDelete.id}" will be removed.` : ''}
        confirmTitle="Delete"
        destructive
        loading={saving}
        onConfirm={doDelete}
        onCancel={() => setConfirmDelete(null)}
      />
      <TabFooter />
    </Screen>
  );
}
