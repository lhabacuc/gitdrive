"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface UseDragSelectOptions {
  containerRef: React.RefObject<HTMLElement | null>;
  itemSelector: string;
  onSelectionChange: (paths: Set<string>) => void;
}

function rectsOverlap(a: Rect, b: Rect) {
  return !(
    a.x + a.width < b.x ||
    b.x + b.width < a.x ||
    a.y + a.height < b.y ||
    b.y + b.height < a.y
  );
}

export function useDragSelect({ containerRef, itemSelector, onSelectionChange }: UseDragSelectOptions) {
  const [lassoRect, setLassoRect] = useState<Rect | null>(null);
  const dragging = useRef(false);
  const startPos = useRef({ x: 0, y: 0 });

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      // Only left-click on the grid background (not on items)
      if (e.button !== 0) return;
      const target = e.target as HTMLElement;
      if (target.closest(itemSelector)) return;

      const container = containerRef.current;
      if (!container) return;

      dragging.current = true;
      const rect = container.getBoundingClientRect();
      startPos.current = {
        x: e.clientX - rect.left + container.scrollLeft,
        y: e.clientY - rect.top + container.scrollTop,
      };
      setLassoRect(null);

      // If not holding shift/cmd, clear selection
      if (!e.shiftKey && !e.metaKey && !e.ctrlKey) {
        onSelectionChange(new Set());
      }

      e.preventDefault();
    },
    [containerRef, itemSelector, onSelectionChange]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    function handleMouseMove(e: MouseEvent) {
      if (!dragging.current || !container) return;

      const rect = container.getBoundingClientRect();
      const currentX = e.clientX - rect.left + container.scrollLeft;
      const currentY = e.clientY - rect.top + container.scrollTop;

      const lasso: Rect = {
        x: Math.min(startPos.current.x, currentX),
        y: Math.min(startPos.current.y, currentY),
        width: Math.abs(currentX - startPos.current.x),
        height: Math.abs(currentY - startPos.current.y),
      };

      setLassoRect(lasso);

      // Determine which items are inside the lasso
      const items = container.querySelectorAll(itemSelector);
      const selected = new Set<string>();

      items.forEach((item) => {
        const itemRect = item.getBoundingClientRect();
        const itemRelative: Rect = {
          x: itemRect.left - rect.left + container.scrollLeft,
          y: itemRect.top - rect.top + container.scrollTop,
          width: itemRect.width,
          height: itemRect.height,
        };

        if (rectsOverlap(lasso, itemRelative)) {
          const path = (item as HTMLElement).dataset.itemPath;
          if (path) selected.add(path);
        }
      });

      onSelectionChange(selected);
    }

    function handleMouseUp() {
      dragging.current = false;
      setLassoRect(null);
    }

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [containerRef, itemSelector, onSelectionChange]);

  return { lassoRect, handleMouseDown };
}
