export type ExpenseCategory =
  | 'housing'
  | 'food'
  | 'transport'
  | 'utilities'
  | 'subscriptions'
  | 'health'
  | 'entertainment'
  | 'shopping'
  | 'other'

export interface Expense {
  id: string
  name: string
  amount: number
  category: ExpenseCategory
  note?: string
  createdAt: string
  isRecurring: boolean
}

export interface UpcomingExpense {
  id: string
  name: string
  amount: number
  dueDate: string
  category: ExpenseCategory
  note?: string
  createdAt: string
  priority: 'low' | 'medium' | 'high'
}

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  housing: 'Housing',
  food: 'Food',
  transport: 'Transport',
  utilities: 'Utilities',
  subscriptions: 'Subscriptions',
  health: 'Health',
  entertainment: 'Entertainment',
  shopping: 'Shopping',
  other: 'Other',
}

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  housing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  food: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  transport: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  utilities: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
  subscriptions: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  health: 'bg-green-500/20 text-green-400 border-green-500/30',
  entertainment: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  shopping: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
  other: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}
