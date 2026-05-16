import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type AllocationCategory = 'rent' | 'loan' | 'savings' | 'investment' | 'cc' | 'living' | 'other'

export interface PaycheckAllocation {
  id: string
  name: string
  amount: number
  dueDate?: string
  category: AllocationCategory
  isPaid: boolean
  note?: string
}

export interface Paycheck {
  id: string
  amount: number
  date: string
  label: string
  allocations: PaycheckAllocation[]
  notes?: string
  isArchived: boolean
}

interface PaycheckStore {
  paychecks: Paycheck[]
  addPaycheck: (data: Omit<Paycheck, 'id' | 'allocations' | 'isArchived'>) => void
  removePaycheck: (id: string) => void
  archivePaycheck: (id: string) => void
  addAllocation: (paycheckId: string, allocation: Omit<PaycheckAllocation, 'id' | 'isPaid'>) => void
  removeAllocation: (paycheckId: string, allocationId: string) => void
  togglePaid: (paycheckId: string, allocationId: string) => void
  updatePaycheckAmount: (id: string, amount: number) => void
}

export const usePaycheckStore = create<PaycheckStore>()(
  persist(
    (set) => ({
      paychecks: [],
      addPaycheck: (data) =>
        set((s) => ({
          paychecks: [
            { ...data, id: crypto.randomUUID(), allocations: [], isArchived: false },
            ...s.paychecks,
          ],
        })),
      removePaycheck: (id) =>
        set((s) => ({ paychecks: s.paychecks.filter((p) => p.id !== id) })),
      archivePaycheck: (id) =>
        set((s) => ({
          paychecks: s.paychecks.map((p) => (p.id === id ? { ...p, isArchived: true } : p)),
        })),
      addAllocation: (paycheckId, allocation) =>
        set((s) => ({
          paychecks: s.paychecks.map((p) =>
            p.id === paycheckId
              ? { ...p, allocations: [...p.allocations, { ...allocation, id: crypto.randomUUID(), isPaid: false }] }
              : p
          ),
        })),
      removeAllocation: (paycheckId, allocationId) =>
        set((s) => ({
          paychecks: s.paychecks.map((p) =>
            p.id === paycheckId
              ? { ...p, allocations: p.allocations.filter((a) => a.id !== allocationId) }
              : p
          ),
        })),
      togglePaid: (paycheckId, allocationId) =>
        set((s) => ({
          paychecks: s.paychecks.map((p) =>
            p.id === paycheckId
              ? {
                  ...p,
                  allocations: p.allocations.map((a) =>
                    a.id === allocationId ? { ...a, isPaid: !a.isPaid } : a
                  ),
                }
              : p
          ),
        })),
      updatePaycheckAmount: (id, amount) =>
        set((s) => ({
          paychecks: s.paychecks.map((p) => (p.id === id ? { ...p, amount } : p)),
        })),
    }),
    { name: 'em-paychecks', version: 1 }
  )
)
