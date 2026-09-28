"use client";

import React from "react";

export default function TopAnnouncementBar() {
  return (
    <div className="bg-[#3B0E0E] text-white text-[10px] sm:text-[11px] py-1.5 px-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-1 font-medium">
          <span className="text-[10px]">🚚</span>
          <span>Free Home Delivery on orders above ₹999</span>
        </div>

        <div className="hidden sm:flex items-center gap-1 font-bold text-[#E5C07B] tracking-wide">
          <span>||</span>
          <span>जय माता दी</span>
          <span>||</span>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://maps.google.com/?q=Zirakpur"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 hover:text-[#E5C07B] transition-colors font-medium"
          >
            <span className="text-[10px]">📍</span>
            <span>Zirakpur</span>
          </a>
          <a
            href="tel:7986820055"
            className="flex items-center gap-1 hover:text-[#E5C07B] transition-colors font-medium"
          >
            <span className="text-[10px]">📞</span>
            <span>79868-20055</span>
          </a>
        </div>
      </div>
    </div>
  );
}
