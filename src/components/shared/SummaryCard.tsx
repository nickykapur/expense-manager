import { cn } from '@/lib/utils'

interface SummaryCardProps {
  label: string
  value: string
  sub?: string
  accent?: boolean
  className?: string
}

export function SummaryCard({ label, value, sub, accent, className }: SummaryCardProps) {
  return (
    <div className={cn(
      'rounded-xl border border-border bg-card p-5',
      accent && 'border-primary/30 bg-primary/5',
      className
    )}>
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{label}</p>
      <p className={cn('text-2xl font-bold', accent ? 'text-primary' : 'text-foreground')}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
    </div>
  )
}
