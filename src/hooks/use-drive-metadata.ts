"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export interface ItemMetadata {
  owner: string;
  repo: string;
  path: string;
  name: string;
  type: "file" | "dir";
  starred?: boolean;
  tags?: string[];
  lastOpenedAt?: string;
}

interface MetadataStore {
  items: Record<string, ItemMetadata>;
}

const STORAGE_KEY = "gitdrive_item_metadata_v1";
const SYNC_EVENT = "gitdrive-metadata-updated";

function makeKey(owner: string, repo: string, path: string) {
  return `${owner}/${repo}:${path}`;
}

function readStore(): MetadataStore {
  if (typeof window === "undefined") return { items: {} };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { items: {} };
    const parsed = JSON.parse(raw) as MetadataStore;
    return parsed && parsed.items ? parsed : { items: {} };
  } catch {
    return { items: {} };
  }
}

function writeStore(store: MetadataStore) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
  window.dispatchEvent(new Event(SYNC_EVENT));
}

export function useDriveMetadata(owner?: string, repo?: string) {
  const [store, setStore] = useState<MetadataStore>({ items: {} });

  const refresh = useCallback(() => {
    setStore(readStore());
  }, []);

  useEffect(() => {
    refresh();
    const onSync = () => refresh();
    window.addEventListener("storage", onSync);
    window.addEventListener(SYNC_EVENT, onSync);
    return () => {
      window.removeEventListener("storage", onSync);
      window.removeEventListener(SYNC_EVENT, onSync);
    };
  }, [refresh]);

  const scopedItems = useMemo(() => {
    if (!owner || !repo) return [];
    return Object.values(store.items).filter(
      (item) => item.owner === owner && item.repo === repo
    );
  }, [owner, repo, store.items]);

  const upsertItem = useCallback((item: ItemMetadata) => {
    const next = readStore();
    const key = makeKey(item.owner, item.repo, item.path);
    next.items[key] = {
      ...next.items[key],
      ...item,
    };
    writeStore(next);
    setStore(next);
  }, []);

  const toggleStar = useCallback(
    (item: Omit<ItemMetadata, "starred" | "tags" | "lastOpenedAt">) => {
      const next = readStore();
      const key = makeKey(item.owner, item.repo, item.path);
      const current = next.items[key];
      next.items[key] = {
        ...current,
        ...item,
        starred: !current?.starred,
      };
      writeStore(next);
      setStore(next);
      return !!next.items[key].starred;
    },
    []
  );

  const setTags = useCallback(
    (
      item: Omit<ItemMetadata, "starred" | "tags" | "lastOpenedAt">,
      tags: string[]
    ) => {
      const cleaned = Array.from(
        new Set(tags.map((t) => t.trim()).filter(Boolean))
      ).slice(0, 8);
      const next = readStore();
      const key = makeKey(item.owner, item.repo, item.path);
      next.items[key] = {
        ...next.items[key],
        ...item,
        tags: cleaned,
      };
      writeStore(next);
      setStore(next);
      return cleaned;
    },
    []
  );

  const addRecent = useCallback(
    (item: Omit<ItemMetadata, "starred" | "tags" | "lastOpenedAt">) => {
      const next = readStore();
      const key = makeKey(item.owner, item.repo, item.path);
      next.items[key] = {
        ...next.items[key],
        ...item,
        lastOpenedAt: new Date().toISOString(),
      };
      writeStore(next);
      setStore(next);
    },
    []
  );

  const isStarred = useCallback(
    (path: string) => {
      if (!owner || !repo) return false;
      return !!store.items[makeKey(owner, repo, path)]?.starred;
    },
    [owner, repo, store.items]
  );

  const getTags = useCallback(
    (path: string) => {
      if (!owner || !repo) return [];
      return store.items[makeKey(owner, repo, path)]?.tags || [];
    },
    [owner, repo, store.items]
  );

  return {
    scopedItems,
    allItems: Object.values(store.items),
    isStarred,
    getTags,
    upsertItem,
    toggleStar,
    setTags,
    addRecent,
    refresh,
  };
}
