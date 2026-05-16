import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Expense, UpcomingExpense } from '@/types/expense'

interface ExpenseStore {
  expenses: Expense[]
  addExpense: (data: Omit<Expense, 'id' | 'createdAt'>) => void
  removeExpense: (id: string) => void
  updateExpense: (id: string, patch: Partial<Expense>) => void
  clearAll: () => void
}

export const useExpenseStore = create<ExpenseStore>()(
  persist(
    (set) => ({
      expenses: [],
      addExpense: (data) =>
        set((s) => ({
          expenses: [
            { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
            ...s.expenses,
          ],
        })),
      removeExpense: (id) =>
        set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) })),
      updateExpense: (id, patch) =>
        set((s) => ({
          expenses: s.expenses.map((e) => (e.id === id ? { ...e, ...patch } : e)),
        })),
      clearAll: () => set({ expenses: [] }),
    }),
    { name: 'em-expenses', version: 1 }
  )
)

interface UpcomingStore {
  upcoming: UpcomingExpense[]
  addUpcoming: (data: Omit<UpcomingExpense, 'id' | 'createdAt'>) => void
  removeUpcoming: (id: string) => void
  updateUpcoming: (id: string, patch: Partial<UpcomingExpense>) => void
}

export const useUpcomingStore = create<UpcomingStore>()(
  persist(
    (set) => ({
      upcoming: [],
      addUpcoming: (data) =>
        set((s) => ({
          upcoming: [
            { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() },
            ...s.upcoming,
          ],
        })),
      removeUpcoming: (id) =>
        set((s) => ({ upcoming: s.upcoming.filter((u) => u.id !== id) })),
      updateUpcoming: (id, patch) =>
        set((s) => ({
          upcoming: s.upcoming.map((u) => (u.id === id ? { ...u, ...patch } : u)),
        })),
    }),
    { name: 'em-upcoming', version: 1 }
  )
)
