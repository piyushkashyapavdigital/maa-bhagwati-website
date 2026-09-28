import type { Metadata } from "next";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/CartDrawer";
import StickyCartBar from "@/components/shop/StickyCartBar";
import WhatsAppWidget from "@/components/WhatsAppWidget";

export const metadata: Metadata = {
  title: "माँ भगवती पूजा भंडार | शुद्ध पूजा सामग्री, रुद्राक्ष, मूर्तियाँ एवं धार्मिक उत्पाद",
  description:
    "माँ भगवती पूजा भंडार - शुद्ध पूजा सामग्री, हवन सामग्री, अष्टधातु मूर्तियाँ, रुद्राक्ष, राशि रत्न, एवं ज्योतिष परामर्श। पूरे भारत में होम डिलीवरी।",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hi" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#FAF5EF] text-[#2C1B17] font-sans selection:bg-[#6b1d1d] selection:text-white">
        <CartProvider>
          {children}
          <CartDrawer />
          <StickyCartBar />
          <WhatsAppWidget />
        </CartProvider>
      </body>
    </html>
  );
}
