"use client";

import { useEffect } from "react";

export function ForceDarkDocsTheme() {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light");
    root.classList.add("dark");
    root.setAttribute("data-theme", "dark");
  }, []);

  return null;
}
