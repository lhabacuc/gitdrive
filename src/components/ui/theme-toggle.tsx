"use client";

import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const cycle = () => {
    if (theme === "dark") setTheme("light");
    else if (theme === "light") setTheme("system");
    else setTheme("dark");
  };

  if (!mounted) return null;

  const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;
  const label = theme === "dark" ? "Dark" : theme === "light" ? "Light" : "System";

  return (
    <button
      onClick={cycle}
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 md:py-[7px] text-[13px] transition-colors text-muted-foreground hover:bg-foreground/[0.05] hover:text-foreground w-full"
    >
      <Icon className="h-[18px] w-[18px]" />
      {label}
    </button>
  );
}
