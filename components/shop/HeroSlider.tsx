"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

/**
 * Hero — BANNER1 only. Rendered at natural ratio with w-full h-auto
 * so the baked-in headline can never be cropped, on any screen size.
 */
export default function HeroSlider() {
  return (
    <Link
      href="/products"
      aria-label="Har Pooja Mein Maa Ka Aashirvaad — Shuddh Pooja Samagri, Ab Aapke Ghar Tak"
      className="block w-full overflow-hidden rounded-lg bg-[#3B0E0E]"
    >
      <Image
        src="/images/BANNER1.png"
        alt="Har Pooja Mein Maa Ka Aashirvaad — Shuddh Pooja Samagri, Ab Aapke Ghar Tak"
        width={2017}
        height={780}
        priority
        sizes="(max-width: 768px) 100vw, 80rem"
        className="w-full h-auto"
      />
    </Link>
  );
}
