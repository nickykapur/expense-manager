import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { CryptoHolding } from '@/types/crypto'

interface CryptoStore {
  holdings: CryptoHolding[]
  addHolding: (data: Omit<CryptoHolding, 'id' | 'createdAt'>) => void
  removeHolding: (id: string) => void
  updateHolding: (id: string, patch: Partial<CryptoHolding>) => void
}

export const useCryptoStore = create<CryptoStore>()(
  persist(
    (set) => ({
      holdings: [],
      addHolding: (data) =>
        set((s) => ({
          holdings: [
            { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
            ...s.holdings,
          ],
        })),
      removeHolding: (id) =>
        set((s) => ({ holdings: s.holdings.filter((h) => h.id !== id) })),
      updateHolding: (id, patch) =>
        set((s) => ({
          holdings: s.holdings.map((h) => (h.id === id ? { ...h, ...patch } : h)),
        })),
    }),
    { name: 'em-crypto', version: 1 }
  )
)
