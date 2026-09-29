import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useAuth } from '../auth';
import { ErrorBanner } from '../components/ErrorBanner';
import { FormField } from '../components/FormField';
import { GradientHeader } from '../components/GradientHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import type { RootStackParamList } from '../navigation/types';

export function AuthScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, sendMagicLink } = useAuth();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  React.useEffect(() => {
    if (user) nav.replace('Main', { screen: 'Account' });
  }, [user, nav]);

  const send = async () => {
    setBusy(true);
    setError('');
    try {
      await sendMagicLink(email);
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not send link');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen>
      <GradientHeader
        title="Sign in 🪔"
        subtitle="Password-free login"
        onBack={() => nav.goBack()}
      />
      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: 48 }}
        keyboardShouldPersistTaps="handled"
      >
        <ErrorBanner message={error} />
        {sent ? (
          <View className="rounded-3xl border border-leaf/40 bg-leaf/10 p-6">
            <Text className="text-center text-4xl">📧</Text>
            <Text className="mt-3 text-center text-base font-extrabold text-ink">
              Check your email!
            </Text>
            <Text className="mt-2 text-center text-sm leading-6 text-muted">
              We sent a magic link to{'\n'}
              <Text className="font-bold text-ink">{email.trim()}</Text>
              {'\n'}Tap it on this phone to sign in. The link expires in 1 hour.
            </Text>
            <View className="mt-5">
              <PrimaryButton
                title="Use a different email"
                variant="ghost"
                onPress={() => setSent(false)}
              />
            </View>
          </View>
        ) : (
          <View className="rounded-3xl border border-line bg-white p-6">
            <Text className="mb-1 text-base font-extrabold text-ink">
              Login with email link
            </Text>
            <Text className="mb-4 text-xs leading-5 text-muted">
              No password to remember. Enter your email, tap the link we send,
              and you're in — your orders stay linked to you.
            </Text>
            <FormField
              label="Email address"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              onSubmitEditing={send}
              returnKeyType="send"
            />
            <PrimaryButton title="Send me the link" loading={busy} onPress={send} />
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}
