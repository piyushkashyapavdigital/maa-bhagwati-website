import './global.css';

import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/auth';
import { LoadingView } from './src/components/LoadingView';
import { RootStack } from './src/navigation/RootNavigator';

function Root() {
  const { ready, authed } = useAuth();
  if (!ready) return <LoadingView label="Waking up 🪔" />;
  return <RootStack authed={authed} />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <Root />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
