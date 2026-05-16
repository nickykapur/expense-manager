import { cn } from '@/lib/utils'
import { Wallet, Clock, History, TrendingUp, Bitcoin } from 'lucide-react'

export type TabId = 'expenses' | 'upcoming' | 'history' | 'stocks' | 'crypto'

const TABS: { id: TabId; label: string; Icon: React.ElementType }[] = [
  { id: 'expenses', label: 'Expenses', Icon: Wallet },
  { id: 'upcoming', label: 'Upcoming', Icon: Clock },
  { id: 'history', label: 'History', Icon: History },
  { id: 'stocks', label: 'Stocks', Icon: TrendingUp },
  { id: 'crypto', label: 'Crypto', Icon: Bitcoin },
]

interface BottomTabBarProps {
  active: TabId
  onChange: (tab: TabId) => void
}

export function BottomTabBar({ active, onChange }: BottomTabBarProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-md pb-safe">
      <div className="flex items-stretch max-w-2xl mx-auto">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => onChange(id)}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-1 py-2.5 px-1 transition-colors min-h-[56px]',
              active === id
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Icon
              size={22}
              strokeWidth={active === id ? 2.5 : 1.75}
              className="shrink-0"
            />
            <span className={cn('text-[10px] font-medium leading-none', active === id && 'font-semibold')}>
              {label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  )
}
