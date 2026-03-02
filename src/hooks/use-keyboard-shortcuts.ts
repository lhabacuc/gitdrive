"use client";

import { useEffect } from "react";

interface KeyboardShortcutsOptions {
  onSelectAll: () => void;
  onDelete: () => void;
  onDeselect: () => void;
  onOpen: () => void;
  onNavigate: (direction: "up" | "down" | "left" | "right") => void;
  enabled?: boolean;
}

export function useKeyboardShortcuts({
  onSelectAll,
  onDelete,
  onDeselect,
  onOpen,
  onNavigate,
  enabled = true,
}: KeyboardShortcutsOptions) {
  useEffect(() => {
    if (!enabled) return;

    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      const tag = target.tagName.toLowerCase();
      if (tag === "input" || tag === "textarea" || target.isContentEditable) return;
      if (target.closest("[role='dialog']")) return;

      if ((e.ctrlKey || e.metaKey) && e.key === "a") {
        e.preventDefault();
        onSelectAll();
        return;
      }

      if (e.key === "Delete" || e.key === "Backspace") {
        e.preventDefault();
        onDelete();
        return;
      }

      if (e.key === "Escape") {
        e.preventDefault();
        onDeselect();
        return;
      }

      if (e.key === "Enter") {
        e.preventDefault();
        onOpen();
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        onNavigate("up");
        return;
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        onNavigate("down");
        return;
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        onNavigate("left");
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        onNavigate("right");
        return;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [enabled, onSelectAll, onDelete, onDeselect, onOpen, onNavigate]);
}
