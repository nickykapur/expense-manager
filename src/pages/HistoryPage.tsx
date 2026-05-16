import { useState } from 'react'
import { History, ChevronDown, ChevronUp, Trash2, TrendingDown, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts'
import { useHistoryStore } from '@/store/useHistoryStore'
import { CATEGORY_COLORS, CATEGORY_LABELS } from '@/types/expense'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Textarea'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { SummaryCard } from '@/components/shared/SummaryCard'

function SnapshotCard({ snapshot }: { snapshot: ReturnType<typeof useHistoryStore.getState>['snapshots'][0] }) {
  const { updateSnapshot, removeSnapshot } = useHistoryStore()
  const [expanded, setExpanded] = useState(false)
  const [editNote, setEditNote] = useState(false)
  const [noteText, setNoteText] = useState(snapshot.notes ?? '')
  const [confirmOpen, setConfirmOpen] = useState(false)

  function saveNote() {
    updateSnapshot(snapshot.id, { notes: noteText.trim() || undefined })
    setEditNote(false)
    toast.success('Note saved')
  }

  return (
    <>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setExpanded((v) => !v)}>
          <div>
            <p className="font-semibold text-foreground">{snapshot.label}</p>
            <p className="text-sm text-muted-foreground">{snapshot.expenseCount} expense{snapshot.expenseCount !== 1 ? 's' : ''}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold text-foreground">{formatCurrency(snapshot.totalSpent)}</span>
            {expanded ? <ChevronUp size={18} className="text-muted-foreground" /> : <ChevronDown size={18} className="text-muted-foreground" />}
          </div>
        </div>

        {expanded && (
          <div className="border-t border-border px-4 pb-4 pt-3 flex flex-col gap-3">
            {/* Notes */}
            <div>
              {editNote ? (
                <div className="flex flex-col gap-2">
                  <Textarea value={noteText} onChange={(e) => setNoteText(e.target.value)} placeholder="Monthly retrospective..." />
                  <div className="flex gap-2">
                    <Button size="sm" onClick={saveNote}>Save note</Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditNote(false)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <button onClick={() => setEditNote(true)} className="text-sm text-muted-foreground hover:text-foreground transition-colors text-left w-full">
                  {snapshot.notes ? snapshot.notes : '+ Add retrospective note'}
                </button>
              )}
            </div>

            {/* Expense list */}
            <div className="flex flex-col gap-1.5">
              {snapshot.expenses
                .sort((a, b) => b.amount - a.amount)
                .map((exp) => (
                  <div key={exp.id} className="flex items-center justify-between gap-2 py-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full border ${CATEGORY_COLORS[exp.category]}`}>
                        {CATEGORY_LABELS[exp.category]}
                      </span>
                      <span className="text-sm text-foreground truncate">{exp.name}</span>
                    </div>
                    <span className="text-sm font-medium text-foreground shrink-0">{formatCurrency(exp.amount)}</span>
                  </div>
                ))}
            </div>

            {/* Delete snapshot */}
            <div className="pt-2 border-t border-border">
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive" onClick={() => setConfirmOpen(true)}>
                <Trash2 size={14} className="mr-1" /> Delete snapshot
              </Button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Delete snapshot?"
        description={`Permanently delete the history for ${snapshot.label}? This cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={() => { removeSnapshot(snapshot.id); toast.success('Snapshot deleted') }}
      />
    </>
  )
}

export function HistoryPage() {
  const { snapshots } = useHistoryStore()

  const sorted = [...snapshots].sort((a, b) => b.monthKey.localeCompare(a.monthKey))
  const chartData = [...sorted].reverse().slice(-12).map((s) => ({
    name: s.label.split(' ')[0]?.slice(0, 3) ?? s.monthKey,
    total: s.totalSpent,
  }))

  const allTotals = sorted.map((s) => s.totalSpent)
  const avgSpend = allTotals.length ? allTotals.reduce((a, b) => a + b, 0) / allTotals.length : 0
  const best = allTotals.length ? Math.min(...allTotals) : 0
  const trend = sorted.length >= 2 ? (sorted[0]!.totalSpent - sorted[1]!.totalSpent) : 0

  return (
    <div className="flex flex-col gap-4 p-4 pb-2">
      <div className="pt-2">
        <h1 className="text-xl font-bold text-foreground">History</h1>
        <p className="text-sm text-muted-foreground">{snapshots.length} month{snapshots.length !== 1 ? 's' : ''} tracked</p>
      </div>

      {snapshots.length === 0 ? (
        <EmptyState icon={History} title="No history yet" description='Archive your current month from the Expenses tab to start building your spending history.' />
      ) : (
        <>
          {/* Summary row */}
          <div className="grid grid-cols-3 gap-2">
            <SummaryCard label="Avg / month" value={formatCurrency(avgSpend)} />
            <SummaryCard label="Best month" value={formatCurrency(best)} />
            <SummaryCard
              label="vs last month"
              value={trend === 0 ? '—' : `${trend > 0 ? '+' : ''}${formatCurrency(trend)}`}
              accent={trend < 0}
            />
          </div>

          {/* Chart */}
          {chartData.length >= 2 && (
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 mb-3">
                {trend < 0 ? <TrendingDown size={16} className="text-green-400" /> : <TrendingUp size={16} className="text-red-400" />}
                <p className="text-sm font-medium text-foreground">Spending trend</p>
              </div>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} tickFormatter={(v: number) => `€${(v / 1000).toFixed(v >= 1000 ? 1 : 0)}${v >= 1000 ? 'k' : ''}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px' }}
                    formatter={(value: number) => [formatCurrency(value), 'Spent']}
                    cursor={{ fill: 'hsl(var(--accent))' }}
                  />
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* List */}
          <div className="flex flex-col gap-2">
            {sorted.map((snap) => <SnapshotCard key={snap.id} snapshot={snap} />)}
          </div>
        </>
      )}
    </div>
  )
}
