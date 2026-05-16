import { useState } from 'react'
import { Plus, Trash2, Clock, CheckCircle2, AlertCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import { useUpcomingStore } from '@/store/useExpenseStore'
import { useExpenseStore } from '@/store/useExpenseStore'
import { CATEGORY_COLORS, CATEGORY_LABELS, type ExpenseCategory } from '@/types/expense'
import { formatCurrency, formatDate, daysUntil } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Select } from '@/components/ui/Select'
import { Dialog } from '@/components/ui/Dialog'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { SummaryCard } from '@/components/shared/SummaryCard'
import { cn } from '@/lib/utils'

const CATEGORIES = Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }))
const PRIORITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
]

function AddUpcomingDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const addUpcoming = useUpcomingStore((s) => s.addUpcoming)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [category, setCategory] = useState<ExpenseCategory>('other')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [note, setNote] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !amount || !dueDate) return
    addUpcoming({ name: name.trim(), amount: parseFloat(amount), dueDate, category, priority, note: note.trim() || undefined })
    toast.success('Upcoming expense added')
    setName(''); setAmount(''); setDueDate(''); setCategory('other'); setPriority('medium'); setNote('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Add Upcoming Expense">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Name" id="up-name" placeholder="e.g. Car insurance..." value={name} onChange={(e) => setName(e.target.value)} required />
        <Input label="Amount (€)" id="up-amount" type="number" min="0" step="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        <Input label="Due date" id="up-date" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} required />
        <Select label="Category" id="up-cat" options={CATEGORIES} value={category} onChange={(e) => setCategory(e.target.value as ExpenseCategory)} />
        <Select label="Priority" id="up-priority" options={PRIORITIES} value={priority} onChange={(e) => setPriority(e.target.value as 'low' | 'medium' | 'high')} />
        <Textarea label="Note (optional)" id="up-note" placeholder="Any context..." value={note} onChange={(e) => setNote(e.target.value)} />
        <div className="flex gap-3 pt-1">
          <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" className="flex-1">Add</Button>
        </div>
      </form>
    </Dialog>
  )
}

const PRIORITY_STYLES = {
  high: 'bg-red-500/20 text-red-400 border-red-500/30',
  medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  low: 'bg-green-500/20 text-green-400 border-green-500/30',
}

export function UpcomingPage() {
  const { upcoming, removeUpcoming } = useUpcomingStore()
  const { addExpense } = useExpenseStore()
  const [addOpen, setAddOpen] = useState(false)
  const [confirmId, setConfirmId] = useState<string | null>(null)

  const total = upcoming.reduce((s, u) => s + u.amount, 0)
  const sorted = [...upcoming].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
  const overdue = upcoming.filter((u) => daysUntil(u.dueDate) < 0).length
  const confirmItem = upcoming.find((u) => u.id === confirmId)

  function moveToCurrent(id: string) {
    const item = upcoming.find((u) => u.id === id)
    if (!item) return
    addExpense({ name: item.name, amount: item.amount, category: item.category, note: item.note, isRecurring: false })
    removeUpcoming(id)
    toast.success('Moved to current expenses')
  }

  return (
    <div className="flex flex-col gap-4 p-4 pb-2">
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-xl font-bold text-foreground">Upcoming</h1>
          <p className="text-sm text-muted-foreground">Planned future expenses</p>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus size={16} className="mr-1" /> Add
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <SummaryCard label="Total planned" value={formatCurrency(total)} sub={`${upcoming.length} item${upcoming.length !== 1 ? 's' : ''}`} accent />
        <SummaryCard label="Overdue" value={overdue.toString()} sub={overdue > 0 ? 'need attention' : 'all on track'} />
      </div>

      {upcoming.length === 0 ? (
        <EmptyState icon={Clock} title="No upcoming expenses" description="Plan ahead by adding expected future expenses." action={<Button onClick={() => setAddOpen(true)}><Plus size={16} className="mr-1" /> Add upcoming</Button>} />
      ) : (
        <div className="flex flex-col gap-2">
          {sorted.map((item) => {
            const days = daysUntil(item.dueDate)
            const isOverdue = days < 0
            const isSoon = days >= 0 && days <= 7
            return (
              <div key={item.id} className={cn('rounded-xl border bg-card p-4', isOverdue ? 'border-red-500/40' : isSoon ? 'border-yellow-500/30' : 'border-border')}>
                <div className="flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-foreground">{item.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${PRIORITY_STYLES[item.priority]}`}>{item.priority}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[item.category]}`}>{CATEGORY_LABELS[item.category]}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className="text-sm text-muted-foreground">{formatDate(item.dueDate)}</span>
                      <span className={cn('flex items-center gap-1 text-xs font-medium', isOverdue ? 'text-red-400' : isSoon ? 'text-yellow-400' : 'text-muted-foreground')}>
                        {isOverdue ? <AlertCircle size={12} /> : null}
                        {isOverdue ? `${Math.abs(days)} day${Math.abs(days) !== 1 ? 's' : ''} overdue` : days === 0 ? 'Due today' : `${days} day${days !== 1 ? 's' : ''} left`}
                      </span>
                    </div>
                    {item.note && <p className="text-xs text-muted-foreground mt-1.5">{item.note}</p>}
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <span className="text-lg font-bold text-foreground">{formatCurrency(item.amount)}</span>
                    <div className="flex gap-1">
                      <button onClick={() => moveToCurrent(item.id)} title="Mark as paid / move to expenses" className="p-1.5 rounded-md hover:bg-green-500/20 transition-colors text-muted-foreground hover:text-green-400">
                        <CheckCircle2 size={15} />
                      </button>
                      <button onClick={() => setConfirmId(item.id)} className="p-1.5 rounded-md hover:bg-destructive/20 transition-colors text-muted-foreground hover:text-destructive">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <AddUpcomingDialog open={addOpen} onOpenChange={setAddOpen} />
      <ConfirmDialog
        open={!!confirmId}
        onOpenChange={(v) => !v && setConfirmId(null)}
        title="Remove upcoming expense?"
        description={confirmItem ? `Remove "${confirmItem.name}" (${formatCurrency(confirmItem.amount)})?` : ''}
        onConfirm={() => { if (confirmId) { removeUpcoming(confirmId); toast.success('Removed'); setConfirmId(null) } }}
      />
    </div>
  )
}
