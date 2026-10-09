import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import {
  NavigationContainer,
  createNavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React, { useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { AnalyticsScreen } from '../screens/AnalyticsScreen';
import { BannersScreen } from '../screens/BannersScreen';
import { CategoriesScreen } from '../screens/CategoriesScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { MessagesScreen } from '../screens/MessagesScreen';
import { MoreScreen } from '../screens/MoreScreen';
import { OrderDetailScreen } from '../screens/OrderDetailScreen';
import { OrdersScreen } from '../screens/OrdersScreen';
import { ProductEditorScreen } from '../screens/ProductEditorScreen';
import { ProductsScreen } from '../screens/ProductsScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { colors } from '../theme';
import { PushBanner } from '../components/PushBanner';
import { initialPushOpen, onPushOpened, registerAdminPush, watchForegroundPush, type PushEvent } from '../push';
import type { RootStackParamList, MainTabParamList } from './types';

export const navigationRef =
  createNavigationContainerRef<RootStackParamList>();

function openPush(e: PushEvent) {
  if (!navigationRef.isReady()) return;
  if (e.type === 'order' && e.id) {
    navigationRef.navigate('OrderDetail', { id: e.id });
  } else if (e.type === 'message') {
    navigationRef.navigate('Messages');
  } else {
    navigationRef.navigate('Main', { screen: 'Orders' });
  }
}

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

const TAB_ICONS: Record<keyof MainTabParamList, string> = {
  Dashboard: 'home',
  Products: 'inventory',
  Orders: 'receipt-long',
  Analytics: 'bar-chart',
  More: 'menu',
};

function MainTabs() {
  const insets = useSafeAreaInsets();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.maroon,
        tabBarInactiveTintColor: '#A8A29E',
        tabBarIcon: ({ focused, size }) => (
          <Icon
            name={TAB_ICONS[route.name]}
            size={size}
            color={focused ? colors.maroon : '#A8A29E'}
          />
        ),
        tabBarStyle: {
          backgroundColor: colors.paper,
          borderTopColor: colors.line,
          // Lift above 3-button nav keys; ~0 extra on gesture-nav phones.
          height: 62 + insets.bottom,
          paddingBottom: 8 + insets.bottom,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700' },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Products" component={ProductsScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Analytics" component={AnalyticsScreen} />
      <Tab.Screen name="More" component={MoreScreen} />
    </Tab.Navigator>
  );
}

export function RootStack({ authed }: { authed: boolean }) {
  useEffect(() => {
    if (!authed) return;
    registerAdminPush();
    const off = watchForegroundPush();
    initialPushOpen().then((e) => {
      if (e) setTimeout(() => openPush(e), 800);
    });
    const opened = onPushOpened(openPush);
    return () => {
      off();
      opened();
    };
  }, [authed]);

  return (
    <NavigationContainer ref={navigationRef}>
      {authed ? <PushBanner onOpen={openPush} /> : null}
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }}>
        {!authed ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="ProductEditor" component={ProductEditorScreen} />
            <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
            <Stack.Screen name="Categories" component={CategoriesScreen} />
            <Stack.Screen name="Banners" component={BannersScreen} />
            <Stack.Screen name="Messages" component={MessagesScreen} />
            <Stack.Screen name="Settings" component={SettingsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
