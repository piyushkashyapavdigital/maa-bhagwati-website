import type { NavigatorScreenParams } from '@react-navigation/native';

export type MainTabParamList = {
  Dashboard: undefined;
  Products: undefined;
  Orders: undefined;
  Analytics: undefined;
  More: undefined;
};

export type RootStackParamList = {
  Login: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
  ProductEditor: { id?: string };
  OrderDetail: { id: string };
  Categories: undefined;
  Banners: undefined;
  Messages: undefined;
  Settings: undefined;
};
