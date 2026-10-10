import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Geolocation from '@react-native-community/geolocation';
import React, { useEffect, useMemo, useState } from 'react';
import { PermissionsAndroid, Platform, ScrollView, Text, View } from 'react-native';
import { api } from '../api';
import { useAuth } from '../auth';
import { useCart } from '../cart';
import { ErrorBanner } from '../components/ErrorBanner';
import { FormField } from '../components/FormField';
import { GradientHeader } from '../components/GradientHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { TabFooter } from '../components/TabFooter';
import { INR } from '../theme';
import type { AddressForm, CartQuote } from '../types';
import { validateAddress } from '../types';
import type { RootStackParamList } from '../navigation/types';

const EMPTY: AddressForm = {
  name: '',
  phone: '',
  email: '',
  address1: '',
  address2: '',
  city: '',
  state: 'Uttar Pradesh',
  pincode: '',
  landmark: '',
  notes: '',
};

async function ensureLocationPermission(): Promise<boolean> {
  if (Platform.OS !== 'android') return true;
  try {
    const res = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
    );
    return res === PermissionsAndroid.RESULTS.GRANTED;
  } catch {
    return false;
  }
}

function getPosition(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    try {
      Geolocation.getCurrentPosition(
        (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        () => resolve(null),
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 60000 },
      );
    } catch {
      resolve(null);
    }
  });
}

export function CheckoutScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { items, subtotal, count, clear } = useCart();
  const { user } = useAuth();
  const [form, setForm] = useState<AddressForm>(() => ({
    ...EMPTY,
    email: user?.email ?? '',
  }));
  const [errors, setErrors] = useState<Partial<AddressForm>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const payMethod = 'cod' as const;
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [serverQuote, setServerQuote] = useState<CartQuote | null>(null);

  const lines = useMemo(
    () => items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    [items],
  );

  // GPS for the 2 km free-delivery rule + authoritative server quote.
  useEffect(() => {
    (async () => {
      const ok = await ensureLocationPermission();
      const pos = ok ? await getPosition() : null;
      if (pos) setCoords(pos);
      try {
        const q = await api.quote(lines, pos?.lat ?? null, pos?.lng ?? null);
        setServerQuote(q);
      } catch {
        // offline estimate stays
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (items.length === 0) {
    return (
      <Screen>
        <GradientHeader title="Checkout" onBack={() => nav.goBack()} />
        <View className="p-6">
          <Text className="text-center text-sm text-muted">
            Your cart is empty.
          </Text>
        </View>
      </Screen>
    );
  }

  const set = (k: keyof AddressForm, v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const shownSubtotal = serverQuote?.subtotal ?? subtotal;
  const shownDelivery = serverQuote?.deliveryCharge ?? (subtotal === 0 ? 0 : 70);
  const shownTotal = serverQuote?.total ?? subtotal + shownDelivery;

  const pay = async () => {
    const errs = validateAddress(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setBusy(true);
    setError('');
    const loc = coords ? { lat: coords.lat, lng: coords.lng } : { lat: null, lng: null };
    try {
      // Cash on Delivery only — order goes live immediately as Pending,
      // admin gets the push.
      const order = await api.createRzpOrder(form, lines, 'cod', loc.lat, loc.lng);
      clear();
      nav.replace('OrderSuccess', {
        paymentId: order.id,
        orderId: order.id,
        total: order.quote?.total ?? shownTotal,
        method: 'cod',
      });
      return;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Order failed. Please try again.';
      setError(msg);
      setBusy(false);
    }
  };

  return (
    <Screen>
      <GradientHeader
        title="Checkout"
        subtitle="Address & payment"
        onBack={() => nav.goBack()}
      />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
      >
        <ErrorBanner message={error} />
        <Text className="mb-2 px-1 text-sm font-extrabold uppercase tracking-wide text-maroon">
          1 · Your details
        </Text>
        <FormField label="Full Name *" value={form.name} onChangeText={(v) => set('name', v)} placeholder="e.g. Ramkumar Sharma" error={errors.name} />
        <FormField label="Mobile Number *" value={form.phone} onChangeText={(v) => set('phone', v)} placeholder="9876543210" keyboardType="phone-pad" maxLength={10} error={errors.phone} />
        <FormField label="Email (optional)" value={form.email} onChangeText={(v) => set('email', v)} placeholder="example@email.com" keyboardType="email-address" autoCapitalize="none" />

        <Text className="mb-2 mt-2 px-1 text-sm font-extrabold uppercase tracking-wide text-maroon">
          2 · Delivery address
        </Text>
        <FormField label="House No. / Street *" value={form.address1} onChangeText={(v) => set('address1', v)} placeholder="House 45, Ram Nagar Colony" error={errors.address1} />
        <FormField label="Area / Sector (optional)" value={form.address2} onChangeText={(v) => set('address2', v)} placeholder="Sector-12" />
        <View className="flex-row gap-3">
          <View className="flex-1">
            <FormField label="City *" value={form.city} onChangeText={(v) => set('city', v)} placeholder="Lucknow" error={errors.city} />
          </View>
          <View className="flex-1">
            <FormField label="Pincode *" value={form.pincode} onChangeText={(v) => set('pincode', v)} placeholder="226001" keyboardType="number-pad" maxLength={6} error={errors.pincode} />
          </View>
        </View>
        <FormField label="Nearby Landmark (optional)" value={form.landmark} onChangeText={(v) => set('landmark', v)} placeholder="Near Shiv Mandir" />
        <FormField label="Note (optional)" value={form.notes} onChangeText={(v) => set('notes', v)} placeholder="Deliver after 2 PM" />

        <Text className="mb-2 mt-2 px-1 text-sm font-extrabold uppercase tracking-wide text-maroon">
          3 · Payment
        </Text>
        <View className="mb-3 rounded-2xl border-2 border-maroon bg-white p-4">
          <Text className="text-sm font-extrabold text-ink">
            💵 Cash on Delivery
          </Text>
          <Text className="mt-1 text-xs text-muted">
            Pay cash when your order arrives. No advance needed.
          </Text>
        </View>

        <View className="mb-4 rounded-2xl border border-line bg-white p-4">
          <Text className="text-sm font-extrabold text-ink">
            💵 Cash on Delivery — pay when it arrives
          </Text>
          <Text className="mt-1 text-xs text-muted">
            {coords ? (
              <>
                📍 {serverQuote?.distanceKm != null
                  ? `${serverQuote.distanceKm.toFixed(1)} km away — `
                  : ''}
                {serverQuote && serverQuote.freeDelivery
                  ? 'FREE delivery within 2 km 🎉'
                  : `₹${shownDelivery} delivery`}
              </>
            ) : (
              '📍 Location off — ₹70 delivery applies.'
            )}
            {' '}· Total {INR(shownTotal)}
          </Text>
        </View>

        <PrimaryButton
          title={busy ? 'Processing…' : `Place order · ${INR(shownTotal)}`}
          loading={busy}
          onPress={pay}
        />
        <Text className="mt-3 text-center text-[11px] text-muted">
          256-bit SSL protected · 7-day return · Fast delivery
        </Text>
      </ScrollView>
      <TabFooter />
    </Screen>
  );
}
