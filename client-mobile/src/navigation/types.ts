export type MainTabParamList = {
  Home: undefined;
  Shop: undefined;
  Cart: undefined;
  Orders: undefined;
  Account: undefined;
};

export type RootStackParamList = {
  Main: { screen?: keyof MainTabParamList } | undefined;
  Auth: undefined;
  Category: { slug: string };
  Product: { id: string };
  Checkout: undefined;
  OrderSuccess: { paymentId: string; orderId: string; total: number };
  OrderDetail: { id: string };
  Contact: undefined;
};
