import { useState } from 'react'
import { Plus, Trash2, Bitcoin, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCryptoStore } from '@/store/useCryptoStore'
import { type CryptoHolding } from '@/types/crypto'
import { formatCurrency } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { Dialog } from '@/components/ui/Dialog'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { EmptyState } from '@/components/shared/EmptyState'
import { SummaryCard } from '@/components/shared/SummaryCard'
import { cn } from '@/lib/utils'

function AddCryptoDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const { addHolding } = useCryptoStore()
  const [symbol, setSymbol] = useState('')
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [costBasis, setCostBasis] = useState('')
  const [currentPrice, setCurrentPrice] = useState('')
  const [wallet, setWallet] = useState('')
  const [notes, setNotes] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!symbol.trim() || !amount || !costBasis) return
    addHolding({
      symbol: symbol.trim().toUpperCase(),
      name: name.trim() || undefined,
      amountHeld: parseFloat(amount),
      costBasisPerUnit: parseFloat(costBasis),
      currentPricePerUnit: currentPrice ? parseFloat(currentPrice) : undefined,
      lastUpdated: currentPrice ? new Date().toISOString() : undefined,
      walletLabel: wallet.trim() || undefined,
      notes: notes.trim() || undefined,
    })
    toast.success('Crypto added')
    setSymbol(''); setName(''); setAmount(''); setCostBasis(''); setCurrentPrice(''); setWallet(''); setNotes('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange} title="Add Crypto Holding">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Symbol" id="cr-sym" placeholder="ETH" value={symbol} onChange={(e) => setSymbol(e.target.value)} required />
          <Input label="Name (optional)" id="cr-name" placeholder="Ethereum" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <Input label="Amount held" id="cr-amt" type="number" min="0" step="any" placeholder="1.5" value={amount} onChange={(e) => setAmount(e.target.value)} required />
        <Input label="Cost basis per unit (€)" id="cr-cost" type="number" min="0" step="0.01" placeholder="2500.00" value={costBasis} onChange={(e) => setCostBasis(e.target.value)} required />
        <Input label="Current price per unit (€, optional)" id="cr-cur" type="number" min="0" step="0.01" placeholder="3200.00" value={currentPrice} onChange={(e) => setCurrentPrice(e.target.value)} />
        <Input label="Wallet / Exchange (optional)" id="cr-wallet" placeholder="Ledger, Coinbase..." value={wallet} onChange={(e) => setWallet(e.target.value)} />
        <Textarea label="Notes (optional)" id="cr-notes" placeholder="DCA strategy, lock-up period..." value={notes} onChange={(e) => setNotes(e.target.value)} />
        <div className="flex gap-3 pt-1">
          <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button type="submit" className="flex-1">Add</Button>
        </div>
      </form>
    </Dialog>
  )
}

function CryptoCard({ holding }: { holding: CryptoHolding }) {
  const { removeHolding, updateHolding } = useCryptoStore()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [editPrice, setEditPrice] = useState(false)
  const [newPrice, setNewPrice] = useState(String(holding.currentPricePerUnit ?? ''))

  const costBasisTotal = holding.amountHeld * holding.costBasisPerUnit
  const currentValue = holding.currentPricePerUnit ? holding.amountHeld * holding.currentPricePerUnit : null
  const pnl = currentValue !== null ? currentValue - costBasisTotal : null
  const pnlPct = pnl !== null && costBasisTotal > 0 ? (pnl / costBasisTotal) * 100 : null
  const isProfit = pnl !== null && pnl >= 0

  function savePrice() {
    updateHolding(holding.id, {
      currentPricePerUnit: parseFloat(newPrice) || undefined,
      lastUpdated: new Date().toISOString(),
    })
    setEditPrice(false)
    toast.success('Price updated')
  }

  return (
    <>
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-lg text-foreground">{holding.symbol}</span>
              {holding.name && <span className="text-sm text-muted-foreground">{holding.name}</span>}
              {holding.walletLabel && (
                <span className="text-xs border border-border px-2 py-0.5 rounded-full text-muted-foreground">{holding.walletLabel}</span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-0.5">{holding.amountHeld.toLocaleString()} {holding.symbol}</p>
            {holding.notes && <p className="text-xs text-muted-foreground mt-1.5">{holding.notes}</p>}
          </div>

          <div className="flex flex-col items-end gap-1 shrink-0">
            <span className="font-bold text-foreground">{currentValue !== null ? formatCurrency(currentValue) : formatCurrency(costBasisTotal)}</span>
            {pnl !== null && pnlPct !== null && (
              <span className={cn('flex items-center gap-1 text-xs font-medium', isProfit ? 'text-green-400' : 'text-red-400')}>
                {isProfit ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {isProfit ? '+' : ''}{formatCurrency(pnl)} ({pnlPct.toFixed(1)}%)
              </span>
            )}
            <button onClick={() => setConfirmOpen(true)} className="mt-1 p-1.5 rounded-md hover:bg-destructive/20 transition-colors text-muted-foreground hover:text-destructive">
              <Trash2 size={15} />
            </button>
          </div>
        </div>

        {/* Cost basis & price update */}
        <div className="mt-3 pt-3 border-t border-border flex items-center justify-between flex-wrap gap-2">
          <div className="text-xs text-muted-foreground">
            Cost basis: {formatCurrency(costBasisTotal)} @ {formatCurrency(holding.costBasisPerUnit)}/unit
          </div>
          {editPrice ? (
            <div className="flex gap-2 items-center">
              <Input id="cr-price-upd" type="number" min="0" step="0.01" value={newPrice} onChange={(e) => setNewPrice(e.target.value)} className="w-28 h-8 text-sm" />
              <Button size="sm" onClick={savePrice}>Save</Button>
              <Button size="sm" variant="ghost" onClick={() => setEditPrice(false)}>✕</Button>
            </div>
          ) : (
            <button onClick={() => setEditPrice(true)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors">
              <RefreshCw size={11} />
              {holding.currentPricePerUnit ? `${formatCurrency(holding.currentPricePerUnit)}/unit` : 'Set price'}
            </button>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Remove holding?"
        description={`Remove ${holding.symbol}${holding.name ? ` (${holding.name})` : ''}?`}
        onConfirm={() => { removeHolding(holding.id); toast.success('Removed') }}
      />
    </>
  )
}

export function CryptoPage() {
  const { holdings } = useCryptoStore()
  const [addOpen, setAddOpen] = useState(false)

  const totalCostBasis = holdings.reduce((s, h) => s + h.amountHeld * h.costBasisPerUnit, 0)
  const totalCurrentValue = holdings.reduce((s, h) => s + h.amountHeld * (h.currentPricePerUnit ?? h.costBasisPerUnit), 0)
  const totalPnL = totalCurrentValue - totalCostBasis
  const isProfit = totalPnL >= 0

  return (
    <div className="flex flex-col gap-4 p-4 pb-2">
      <div className="flex items-center justify-between pt-2">
        <div>
          <h1 className="text-xl font-bold text-foreground">Crypto</h1>
          <p className="text-sm text-muted-foreground">{holdings.length} holding{holdings.length !== 1 ? 's' : ''}</p>
        </div>
        <Button size="sm" onClick={() => setAddOpen(true)}>
          <Plus size={16} className="mr-1" /> Add
        </Button>
      </div>

      {holdings.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          <SummaryCard label="Current value" value={formatCurrency(totalCurrentValue)} accent className="col-span-1" />
          <SummaryCard label="Cost basis" value={formatCurrency(totalCostBasis)} className="col-span-1" />
          <SummaryCard
            label="P&L"
            value={`${isProfit ? '+' : ''}${formatCurrency(totalPnL)}`}
            className={cn('col-span-1', isProfit ? 'border-green-500/30' : 'border-red-500/30')}
          />
        </div>
      )}

      {holdings.length === 0 ? (
        <EmptyState icon={Bitcoin} title="No crypto holdings" description="Track your crypto investments with cost basis and current value." action={<Button onClick={() => setAddOpen(true)}><Plus size={16} className="mr-1" /> Add crypto</Button>} />
      ) : (
        <div className="flex flex-col gap-2">
          {holdings.map((h) => <CryptoCard key={h.id} holding={h} />)}
        </div>
      )}

      <AddCryptoDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  )
}
