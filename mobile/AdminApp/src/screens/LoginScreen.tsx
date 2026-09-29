import React, { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../auth';
import { FormField } from '../components/FormField';
import { PrimaryButton } from '../components/PrimaryButton';
import { colors } from '../theme';

export function LoginScreen() {
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError('');
    setLoading(true);
    try {
      await login(token);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={[colors.maroon, colors.maroonDark, '#2A0808']}
      className="flex-1"
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        className="flex-1"
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            padding: 24,
            paddingTop: insets.top + 24,
            paddingBottom: insets.bottom + 24,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="items-center">
            <View className="h-24 w-24 items-center justify-center rounded-full bg-gold shadow-lg">
              <Text className="text-5xl"></Text>
            </View>
            <Text className="mt-5 text-center text-3xl font-extrabold text-white">
              Maa Bhagwati
            </Text>
            <Text className="mt-1 text-center text-lg font-semibold text-gold-light">
              Pooja Bhandar · Admin
            </Text>
            <View className="mt-3 h-1 w-20 rounded-full bg-gold" />
          </View>

          <View className="mt-10 rounded-3xl bg-white p-6 shadow-xl">
            <Text className="mb-4 text-sm font-bold uppercase tracking-wider text-muted">
              Enter admin token
            </Text>
            <FormField
              label="Token"
              value={token}
              onChangeText={setToken}
              placeholder="bhagwati-dev-token…"
              autoCapitalize="none"
              autoCorrect={false}
              secureTextEntry
              error={error || undefined}
              onSubmitEditing={submit}
              returnKeyType="go"
            />
            <PrimaryButton
              title="Unlock Dashboard"
              variant="gold"
              loading={loading}
              onPress={submit}
            />
            <Text className="mt-4 text-center text-xs leading-4 text-muted">
              Token is the ADMIN_TOKEN value.{'\n'}
              Ask the site owner for the token.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}
