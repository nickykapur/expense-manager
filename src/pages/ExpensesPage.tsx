import { useState } from 'react'
import { Plus, Trash2, Wallet, RefreshCw, ChevronDown, ChevronUp, Archive } from 'lucide-react'
import toast from 'react-hot-toast'
import { useExpenseStore } from '@/store/useExpenseStore'
import { useHistoryStore } from '@/store/useHistoryStore'
import { CATEGORY_COLORS, CATEGORY_LABELS, type ExpenseCategory } from '@/types/expense'
import { formatCurrency, monthKey, monthLabel } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Dialog } from '@/components/ui/Dialog'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { SummaryCard } from '@/components/shared/SummaryCard'

const CATEGORIES = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }))

function AddExpenseDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const addExpense = useExpenseStore((s) => s.addExpense)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<ExpenseCategory>('other')
  const [note, setNote] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !amount) return
    addExpense({ name: name.trim(), amount: parseFloat(amount), category, note: note.trim() || undefined, isRecurring })
    toast.success('Expense added')
    setName(''); setAmount(''); setCategory('other'); setNote(''); setIsRecurring(false)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Add Expense">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Name" id="exp-name" placeholder="e.g. Rent, Netflix..." value={name} onChange={(e) => setName(e.target.value)} required />
        <Input label="Amount (€)" id="exp-amount" type="number" min="0" step="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        <Select label="Category" id="exp-cat" options={CATEGORIES} value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)} />
        <Textarea label="Note (optional)" id="exp-note" placeholder="Any context..." value={note} onChange={(e) => setNote(e.target.value)} />
        <label className="flex items-center gap-3 text-sm cursor-pointer select-none">
          <input type="checkbox" checked={isRecurring} onChange={(e) => setIsRecurring(e.target.checked)} className="w-4 h-4 rounded accent-primary" />
          <span className="text-foreground">Monthly recurring</span>
        </label>
        <div className="flex gap-3 pt-1">
          <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" className="flex-1">Add Expense</Button>
        </div>
      </form>
    </Dialog>
  )
}

function ExpenseCard({ expense }: { expense: ReturnType<typeof useExpenseStore.getState>['expenses'][0] }) {
  const removeExpense = useExpenseStore((s) => s.removeExpense)
  const [expanded, setExpanded] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  return (
    <>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-3 p-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-foreground truncate">{expense.name}</span>
              {expense.isRecurring && (
                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground border border-border rounded-full px-1.5 py-0.5">
                  <RefreshCw size={8} /> recurring
                </span>
              )}
            </div>
            <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[expense.category]}`}>
              {CATEGORY_LABELS[expense.category]}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-lg font-bold text-foreground">{formatCurrency(expense.amount)}</span>
            {expense.note && (
              <button onClick={() => setExpanded((v) => !v)} className="p-1.5 rounded-md hover:bg-accent transition-colors text-muted-foreground">
                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            )}
            <button onClick={() => setConfirmOpen(true)} className="p-1.5 rounded-md hover:bg-destructive/20 transition-colors text-muted-foreground hover:text-destructive">
              <Trash2 size={16} />
            </button>
          </div>
        </div>
        {expanded && expense.note && (
          <div className="px-4 pb-4 text-sm text-muted-foreground border-t border-border pt-3">
            {expense.note}
          </div>
        )}
      </div>
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Remove expense?"
        description={`Remove "${expense.name}" (${formatCurrency(expense.amount)}) from this month?`}
        onConfirm={() => { removeExpense(expense.id); toast.success('Removed') }}
      />
    </>
  )
}

export function ExpensesPage() {
  const { expenses, clearAll } = useExpenseStore()
  const { addSnapshot } = useHistoryStore()
  const [addOpen, setAddOpen] = useState(false)
  const [archiveOpen, setArchiveOpen] = useState(false)

  const total = expenses.reduce((s, e) => s + e.amount, 0)
  const recurring = expenses.filter((e) => e.isRecurring).reduce((s, e) => s + e.amount, 0)
  const sorted = [...expenses].sort((a, b) => b.amount - a.amount)

  function archiveMonth() {
    const key = monthKey()
    addSnapshot({
      monthKey: key,
      label: monthLabel(key),
      totalSpent: total,
      expenseCount: expenses.length,
      expenses: [...expenses],
    })
    clearAll()
    toast.success('Month archived to history!')
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-2">
      {/* Header */}
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-xl font-bold text-foreground">Expenses</h1>
          <p className="text-sm text-muted-foreground">{new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(new Date())}</p>
        </div>
        <div className="flex gap-2">
          {expenses.length > 0 && (
            <Button variant="outline" size="sm" onClick={() => setArchiveOpen(true)}>
              <Archive size={14} className="mr-1" /> Archive
            </Button>
          )}
          <Button size="sm" onClick={() => setAddOpen(true)}>
            <Plus size={16} className="mr-1" /> Add
          </Button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-3">
        <SummaryCard label="Total this month" value={formatCurrency(total)} sub={`${expenses.length} expense${expenses.length !== 1 ? 's' : ''}`} accent />
        <SummaryCard label="Recurring" value={formatCurrency(recurring)} sub={`${expenses.filter((e) => e.isRecurring).length} fixed`} />
      </div>

      {/* List */}
      {expenses.length === 0 ? (
        <EmptyState icon={Wallet} title="No expenses yet" description="Add your first expense for this month to start tracking." action={<Button onClick={() => setAddOpen(true)}><Plus size={16} className="mr-1" /> Add expense</Button>} />
      ) : (
        <div className="flex flex-col gap-2">
          {sorted.map((expense) => <ExpenseCard key={expense.id} expense={expense} />)}
        </div>
      )}

      <AddExpenseDialog open={addOpen} onOpenChange={setAddOpen} />
      <ConfirmDialog
        open={archiveOpen}
        onOpenChange={setArchiveOpen}
        title="Archive this month?"
        description="This will save a snapshot of all current expenses to History, then clear the list so you can start fresh next month."
        confirmLabel="Archive"
        onConfirm={archiveMonth}
      />
    </div>
  )
}
