"use client";

import { createContext, useContext, useState, useCallback } from "react";
import { GitHubFile } from "@/types";
import React from "react";

interface ClipboardState {
  action: "cut";
  items: GitHubFile[];
  sourceDir: string;
}

interface ClipboardContextType {
  clipboard: ClipboardState | null;
  cut: (items: GitHubFile[], sourceDir: string) => void;
  clearClipboard: () => void;
}

const ClipboardContext = createContext<ClipboardContextType>({
  clipboard: null,
  cut: () => {},
  clearClipboard: () => {},
});

export function ClipboardProvider({ children }: { children: React.ReactNode }) {
  const [clipboard, setClipboard] = useState<ClipboardState | null>(null);

  const cut = useCallback((items: GitHubFile[], sourceDir: string) => {
    setClipboard({ action: "cut", items, sourceDir });
  }, []);

  const clearClipboard = useCallback(() => {
    setClipboard(null);
  }, []);

  return React.createElement(
    ClipboardContext.Provider,
    { value: { clipboard, cut, clearClipboard } },
    children
  );
}

export function useClipboard() {
  return useContext(ClipboardContext);
}
