import type { Expense } from './expense'

export interface MonthSnapshot {
  id: string
  monthKey: string   // "2025-04"
  label: string      // "April 2025"
  totalSpent: number
  expenseCount: number
  expenses: Expense[]
  notes?: string
  archivedAt: string
}
