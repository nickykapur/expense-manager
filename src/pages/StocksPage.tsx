import { useState } from 'react'
import { Plus, Trash2, TrendingUp, ChevronDown, ChevronUp, CheckCircle, Clock } from 'lucide-react'
import toast from 'react-hot-toast'
import { useStockStore } from '@/store/useStockStore'
import { type StockHolding } from '@/types/stock'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Dialog } from '@/components/ui/Dialog'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { SummaryCard } from '@/components/shared/SummaryCard'
import { cn } from '@/lib/utils'

function AddStockDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { addHolding } = useStockStore()
  const [ticker, setTicker] = useState('')
  const [company, setCompany] = useState('')
  const [granted, setGranted] = useState('')
  const [vested, setVested] = useState('0')
  const [grantDate, setGrantDate] = useState('')
  const [cliffDate, setCliffDate] = useState('')
  const [price, setPrice] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [notes, setNotes] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!ticker.trim() || !granted || !grantDate) return
    addHolding({
      ticker: ticker.trim().toUpperCase(),
      companyName: company.trim() || undefined,
      totalGrantedShares: parseFloat(granted),
      vestedShares: parseFloat(vested),
      grantDate,
      cliffDate: cliffDate || undefined,
      vestingSchedule: [],
      currentPricePerShare: price ? parseFloat(price) : undefined,
      currency,
      notes: notes.trim() || undefined,
    })
    toast.success('Stock added')
    setTicker(''); setCompany(''); setGranted(''); setVested('0'); setGrantDate(''); setCliffDate(''); setPrice(''); setCurrency('USD'); setNotes('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Add Stock Holding">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Ticker" id="stk-ticker" placeholder="AAPL" value={ticker} onChange={(e) => setTicker(e.target.value)} required />
          <Input label="Currency" id="stk-cur" placeholder="USD" value={currency} onChange={(e) => setCurrency(e.target.value)} />
        </div>
        <Input label="Company (optional)" id="stk-co" placeholder="Apple Inc." value={company} onChange={(e) => setCompany(e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Total granted shares" id="stk-granted" type="number" min="0" step="0.01" placeholder="400" value={granted} onChange={(e) => setGranted(e.target.value)} required />
          <Input label="Already vested" id="stk-vested" type="number" min="0" step="0.01" placeholder="0" value={vested} onChange={(e) => setVested(e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Grant date" id="stk-grant" type="date" value={grantDate} onChange={(e) => setGrantDate(e.target.value)} required />
          <Input label="Cliff date (optional)" id="stk-cliff" type="date" value={cliffDate} onChange={(e) => setCliffDate(e.target.value)} />
        </div>
        <Input label="Current price per share (optional)" id="stk-price" type="number" min="0" step="0.01" placeholder="182.50" value={price} onChange={(e) => setPrice(e.target.value)} />
        <Textarea label="Notes (optional)" id="stk-notes" placeholder="Grant details, conditions..." value={notes} onChange={(e) => setNotes(e.target.value)} />
        <div className="flex gap-3 pt-1">
          <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" className="flex-1">Add Stock</Button>
        </div>
      </form>
    </Dialog>
  )
}

function AddVestEventDialog({ holding, open, onOpenChange }: { holding: StockHolding; open: boolean; onOpenChange: (v: boolean) => void }) {
  const { addVestEvent } = useStockStore()
  const [date, setDate] = useState('')
  const [shares, setShares] = useState('')
  const [notes, setNotes] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!date || !shares) return
    addVestEvent(holding.id, { date, shares: parseFloat(shares), vested: false, notes: notes.trim() || undefined })
    toast.success('Vest event added')
    setDate(''); setShares(''); setNotes('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title={`Add vest event — ${holding.ticker}`}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Vest date" id="ve-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
        <Input label="Shares" id="ve-shares" type="number" min="0" step="0.01" placeholder="25" value={shares} onChange={(e) => setShares(e.target.value)} required />
        <Input label="Notes (optional)" id="ve-notes" placeholder="Q2 2026 vest..." value={notes} onChange={(e) => setNotes(e.target.value)} />
        <div className="flex gap-3 pt-1">
          <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" className="flex-1">Add</Button>
        </div>
      </form>
    </Dialog>
  )
}

function StockCard({ holding }: { holding: StockHolding }) {
  const { removeHolding, updateHolding, markVested } = useStockStore()
  const [expanded, setExpanded] = useState(false)
  const [addEventOpen, setAddEventOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [editPrice, setEditPrice] = useState(false)
  const [newPrice, setNewPrice] = useState(String(holding.currentPricePerShare ?? ''))

  const unvested = holding.totalGrantedShares - holding.vestedShares
  const vestedValue = holding.vestedShares * (holding.currentPricePerShare ?? 0)
  const totalValue = holding.totalGrantedShares * (holding.currentPricePerShare ?? 0)
  const vestPct = holding.totalGrantedShares > 0 ? (holding.vestedShares / holding.totalGrantedShares) * 100 : 0

  const sortedEvents = [...holding.vestingSchedule].sort((a, b) => a.date.localeCompare(b.date))
  const nextVest = sortedEvents.find((e) => !e.vested && new Date(e.date) >= new Date())

  function savePrice() {
    updateHolding(holding.id, { currentPricePerShare: parseFloat(newPrice) || undefined })
    setEditPrice(false)
    toast.success('Price updated')
  }

  return (
    <>
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between p-4 cursor-pointer" onClick={() => setExpanded((v) => !v)}>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground text-lg">{holding.ticker}</span>
              {holding.companyName && <span className="text-sm text-muted-foreground truncate">{holding.companyName}</span>}
            </div>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="text-xs text-muted-foreground">{holding.vestedShares.toLocaleString()} / {holding.totalGrantedShares.toLocaleString()} shares vested</span>
              {nextVest && (
                <span className="text-xs text-primary flex items-center gap-1"><Clock size={11} /> {formatDate(nextVest.date)}</span>
              )}
            </div>
            {/* Progress bar */}
            <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden w-full max-w-xs">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${vestPct}%` }} />
            </div>
          </div>
          <div className="flex flex-col items-end gap-1 ml-3 shrink-0">
            <span className="font-bold text-foreground">{holding.currentPricePerShare ? formatCurrency(vestedValue, holding.currency) : `${holding.vestedShares.toLocaleString()} sh`}</span>
            {holding.currentPricePerShare && <span className="text-xs text-muted-foreground">{formatCurrency(totalValue, holding.currency)} total</span>}
            {expanded ? <ChevronUp size={16} className="text-muted-foreground mt-1" /> : <ChevronDown size={16} className="text-muted-foreground mt-1" />}
          </div>
        </div>

        {expanded && (
          <div className="border-t border-border px-4 pb-4 pt-3 flex flex-col gap-4">
            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-muted p-2">
                <p className="text-xs text-muted-foreground">Vested</p>
                <p className="font-semibold text-sm text-foreground">{holding.vestedShares.toLocaleString()}</p>
              </div>
              <div className="rounded-lg bg-muted p-2">
                <p className="text-xs text-muted-foreground">Unvested</p>
                <p className="font-semibold text-sm text-foreground">{unvested.toLocaleString()}</p>
              </div>
              <div className="rounded-lg bg-muted p-2">
                <p className="text-xs text-muted-foreground">Progress</p>
                <p className="font-semibold text-sm text-foreground">{vestPct.toFixed(0)}%</p>
              </div>
            </div>

            {/* Price update */}
            <div>
              {editPrice ? (
                <div className="flex gap-2">
                  <Input id="price-upd" type="number" min="0" step="0.01" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="flex-1" />
                  <Button size="sm" onClick={savePrice}>Save</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditPrice(false)}>✕</Button>
                </div>
              ) : (
                <button onClick={() => setEditPrice(true)} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  {holding.currentPricePerShare ? `Current price: ${holding.currency} ${holding.currentPricePerShare.toFixed(2)} — update` : '+ Set current share price'}
                </button>
              )}
            </div>

            {/* Vesting schedule */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-foreground">Vesting schedule</p>
                <Button size="sm" variant="outline" onClick={() => setAddEventOpen(true)}><Plus size={13} className="mr-1" />Add event</Button>
              </div>
              {sortedEvents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No vest events yet.</p>
              ) : (
                <div className="flex flex-col gap-1.5">
                  {sortedEvents.map((event) => {
                    const isPast = new Date(event.date) < new Date()
                    return (
                      <div key={event.id} className={cn('flex items-center gap-3 rounded-lg px-3 py-2', event.vested ? 'bg-green-500/10' : isPast ? 'bg-red-500/10' : 'bg-muted')}>
                        {event.vested ? <CheckCircle size={14} className="text-green-400 shrink-0" /> : <Clock size={14} className={cn('shrink-0', isPast ? 'text-red-400' : 'text-muted-foreground')} />}
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-medium text-foreground">{formatDate(event.date)}</span>
                          {event.notes && <span className="text-xs text-muted-foreground ml-2">{event.notes}</span>}
                        </div>
                        <span className="text-sm text-foreground shrink-0">{event.shares.toLocaleString()} sh</span>
                        {!event.vested && isPast && (
                          <button onClick={() => { markVested(holding.id, event.id); toast.success('Marked as vested') }} className="text-xs text-green-400 hover:underline">Mark vested</button>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {holding.notes && <p className="text-sm text-muted-foreground">{holding.notes}</p>}

            <Button variant="ghost" size="sm" className="self-start text-muted-foreground hover:text-destructive" onClick={() => setConfirmOpen(true)}>
              <Trash2 size={14} className="mr-1" /> Remove holding
            </Button>
          </div>
        )}
      </div>

      <AddVestEventDialog holding={holding} open={addEventOpen} onOpenChange={setAddEventOpen} />
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Remove stock holding?"
        description={`Remove ${holding.ticker}${holding.companyName ? ` (${holding.companyName})` : ''}? This will delete all vesting data.`}
        onConfirm={() => { removeHolding(holding.id); toast.success('Removed') }}
      />
    </>
  )
}

export function StocksPage() {
  const { holdings } = useStockStore()
  const [addOpen, setAddOpen] = useState(false)

  const totalVestedValue = holdings.reduce((s, h) => s + h.vestedShares * (h.currentPricePerShare ?? 0), 0)
  const totalValue = holdings.reduce((s, h) => s + h.totalGrantedShares * (h.currentPricePerShare ?? 0), 0)

  return (
    <div className="flex flex-col gap-4 p-4 pb-2">
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-xl font-bold text-foreground">Stocks</h1>
          <p className="text-sm text-muted-foreground">{holdings.length} holding{holdings.length !== 1 ? 's' : ''}</p>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus size={16} className="mr-1" /> Add
        </Button>
      </div>

      {holdings.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <SummaryCard label="Vested value" value={totalVestedValue > 0 ? formatCurrency(totalVestedValue, 'USD') : '—'} sub="at current price" accent />
          <SummaryCard label="Total grant value" value={totalValue > 0 ? formatCurrency(totalValue, 'USD') : '—'} sub="if fully vested" />
        </div>
      )}

      {holdings.length === 0 ? (
        <EmptyState icon={TrendingUp} title="No stock holdings" description="Add your stock grants and vesting schedules to track your equity." action={<Button onClick={() => setAddOpen(true)}><Plus size={16} className="mr-1" /> Add stock</Button>} />
      ) : (
        <div className="flex flex-col gap-2">
          {holdings.map((h) => <StockCard key={h.id} holding={h} />)}
        </div>
      )}

      <AddStockDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  )
}
