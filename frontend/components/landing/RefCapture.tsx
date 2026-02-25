"use client";

import { useEffect } from "react";

export default function RefCapture() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get("ref");
    if (ref) {
      localStorage.setItem("leme_ref_parceiro", ref);
    }
  }, []);

  return null; // Componente invisível
}
