import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { Linking, ScrollView, Text, View } from 'react-native';
import { api } from '../api';
import { ErrorBanner } from '../components/ErrorBanner';
import { FormField } from '../components/FormField';
import { GradientHeader } from '../components/GradientHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import { colors } from '../theme';
import type { RootStackParamList } from '../navigation/types';

export function ContactScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const send = async () => {
    if (!name.trim() || !phone.trim() || !message.trim()) {
      setError('Name, phone and message are required.');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await api.contact({ name: name.trim(), phone: phone.trim(), message: message.trim() });
      setDone(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send message');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <GradientHeader
        title="Contact Us 📞"
        subtitle="Bulk orders & help"
        onBack={() => nav.goBack()}
      />
      <ScrollView
        contentContainerStyle={{ padding: 16, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
      >
        <ErrorBanner message={error} />
        {done ? (
          <View className="rounded-3xl border border-leaf/40 bg-leaf/10 p-6">
            <Text className="text-center text-4xl">🙏</Text>
            <Text className="mt-3 text-center text-base font-extrabold text-ink">
              Message received!
            </Text>
            <Text className="mt-2 text-center text-sm text-muted">
              We will call you back soon.
            </Text>
          </View>
        ) : (
          <View className="rounded-3xl border border-line bg-white p-5">
            <FormField label="Your Name *" value={name} onChangeText={setName} placeholder="Ramkumar Sharma" />
            <FormField label="Mobile Number *" value={phone} onChangeText={setPhone} placeholder="9876543210" keyboardType="phone-pad" maxLength={10} />
            <FormField label="Message *" value={message} onChangeText={setMessage} placeholder="Bulk order ke liye sampark…" multiline numberOfLines={4} textAlignVertical="top" />
            <PrimaryButton title="Send message" loading={busy} onPress={send} />
          </View>
        )}

        <View className="mt-4 items-center rounded-2xl border border-gold/40 bg-gold/10 p-5">
          <Text className="text-sm font-extrabold text-maroon">Call us directly</Text>
          <Text
            className="mt-1 text-lg font-extrabold"
            style={{ color: colors.maroon }}
            onPress={() => Linking.openURL('tel:7986820055')}
          >
            📞 79868-20055
          </Text>
          <Text className="text-xs text-muted">(10 AM – 8 PM)</Text>
        </View>
      </ScrollView>
    </Screen>
  );
}
