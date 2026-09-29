declare module 'react-native-razorpay' {
  export interface RazorpayOptions {
    key: string;
    amount: number;
    currency: string;
    name?: string;
    description?: string;
    image?: string;
    order_id?: string;
    prefill?: { name?: string; contact?: string; email?: string };
    notes?: Record<string, string>;
    theme?: { color?: string };
  }
  export interface RazorpaySuccess {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }
  const RazorpayCheckout: {
    open: (options: RazorpayOptions) => Promise<RazorpaySuccess>;
  };
  export default RazorpayCheckout;
}
