import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import React, { useEffect, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';
import { useAuth } from '../auth';
import {
  DEFAULT_API_URL,
  DEFAULT_SITE_URL,
  api,
  getApiBase,
  getSiteBase,
  setApiBase,
  setSiteBase,
} from '../api';
import { FormField } from '../components/FormField';
import { GradientHeader } from '../components/GradientHeader';
import { PrimaryButton } from '../components/PrimaryButton';
import { Screen } from '../components/Screen';
import type { RootStackParamList } from '../navigation/types';
import { colors } from '../theme';

export function SettingsScreen() {
  const nav = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { logout } = useAuth();
  const [apiUrl, setApiUrl] = useState(getApiBase());
  const [siteUrl, setSiteUrl] = useState(getSiteBase());
  const [saved, setSaved] = useState('');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState('');

  useEffect(() => {
    setApiUrl(getApiBase());
    setSiteUrl(getSiteBase());
  }, []);

  const save = async () => {
    await setApiBase(apiUrl || DEFAULT_API_URL);
    await setSiteBase(siteUrl || DEFAULT_SITE_URL);
    setApiUrl(getApiBase());
    setSiteUrl(getSiteBase());
    setSaved(' Saved');
    setTimeout(() => setSaved(''), 2000);
  };

  const test = async () => {
    setTesting(true);
    setTestResult('');
    try {
      await setApiBase(apiUrl || DEFAULT_API_URL);
      await api.get('/health');
      setTestResult(' Server reachable');
    } catch (e) {
      setTestResult(e instanceof Error ? e.message : 'Connection failed');
    } finally {
      setTesting(false);
    }
  };

  return (
    <Screen>
      <GradientHeader
        title="Settings"
        subtitle="Connections & session"
        onBack={() => nav.goBack()}
      />
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 48 }}>
        <View className="mb-5 rounded-2xl border border-line bg-white p-5">
          <Text className="mb-4 text-sm font-extrabold uppercase tracking-wide text-maroon">
            API server
          </Text>
          <FormField
            label="API base URL"
            value={apiUrl}
            onChangeText={setApiUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            placeholder={DEFAULT_API_URL}
          />
          <FormField
            label="Website base URL (product images)"
            value={siteUrl}
            onChangeText={setSiteUrl}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
            placeholder={DEFAULT_SITE_URL}
          />
          <View className="gap-3">
            <PrimaryButton title="Save" onPress={save} />
            <PrimaryButton
              title={testing ? 'Testing' : 'Test connection'}
              variant="gold"
              loading={testing}
              onPress={test}
            />
          </View>
          {saved ? <Text className="mt-3 text-sm font-bold text-leaf">{saved}</Text> : null}
          {testResult ? (
            <Text
              className={`mt-2 text-sm ${
                testResult.startsWith('') ? 'text-leaf' : 'text-ruby'
              }`}
            >
              {testResult}
            </Text>
          ) : null}
        </View>

        <View className="mb-5 rounded-2xl border border-line bg-white p-5">
          <Text className="mb-2 text-sm font-extrabold uppercase tracking-wide text-maroon">
            Device setup
          </Text>
          <Text className="text-xs leading-5 text-muted">
            Live setup:{'\n\n'}
            API base URL{'\n'}
            <Text className="font-mono text-[11px] text-ink">
              https://maa-bhagwati.vercel.app
            </Text>
            {'\n\n'}
            The admin app syncs directly with the live website. Product images load from the same address — no computer or cable needed.
          </Text>
        </View>

        <PrimaryButton
          title="Log out"
          variant="danger"
          onPress={async () => {
            await logout();
          }}
        />
        <Text className="mt-6 text-center text-xs text-muted">
          Maa Bhagwati Pooja Bhandar · Admin v1.0
        </Text>
      </ScrollView>
    </Screen>
  );
}
