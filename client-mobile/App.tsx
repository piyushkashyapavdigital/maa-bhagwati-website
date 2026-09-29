import './global.css';

import React from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/auth';
import { CartProvider } from './src/cart';
import { LoadingView } from './src/components/LoadingView';
import { RootStack } from './src/navigation/RootNavigator';
import { ShopProvider } from './src/shop';

function Root() {
  const { ready } = useAuth();
  if (!ready) return <LoadingView label="Shubh Aarambh 🪔" />;
  return <RootStack />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <ShopProvider>
            <CartProvider>
              <Root />
            </CartProvider>
          </ShopProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
