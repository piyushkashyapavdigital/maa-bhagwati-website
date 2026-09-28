"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Pooja Samagri" },
  { href: "/category/rudrabhishek-samagri", label: "Rudrabhishek Samagri" },
  { href: "/category/havan-samagri", label: "Havan Samagri" },
  { href: "/category/pooja-bartan-aavashyak-saman", label: "Pooja Bartan & Aavashyak Saman" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="bg-gradient-to-b from-[#5a1616] to-[#6B1D1D] border-t border-white/5 border-b border-[#4a1010] px-4 lg:px-8 z-30 sticky top-[64px] sm:top-[76px] shadow-[0_2px_8px_rgba(60,10,10,0.3)]">
      <div className="max-w-7xl mx-auto flex items-center gap-px overflow-x-auto no-scrollbar">
        {LINKS.map((link) => {
          const active =
            link.href === "/"
              ? pathname === "/"
              : pathname === link.href || pathname.startsWith(link.href + "/");
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 sm:px-4 py-2.5 text-[11px] sm:text-[12px] font-semibold whitespace-nowrap transition-colors cursor-pointer relative",
                active
                  ? "text-[#E5C07B]"
                  : "text-white/70 hover:text-white"
              )}
            >
              {link.label}
              {active && (
                <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#E5C07B] rounded-t" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
