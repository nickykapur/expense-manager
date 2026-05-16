import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { StockHolding, VestEvent } from '@/types/stock'

interface StockStore {
  holdings: StockHolding[]
  addHolding: (data: Omit<StockHolding, 'id' | 'createdAt'>) => void
  removeHolding: (id: string) => void
  updateHolding: (id: string, patch: Partial<StockHolding>) => void
  addVestEvent: (holdingId: string, event: Omit<VestEvent, 'id'>) => void
  markVested: (holdingId: string, eventId: string) => void
}

export const useStockStore = create<StockStore>()(
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
      addVestEvent: (holdingId, event) =>
        set((s) => ({
          holdings: s.holdings.map((h) =>
            h.id === holdingId
              ? { ...h, vestingSchedule: [...h.vestingSchedule, { ...event, id: crypto.randomUUID() }] }
              : h
          ),
        })),
      markVested: (holdingId, eventId) =>
        set((s) => ({
          holdings: s.holdings.map((h) => {
            if (h.id !== holdingId) return h
            const event = h.vestingSchedule.find((e) => e.id === eventId)
            const newVestedShares = h.vestedShares + (event?.shares ?? 0)
            return {
              ...h,
              vestedShares: newVestedShares,
              vestingSchedule: h.vestingSchedule.map((e) =>
                e.id === eventId ? { ...e, vested: true } : e
              ),
            }
          }),
        })),
    }),
    { name: 'em-stocks', version: 1 }
  )
)
