"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

export function Header() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Muda o estado quando scroll passa de 50px
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 h-20 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-md border-b border-border/40"
          : "bg-white"
      }`}
    >
      <div className="h-full px-6 lg:px-20 flex justify-between items-center">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/images/logo.svg"
            alt="Leme"
            width={32}
            height={32}
            className="h-8 w-auto"
          />
          <span className="text-xl font-semibold text-primary">Leme</span>
        </Link>

        {/* CTA */}
        <Link
          href="/analise"
          className="bg-primary hover:bg-primary/90 text-white px-6 py-2.5 rounded-full font-medium transition duration-300"
        >
          Começar
        </Link>
      </div>
    </header>
  );
}