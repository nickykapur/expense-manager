import { useState } from 'react'
import { Plus, Trash2, CheckCircle2, Circle, Banknote, ChevronDown, ChevronUp, Archive } from 'lucide-react'
import toast from 'react-hot-toast'
import { usePaycheckStore, type AllocationCategory, type Paycheck } from '@/store/usePaycheckStore'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { Dialog } from '@/components/ui/Dialog'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { cn } from '@/lib/utils'

const CATEGORY_OPTIONS: { value: AllocationCategory; label: string }[] = [
  { value: 'rent', label: 'Rent' },
  { value: 'loan', label: 'Loan' },
  { value: 'cc', label: 'Credit Card' },
  { value: 'savings', label: 'Savings' },
  { value: 'investment', label: 'Investment / Crypto' },
  { value: 'living', label: 'Living expenses' },
  { value: 'other', label: 'Other' },
]

const CATEGORY_COLORS: Record<AllocationCategory, string> = {
  rent: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  loan: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  cc: 'bg-red-500/20 text-red-400 border-red-500/30',
  savings: 'bg-green-500/20 text-green-400 border-green-500/30',
  investment: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  living: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  other: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

function AddPaycheckDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { addPaycheck } = usePaycheckStore()
  const [amount, setAmount] = useState('')
  const [date, setDate] = useState('')
  const [label, setLabel] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!amount || !date) return
    const d = new Date(date)
    const defaultLabel = `Paycheck ${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}`
    addPaycheck({ amount: parseFloat(amount), date, label: label.trim() || defaultLabel })
    toast.success('Paycheck added')
    setAmount(''); setDate(''); setLabel('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Add Paycheck">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Amount (€)" id="pc-amt" type="number" min="0" step="0.01" placeholder="1800.00" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        <Input label="Paycheck date" id="pc-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        <Input label="Label (optional)" id="pc-label" placeholder="e.g. May 29 paycheck" value={label} onChange={(e) => setLabel(e.target.value)} />
        <div className="flex gap-3 pt-1">
          <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" className="flex-1">Add</Button>
        </div>
      </form>
    </Dialog>
  )
}

function AddAllocationDialog({ paycheck, open, onOpenChange }: { paycheck: Paycheck; open: boolean; onOpenChange: (v: boolean) => void }) {
  const { addAllocation } = usePaycheckStore()
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<AllocationCategory>('other')
  const [dueDate, setDueDate] = useState('')
  const [note, setNote] = useState('')

  const remaining = paycheck.amount - paycheck.allocations.reduce((s, a) => s + a.amount, 0)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !amount) return
    addAllocation(paycheck.id, {
      name: name.trim(),
      amount: parseFloat(amount),
      category,
      dueDate: dueDate || undefined,
      note: note.trim() || undefined,
    })
    toast.success('Allocation added')
    setName(''); setAmount(''); setCategory('other'); setDueDate(''); setNote('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Allocate funds">
      <div className="mb-4 rounded-lg bg-primary/10 border border-primary/20 px-4 py-3">
        <p className="text-xs text-muted-foreground">Unallocated</p>
        <p className="text-xl font-bold text-primary">{formatCurrency(remaining)}</p>
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Name" id="al-name" placeholder="e.g. June rent, CC payment..." value={name} onChange={(e) => setName(e.target.value)} required />
        <Input label="Amount (€)" id="al-amt" type="number" min="0" step="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        <Select label="Category" id="al-cat" options={CATEGORY_OPTIONS} value={category} onChange={(e) => setCategory(e.target.value as AllocationCategory)} />
        <Input label="Due date (optional)" id="al-due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        <Input label="Note (optional)" id="al-note" placeholder="Any context..." value={note} onChange={(e) => setNote(e.target.value)} />
        <div className="flex gap-3 pt-1">
          <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" className="flex-1">Add</Button>
        </div>
      </form>
    </Dialog>
  )
}

function PaycheckCard({ paycheck }: { paycheck: Paycheck }) {
  const { togglePaid, removeAllocation, archivePaycheck, removePaycheck } = usePaycheckStore()
  const [expanded, setExpanded] = useState(true)
  const [addOpen, setAddOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const totalAllocated = paycheck.allocations.reduce((s, a) => s + a.amount, 0)
  const remaining = paycheck.amount - totalAllocated
  const paidAmount = paycheck.allocations.filter((a) => a.isPaid).reduce((s, a) => s + a.amount, 0)
  const allPaid = paycheck.allocations.length > 0 && paycheck.allocations.every((a) => a.isPaid)
  const pct = paycheck.amount > 0 ? (totalAllocated / paycheck.amount) * 100 : 0

  return (
    <>
      <div className={cn('rounded-xl border bg-card overflow-hidden', paycheck.isArchived ? 'opacity-60 border-border' : 'border-primary/30')}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setExpanded((v) => !v)}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground">{paycheck.label}</span>
              {paycheck.isArchived && <span className="text-xs text-muted-foreground border border-border rounded-full px-2 py-0.5">archived</span>}
              {allPaid && !paycheck.isArchived && <span className="text-xs text-green-400 border border-green-500/30 rounded-full px-2 py-0.5">all paid ✓</span>}
            </div>
            <p className="text-sm text-muted-foreground">{formatDate(paycheck.date)}</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="text-right">
              <p className="font-bold text-foreground">{formatCurrency(paycheck.amount)}</p>
              <p className="text-xs text-muted-foreground">{formatCurrency(remaining)} left</p>
            </div>
            {expanded ? <ChevronUp size={16} className="text-muted-foreground" /> : <ChevronDown size={16} className="text-muted-foreground" />}
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-muted mx-4 rounded-full overflow-hidden mb-1">
          <div
            className={cn('h-full rounded-full transition-all', remaining < 0 ? 'bg-red-500' : 'bg-primary')}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
        <p className="text-xs text-muted-foreground px-4 pb-3">
          {formatCurrency(totalAllocated)} allocated · {formatCurrency(paidAmount)} paid
          {remaining < 0 && <span className="text-red-400 ml-2">⚠ over by {formatCurrency(Math.abs(remaining))}</span>}
        </p>

        {/* Allocations */}
        {expanded && (
          <div className="border-t border-border px-4 pb-4 pt-3 flex flex-col gap-2">
            {paycheck.allocations.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-2">No allocations yet — add where this paycheck goes</p>
            )}

            {paycheck.allocations.map((allocation) => (
              <div key={allocation.id} className={cn('flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors', allocation.isPaid ? 'bg-green-500/10' : 'bg-muted')}>
                <button onClick={() => togglePaid(paycheck.id, allocation.id)} className="shrink-0">
                  {allocation.isPaid
                    ? <CheckCircle2 size={18} className="text-green-400" />
                    : <Circle size={18} className="text-muted-foreground" />}
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn('text-sm font-medium', allocation.isPaid ? 'line-through text-muted-foreground' : 'text-foreground')}>
                      {allocation.name}
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full border ${CATEGORY_COLORS[allocation.category]}`}>
                      {CATEGORY_OPTIONS.find((c) => c.value === allocation.category)?.label}
                    </span>
                  </div>
                  {allocation.dueDate && (
                    <p className="text-xs text-muted-foreground">Due {formatDate(allocation.dueDate)}</p>
                  )}
                  {allocation.note && (
                    <p className="text-xs text-muted-foreground">{allocation.note}</p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-semibold text-foreground">{formatCurrency(allocation.amount)}</span>
                  {!paycheck.isArchived && (
                    <button onClick={() => removeAllocation(paycheck.id, allocation.id)} className="p-1 rounded hover:bg-destructive/20 text-muted-foreground hover:text-destructive transition-colors">
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Remaining row */}
            {remaining > 0 && (
              <div className="flex items-center justify-between rounded-lg border border-dashed border-border px-3 py-2.5">
                <span className="text-sm text-muted-foreground">Unallocated buffer</span>
                <span className="font-semibold text-primary">{formatCurrency(remaining)}</span>
              </div>
            )}

            {/* Actions */}
            {!paycheck.isArchived && (
              <div className="flex gap-2 pt-1">
                <Button size="sm" className="flex-1" onClick={() => setAddOpen(true)}>
                  <Plus size={14} className="mr-1" /> Allocate
                </Button>
                {allPaid && (
                  <Button size="sm" variant="outline" onClick={() => { archivePaycheck(paycheck.id); toast.success('Paycheck archived') }}>
                    <Archive size={14} className="mr-1" /> Archive
                  </Button>
                )}
                <Button size="sm" variant="ghost" className="text-muted-foreground hover:text-destructive" onClick={() => setConfirmOpen(true)}>
                  <Trash2 size={14} />
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <AddAllocationDialog paycheck={paycheck} open={addOpen} onOpenChange={setAddOpen} />
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Remove paycheck?"
        description={`Remove "${paycheck.label}" and all its allocations?`}
        onConfirm={() => { removePaycheck(paycheck.id); toast.success('Removed') }}
      />
    </>
  )
}

export function PaycheckPage() {
  const { paychecks } = usePaycheckStore()
  const [addOpen, setAddOpen] = useState(false)

  const active = paychecks.filter((p) => !p.isArchived)
  const archived = paychecks.filter((p) => p.isArchived)
  const [showArchived, setShowArchived] = useState(false)

  const totalIncome = active.reduce((s, p) => s + p.amount, 0)
  const totalAllocated = active.reduce((s, p) => s + p.allocations.reduce((a, al) => a + al.amount, 0), 0)

  return (
    <div className="flex flex-col gap-4 p-4 pb-2">
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-xl font-bold text-foreground">Paycheck Planner</h1>
          <p className="text-sm text-muted-foreground">Allocate every euro before you spend it</p>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus size={16} className="mr-1" /> Add
        </Button>
      </div>

      {active.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Coming in</p>
            <p className="text-2xl font-bold text-primary">{formatCurrency(totalIncome)}</p>
          </div>
          <div className="rounded-xl border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Allocated</p>
            <p className="text-2xl font-bold text-foreground">{formatCurrency(totalAllocated)}</p>
            <p className="text-xs text-muted-foreground mt-1">{formatCurrency(totalIncome - totalAllocated)} buffer</p>
          </div>
        </div>
      )}

      {paychecks.length === 0 ? (
        <EmptyState
          icon={Banknote}
          title="No paychecks yet"
          description="Add your next paycheck and allocate every euro — rent, loans, savings, crypto — before you spend it."
          action={<Button onClick={() => setAddOpen(true)}><Plus size={16} className="mr-1" /> Add paycheck</Button>}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {active.map((p) => <PaycheckCard key={p.id} paycheck={p} />)}

          {archived.length > 0 && (
            <div>
              <button onClick={() => setShowArchived((v) => !v)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-full py-2">
                {showArchived ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                {archived.length} archived paycheck{archived.length !== 1 ? 's' : ''}
              </button>
              {showArchived && (
                <div className="flex flex-col gap-2 mt-1">
                  {archived.map((p) => <PaycheckCard key={p.id} paycheck={p} />)}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <AddPaycheckDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  )
}
