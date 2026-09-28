"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

/**
 * Complete Pooja Kits — BANNER6 only. No HTML text overlay (the text
 * lives inside the image). Rendered at natural ratio with w-full h-auto
 * so the baked-in text can never be cropped, on any screen size.
 */
export default function PoojaKitsSection() {
  return (
    <section>
      <Link
        href="/products"
        aria-label="Complete Pooja Kits — Sabhi Aavashyak Samagri ek hi Pack mein"
        className="block w-full overflow-hidden rounded-lg bg-[#4E1212]"
      >
        <Image
          src="/images/BANNER6.png"
          alt="Complete Pooja Kits — Sabhi Aavashyak Samagri ek hi Pack mein"
          width={2170}
          height={725}
          sizes="(max-width: 768px) 100vw, 80rem"
          className="w-full h-auto"
        />
      </Link>
    </section>
  );
}
