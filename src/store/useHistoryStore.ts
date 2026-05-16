import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { MonthSnapshot } from '@/types/history'

interface HistoryStore {
  snapshots: MonthSnapshot[]
  addSnapshot: (snapshot: Omit<MonthSnapshot, 'id' | 'archivedAt'>) => void
  updateSnapshot: (id: string, patch: Partial<MonthSnapshot>) => void
  removeSnapshot: (id: string) => void
}

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set) => ({
      snapshots: [],
      addSnapshot: (data) =>
        set((s) => ({
          snapshots: [
            { ...data, id: crypto.randomUUID(), archivedAt: new Date().toISOString() },
            ...s.snapshots,
          ],
        })),
      updateSnapshot: (id, patch) =>
        set((s) => ({
          snapshots: s.snapshots.map((snap) => (snap.id === id ? { ...snap, ...patch } : snap)),
        })),
      removeSnapshot: (id) =>
        set((s) => ({ snapshots: s.snapshots.filter((snap) => snap.id !== id) })),
    }),
    { name: 'em-history', version: 1 }
  )
)
