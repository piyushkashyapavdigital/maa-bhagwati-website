import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import RazorpayCheckout from 'react-native-razorpay';
import { api } from '../api';
import { useAuth } from '../auth';
import { useCart } from '../cart';
import { RAZORPAY_KEY_ID } from '../config';
import { ErrorBanner } from '../components/ErrorBanner';
import { FormField } from '../components/FormField';
import { GradientHeader } from '../components/GradientHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { INR, colors } from '../theme';
import type { AddressForm } from '../types';
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

  const lines = useMemo(
    () => items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
    [items],
  );

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

  const pay = async () => {
    const errs = validateAddress(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    setBusy(true);
    setError('');
    try {
      // 1. Server creates the Razorpay order (server re-prices the cart)
      const order = await api.createRzpOrder(form, lines);
      const serverTotal = order.amount / 100;

      // 2. Native Razorpay sheet — no browser involved
      const res = await RazorpayCheckout.open({
        key: RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Maa Bhagwati Pooja Bhandar',
        description: `Order of ${count} item(s)`,
        order_id: order.id,
        prefill: { name: form.name, contact: form.phone, email: form.email },
        notes: {
          address: `${form.address1}, ${form.address2}, ${form.city}, ${form.state} - ${form.pincode}`,
        },
        theme: { color: '#6B1D1D' },
      });

      // 3. Verify signature on the server
      const verify = await api.verifyPayment({
        razorpay_order_id: res.razorpay_order_id,
        razorpay_payment_id: res.razorpay_payment_id,
        razorpay_signature: res.razorpay_signature,
        items: lines,
      });

      clear();
      nav.replace('OrderSuccess', {
        paymentId: verify.paymentId,
        orderId: verify.orderId,
        total: serverTotal,
      });
    } catch (e: unknown) {
      // Razorpay rejects with { code, description } on failure/dismiss.
      const msg =
        e instanceof Error
          ? e.message
          : typeof e === 'object' && e !== null && 'description' in e
            ? String((e as { description: unknown }).description)
            : 'Payment failed. Please try again.';
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

        <View className="mb-4 rounded-2xl border border-line bg-white p-4">
          <Text className="text-sm font-extrabold text-ink">
            🔒 Razorpay — UPI · Cards · NetBanking
          </Text>
          <Text className="mt-1 text-xs text-muted">
            Subtotal {INR(subtotal)} · pay securely in the next step.
          </Text>
        </View>

        <PrimaryButton
          title={busy ? 'Processing…' : `Pay securely`}
          loading={busy}
          onPress={pay}
        />
        <Text className="mt-3 text-center text-[11px] text-muted">
          256-bit SSL protected · 7-day return · Fast delivery
        </Text>
      </ScrollView>
    </Screen>
  );
}
