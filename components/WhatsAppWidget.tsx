"use client";

import React, { useEffect, useState } from "react";

export default function WhatsAppWidget() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), 10000);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <a
      href="https://wa.me/917986820055?text=Namaste!%20Maa%20Bhagwati%20Pooja%20Bhandar%20se%20order%20karna%20hai."
      target="_blank"
      rel="noreferrer"
      className="fixed bottom-16 right-4 z-50 flex items-center gap-2 bg-[#25D366] text-white px-4 py-3 rounded-full shadow-lg hover:shadow-xl hover:scale-105 transition-all animate-in fade-in slide-in-from-bottom-4 duration-300"
      title="Chat on WhatsApp"
    >
      <svg className="w-6 h-6" viewBox="0 0 32 32" fill="currentColor">
        <path d="M16 3C9.4 3 4 8.4 4 15c0 2.4.7 4.7 2 6.7L4.3 29l7.4-1.9c1.4.7 2.9 1.1 4.4 1.1 6.6 0 12-5.4 12-12S22.6 3 16 3zm0 21.8c-1.3 0-2.6-.3-3.8-.9l-.8-.4-4.4 1.1 1.2-4.3-.5-.8c-1-1.6-1.5-3.4-1.5-5.3 0-5.4 4.4-9.8 9.8-9.8s9.8 4.4 9.8 9.8-4.4 9.6-9.8 9.6zm5.3-7.3c-.3-.1-1.7-.8-2-.9-.3-.1-.4-.1-.6.1-.2.3-.7.9-.9 1.1-.1.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.4.1-.6l.4-.5c.1-.1.2-.3.3-.4.1-.1.1-.3 0-.4-.1-.1-.6-1.4-.8-1.9-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-1 1-1 2.4s1.1 2.7 1.2 2.9c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3z" />
      </svg>
      <span className="text-xs font-bold">Chat with us</span>
    </a>
  );
}