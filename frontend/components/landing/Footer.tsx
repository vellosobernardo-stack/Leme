"use client";

import Link from "next/link";
import { Instagram, Linkedin, Youtube } from "lucide-react";

export function Footer() {
  return (
    <div className="bg-[#112D4E] border-t border-white/10 py-8">
      <div className="px-6 lg:px-20 max-w-7xl mx-auto">
        <div className="flex flex-col items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-semibold text-white">Leme</span>
          </Link>

          <a
            href="mailto:contato@leme.app.br"
            className="text-white/70 hover:text-white transition-colors duration-300"
          >
            contato@leme.app.br
          </a>

          <div className="flex items-center gap-4">
            <a
              href="https://instagram.com/leme.app"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:border-white/40 transition-all duration-300"
            >
              <Instagram className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:border-white/40 transition-all duration-300"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/70 hover:text-white hover:border-white/40 transition-all duration-300"
            >
              <Youtube className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
