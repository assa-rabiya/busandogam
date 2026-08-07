"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { calculateDiscoveryScore } from "../services/scoring";
import type { CollectionEntry, Discovery, DiscoveryDraft } from "../types/discovery";
import { useAuth } from "./auth-provider";

const storageKey = "busan-sea-guide-discoveries-v1";
const schemaVersion = 1;
interface StoredData { version: number; records: Discovery[]; }
interface DiscoveryContextValue {
  records: Discovery[]; isReady: boolean; isSaving: boolean; error: string | null;
  createDiscovery: (draft: DiscoveryDraft) => Promise<Discovery>;
  getDiscovery: (id: string) => Discovery | undefined;
  getRecentDiscoveries: (limit?: number) => Discovery[];
  getDiscoveriesBySpecies: (speciesId: string) => Discovery[];
  getDiscoveriesByLocation: (locationName: string) => Discovery[];
  getCollectionEntries: () => CollectionEntry[];
  clearError: () => void;
}
const DiscoveryContext = createContext<DiscoveryContextValue | null>(null);

function safelyReadRecords(key: string, allowLegacy = false): Discovery[] {
  try {
    const raw = window.localStorage.getItem(key) ?? (allowLegacy ? window.localStorage.getItem(storageKey) : null);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Partial<StoredData>;
    return parsed.version === schemaVersion && Array.isArray(parsed.records) ? parsed.records.filter((record): record is Discovery => Boolean(record?.id && record.speciesId && record.locationName)) : [];
  } catch { window.localStorage.removeItem(key); return []; }
}

export function DiscoveryProvider({ children }: { children: React.ReactNode }) {
  const { user, isReady: isAuthReady } = useAuth();
  const [records, setRecords] = useState<Discovery[]>([]);
  const [isReady, setReady] = useState(false);
  const [isSaving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const saveLock = useRef(false);
  const accountId = user?.id ?? "anonymous";
  const accountStorageKey = `${storageKey}-${accountId}`;
  useEffect(() => {
    if (!isAuthReady) return;
    const timer = window.setTimeout(() => {
      setRecords(safelyReadRecords(accountStorageKey, accountId === "demo-explorer-minsu"));
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [accountId, accountStorageKey, isAuthReady]);
  const persist = useCallback((next: Discovery[]) => window.localStorage.setItem(accountStorageKey, JSON.stringify({ version: schemaVersion, records: next } satisfies StoredData)), [accountStorageKey]);
  const createDiscovery = useCallback(async (draft: DiscoveryDraft) => {
    if (saveLock.current) throw new Error("저장 요청을 처리하고 있어요.");
    saveLock.current = true; setSaving(true); setError(null);
    await new Promise((resolve) => setTimeout(resolve, 450));
    try {
      if (draft.memo.includes("#저장실패")) throw new Error("발표용 저장 실패 상태가 실행되었습니다.");
      const score = calculateDiscoveryScore(draft, records);
      const record: Discovery = { ...draft, id: globalThis.crypto?.randomUUID?.() ?? `discovery-${Date.now()}`, scoreAwarded: score.score, duplicateWarning: score.duplicateWarning, isNewSpecies: score.isNewSpecies, createdAt: new Date().toISOString() };
      const next = [record, ...records]; persist(next); setRecords(next); return record;
    } catch (cause) { const message = cause instanceof Error ? cause.message : "기록 저장에 실패했어요."; setError(message); throw cause; }
    finally { saveLock.current = false; setSaving(false); }
  }, [persist, records]);
  const getDiscovery = useCallback((id: string) => records.find((record) => record.id === id), [records]);
  const getRecentDiscoveries = useCallback((limit = 6) => [...records].sort((a, b) => b.discoveredAt.localeCompare(a.discoveredAt)).slice(0, limit), [records]);
  const getDiscoveriesBySpecies = useCallback((speciesId: string) => records.filter((record) => record.speciesId === speciesId), [records]);
  const getDiscoveriesByLocation = useCallback((locationName: string) => records.filter((record) => record.locationName === locationName), [records]);
  const getCollectionEntries = useCallback(() => {
    const ids = [...new Set(records.map((record) => record.speciesId))];
    return ids.map((speciesId) => { const found = records.filter((record) => record.speciesId === speciesId).sort((a, b) => a.discoveredAt.localeCompare(b.discoveredAt)); return { speciesId, speciesName: found[0].speciesName, discoveryCount: found.length, firstDiscoveredAt: found[0].discoveredAt, lastDiscoveredAt: found.at(-1)?.discoveredAt ?? found[0].discoveredAt, locationCount: new Set(found.map((record) => record.locationName)).size, maxRecordedSize: Math.max(...found.map((record) => record.size ?? 0)) || null, unlocked: true }; });
  }, [records]);
  const value = useMemo(() => ({ records, isReady, isSaving, error, createDiscovery, getDiscovery, getRecentDiscoveries, getDiscoveriesBySpecies, getDiscoveriesByLocation, getCollectionEntries, clearError: () => setError(null) }), [createDiscovery, error, getCollectionEntries, getDiscoveriesByLocation, getDiscoveriesBySpecies, getDiscovery, getRecentDiscoveries, isReady, isSaving, records]);
  return <DiscoveryContext.Provider value={value}>{children}</DiscoveryContext.Provider>;
}
export function useDiscoveries() { const context = useContext(DiscoveryContext); if (!context) throw new Error("useDiscoveries must be used within DiscoveryProvider"); return context; }
