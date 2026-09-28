import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useCallback, useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { api } from '../api';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { EmptyState } from '../components/EmptyState';
import { ErrorBanner } from '../components/ErrorBanner';
import { GradientHeader } from '../components/GradientHeader';
import { LoadingView } from '../components/LoadingView';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import type { RootStackParamList } from '../navigation/types';
import { colorForIndex, colors } from '../theme';
import type { DBCategory } from '../types';

export function CategoriesScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [categories, setCategories] = useState<DBCategory[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<DBCategory | null>(null);
  const [catName, setCatName] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<DBCategory | null>(null);
  const [deleteError, setDeleteError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const [c, p] = await Promise.all([
        api.get<{ categories: DBCategory[] }>('/api/admin/categories'),
        api.get<{ products: { categoryId: string }[] }>('/api/admin/products'),
      ]);
      setCategories(c.categories);
      const map: Record<string, number> = {};
      for (const prod of p.products) {
        map[prod.categoryId] = (map[prod.categoryId] ?? 0) + 1;
      }
      setCounts(map);
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

  const openCreate = () => {
    setEditing(null);
    setCatName('');
    setEditorOpen(true);
  };

  const openEdit = (c: DBCategory) => {
    setEditing(c);
    setCatName(c.name);
    setEditorOpen(true);
  };

  const saveCategory = async () => {
    if (!catName.trim()) return;
    setSaving(true);
    setError('');
    try {
      if (editing) {
        await api.put(`/api/admin/categories/${editing.id}`, { name: catName.trim() });
      } else {
        await api.post('/api/admin/categories', { name: catName.trim() });
      }
      setEditorOpen(false);
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (c: DBCategory) => {
    try {
      await api.put(`/api/admin/categories/${c.id}`, { isActive: !c.isActive });
      setCategories((prev) =>
        prev.map((x) => (x.id === c.id ? { ...x, isActive: !x.isActive } : x))
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Update failed');
    }
  };

  const doDelete = async () => {
    if (!confirmDelete) return;
    setSaving(true);
    setDeleteError('');
    try {
      await api.del(`/api/admin/categories/${confirmDelete.id}`);
      setConfirmDelete(null);
      load();
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading && !categories.length) {
    return (
      <Screen>
        <GradientHeader title="Categories" onBack={() => nav.goBack()} />
        <LoadingView />
      </Screen>
    );
  }

  return (
    <Screen>
      <GradientHeader
        title="Categories"
        subtitle={`${categories.length} shop sections`}
        onBack={() => nav.goBack()}
        right={
          <Pressable
            onPress={openCreate}
            className="h-10 w-10 items-center justify-center rounded-full bg-gold"
            accessibilityLabel="Add category"
          >
            <Text className="text-xl font-black text-maroon">＋</Text>
          </Pressable>
        }
      />
      <ErrorBanner message={error} onRetry={load} />

      <FlatList
        data={categories}
        keyExtractor={(c) => c.id}
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
            title="No categories"
            message="Create your first shop section."
            actionTitle="Add category"
            onAction={openCreate}
          />
        }
        renderItem={({ item, index }) => {
          const color = colorForIndex(index);
          return (
            <View className="mb-3 flex-row items-center rounded-2xl border border-line bg-white p-4 shadow-sm">
              <View
                className="h-12 w-12 items-center justify-center rounded-xl"
                style={{ backgroundColor: `${color}20` }}
              >
                <View className="h-6 w-6 rounded-full" style={{ backgroundColor: color }} />
              </View>
              <View className="ml-3 flex-1">
                <Text className="text-base font-extrabold text-ink">{item.name}</Text>
                <Text className="text-xs text-muted">
                  /{item.slug} · {counts[item.id] ?? 0} products
                  {item.comingSoon ? ' · coming soon' : ''}
                </Text>
              </View>
              <Switch
                value={item.isActive}
                onValueChange={() => toggleActive(item)}
                trackColor={{ false: '#EADDCB', true: `${colors.leaf}66` }}
                thumbColor={item.isActive ? colors.leaf : '#A8A29E'}
              />
              <Pressable onPress={() => openEdit(item)} className="ml-3 px-2" hitSlop={8}>
                <Text className="text-lg text-gold-dark"></Text>
              </Pressable>
              <Pressable
                onPress={() => {
                  setDeleteError('');
                  setConfirmDelete(item);
                }}
                className="px-1"
                hitSlop={8}
              >
                <Text className="text-lg text-ruby"></Text>
              </Pressable>
            </View>
          );
        }}
      />

      {/* Create / edit modal */}
      <Modal visible={editorOpen} transparent animationType="fade" onRequestClose={() => setEditorOpen(false)}>
        <View className="flex-1 items-center justify-center bg-black/50 px-8">
          <View className="w-full max-w-sm rounded-3xl bg-white p-6">
            <View className="mb-3 h-1.5 w-12 rounded-full bg-gold" />
            <Text className="text-lg font-extrabold text-maroon">
              {editing ? 'Rename category' : 'New category'}
            </Text>
            <Text className="mb-4 mt-1 text-sm text-muted">
              {editing
                ? 'Update the display name. Slug stays unchanged.'
                : 'Name shown as a chip on the website homepage.'}
            </Text>
            <TextInput
              value={catName}
              onChangeText={setCatName}
              placeholder="e.g. Vastu & Yantra"
              placeholderTextColor="#A8A29E"
              className="mb-2 rounded-xl border border-line px-4 py-3 text-base"
              autoFocus
            />
            {error ? <Text className="mb-2 text-xs font-semibold text-ruby">{error}</Text> : null}
            <View className="mt-2 gap-3">
              <PrimaryButton
                title={saving ? 'Saving' : 'Save'}
                loading={saving}
                onPress={saveCategory}
              />
              <PrimaryButton
                title="Cancel"
                variant="ghost"
                onPress={() => setEditorOpen(false)}
                disabled={saving}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Delete guard dialog */}
      <ConfirmDialog
        visible={confirmDelete !== null}
        title={`Delete "${confirmDelete?.name}"?`}
        message={
          deleteError ||
          (confirmDelete && (counts[confirmDelete.id] ?? 0) > 0
            ? `This category still has ${counts[confirmDelete.id]} product(s)  move or delete them first.`
            : 'This section will be removed from the website.')
        }
        confirmTitle="Delete"
        destructive
        loading={saving}
        onConfirm={doDelete}
        onCancel={() => {
          setConfirmDelete(null);
          setDeleteError('');
        }}
      />
    </Screen>
  );
}
