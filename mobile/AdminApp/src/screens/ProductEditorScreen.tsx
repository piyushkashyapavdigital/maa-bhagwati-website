import React, { useCallback, useEffect, useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from 'react-native';
import * as ImagePicker from 'react-native-image-picker';
import { api, resolveImage, type ImageFile } from '../api';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { ErrorBanner } from '../components/ErrorBanner';
import { FormField } from '../components/FormField';
import { GradientHeader } from '../components/GradientHeader';
import { LoadingView } from '../components/LoadingView';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { ZoomableImage } from '../components/ZoomableImage';
import type { RootStackParamList } from '../navigation/types';
import { colorForIndex, colors } from '../theme';
import type { DBCategory, DBProduct } from '../types';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';

type Props = NativeStackScreenProps<RootStackParamList, 'ProductEditor'>;

export function ProductEditorScreen({ navigation, route }: Props) {
  const id = route.params?.id;
  const isEdit = Boolean(id);

  const [categories, setCategories] = useState<DBCategory[] | null>(null);
  const [name, setName] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [unit, setUnit] = useState('');
  const [stock, setStock] = useState('');
  const [deal, setDeal] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      const c = await api.get<{ categories: DBCategory[] }>('/api/admin/categories');
      setCategories(c.categories);
      if (id) {
        const p = await api.get<{ product: DBProduct }>(`/api/admin/products/${id}`);
        const prod = p.product;
        setName(prod.name);
        setCategoryId(prod.categoryId);
        setPrice(String(prod.price));
        setUnit(prod.unit);
        setStock(String(prod.stock));
        setDeal(String(prod.dealPercent ?? 0));
        setImage(prod.image);
        setIsActive(prod.isActive);
      } else {
        setCategoryId(c.categories[0]?.id ?? '');
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const pickImage = async () => {
    const res = await ImagePicker.launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      maxWidth: 1200,
      maxHeight: 1200,
    });
    const asset = res.assets?.[0];
    if (res.didCancel || !asset?.uri) return;
    setUploading(true);
    setError('');
    try {
      const file: ImageFile = {
        uri: asset.uri,
        name: asset.fileName ?? `photo-${Date.now()}.jpg`,
        type: asset.type ?? 'image/jpeg',
      };
      const up = await api.upload<{ path: string }>('/api/admin/upload', file);
      setImage(up.path);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (!categoryId) errs.categoryId = 'Pick a category';
    const p = Number(price);
    if (!Number.isFinite(p) || p < 0) errs.price = 'Enter a valid price';
    if (!unit.trim()) errs.unit = 'Unit required (e.g. "1 packet")';
    const s = Number(stock);
    if (!Number.isFinite(s) || s < 0) errs.stock = 'Enter stock qty';
    const d = deal.trim() === '' ? 0 : Number(deal);
    if (!Number.isFinite(d) || d < 0 || d > 90) errs.deal = '0–90 %';
    setFieldError(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    setError('');
    try {
      const body = {
        name: name.trim(),
        categoryId,
        price: p,
        unit: unit.trim(),
        stock: Math.floor(s),
        dealPercent: Math.floor(d),
        image,
        isActive,
      };
      if (isEdit) {
        await api.put(`/api/admin/products/${id}`, body);
      } else {
        await api.post('/api/admin/products', body);
      }
      navigation.goBack();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setSaving(true);
    try {
      await api.del(`/api/admin/products/${id}`);
      navigation.goBack();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Delete failed');
    } finally {
      setSaving(false);
      setConfirmDelete(false);
    }
  };

  if (loading || !categories) {
    return (
      <Screen>
        <GradientHeader
          title={isEdit ? 'Edit Product' : 'New Product'}
          onBack={() => navigation.goBack()}
        />
        <LoadingView />
      </Screen>
    );
  }

  return (
    <Screen>
      <GradientHeader
        title={isEdit ? 'Edit Product' : 'New Product'}
        subtitle={isEdit ? name : 'Add to catalogue'}
        onBack={() => navigation.goBack()}
      />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
        keyboardVerticalOffset={0}
      >
        <ScrollView
          contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
          keyboardShouldPersistTaps="handled"
        >
          <ErrorBanner message={error} />

          <Pressable
            onPress={pickImage}
            className="mb-5 items-center rounded-3xl border-2 border-dashed border-line bg-white p-6 active:opacity-80"
          >
            {image ? (
              <ZoomableImage source={{ uri: resolveImage(image) ?? '' }} style={{ width: 140, height: 140 }} />
            ) : (
              <View className="h-24 w-24 items-center justify-center rounded-2xl bg-cream">
                <Text className="text-4xl"></Text>
              </View>
            )}
            <Text className="mt-3 text-sm font-bold text-maroon">
              {uploading ? 'Uploading…' : image ? 'Tap to change image' : 'Tap to upload image'}
            </Text>
          </Pressable>

          <FormField
            label="Product name"
            value={name}
            onChangeText={setName}
            placeholder="e.g. Badi Chowki"
            error={fieldError.name}
          />
          <Text className="mb-1.5 text-sm font-bold text-maroon">Category</Text>
          <View className="mb-4 flex-row flex-wrap gap-2">
            {categories.map((c, i) => {
              const active = categoryId === c.id;
              const color = colorForIndex(i);
              return (
                <Pressable
                  key={c.id}
                  onPress={() => setCategoryId(c.id)}
                  className="rounded-full border px-3 py-2"
                  style={{
                    borderColor: active ? color : colors.line,
                    backgroundColor: active ? `${color}18` : colors.paper,
                  }}
                >
                  <Text
                    className="text-xs font-bold"
                    style={{ color: active ? color : colors.muted }}
                  >
                    {c.name}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {fieldError.categoryId ? (
            <Text className="mb-3 text-xs font-semibold text-ruby">
              {fieldError.categoryId}
            </Text>
          ) : null}

          <View className="flex-row gap-3">
            <View className="flex-1">
              <FormField
                label="Price (₹)"
                value={price}
                onChangeText={setPrice}
                keyboardType="numeric"
                placeholder="499"
                error={fieldError.price}
              />
            </View>
            <View className="flex-1">
              <FormField
                label="Stock"
                value={stock}
                onChangeText={setStock}
                keyboardType="numeric"
                placeholder="100"
                error={fieldError.stock}
              />
            </View>
            <View className="flex-1">
              <FormField
                label="Deal % off (0 = none)"
                value={deal}
                onChangeText={setDeal}
                keyboardType="numeric"
                placeholder="0"
                error={fieldError.deal}
              />
            </View>
          </View>

          <FormField
            label="Unit / reference qty"
            value={unit}
            onChangeText={setUnit}
            placeholder='e.g. "250 gram"'
            error={fieldError.unit}
          />

          <View className="mb-6 flex-row items-center justify-between rounded-2xl border border-line bg-white p-4">
            <View className="flex-1 pr-3">
              <Text className="text-sm font-extrabold text-ink">Visible on website</Text>
              <Text className="text-xs text-muted">Hidden products won't appear in the shop.</Text>
            </View>
            <Switch
              value={isActive}
              onValueChange={setIsActive}
              trackColor={{ false: '#EADDCB', true: `${colors.leaf}66` }}
              thumbColor={isActive ? colors.leaf : '#A8A29E'}
            />
          </View>

          <PrimaryButton title={saving ? 'Saving…' : 'Save product'} loading={saving} onPress={save} />

          {isEdit ? (
            <PrimaryButton
              title="Delete product"
              variant="danger"
              onPress={() => setConfirmDelete(true)}
              style={{ marginTop: 12 }}
              disabled={saving}
            />
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>

      <ConfirmDialog
        visible={confirmDelete}
        title={`Delete "${name}"?`}
        message="This removes the product from the website immediately. This cannot be undone."
        confirmTitle="Delete"
        destructive
        loading={saving}
        onConfirm={remove}
        onCancel={() => setConfirmDelete(false)}
      />
    </Screen>
  );
}
