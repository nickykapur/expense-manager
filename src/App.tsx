import { useState } from 'react'
import { Toaster } from 'react-hot-toast'
import { BottomTabBar, type TabId } from '@/components/layout/BottomTabBar'
import { ExpensesPage } from '@/pages/ExpensesPage'
import { UpcomingPage } from '@/pages/UpcomingPage'
import { HistoryPage } from '@/pages/HistoryPage'
import { StocksPage } from '@/pages/StocksPage'
import { CryptoPage } from '@/pages/CryptoPage'
import { PaycheckPage } from '@/pages/PaycheckPage'

const PAGES: Record<TabId, React.ReactNode> = {
  paycheck: <PaycheckPage />,
  expenses: <ExpensesPage />,
  upcoming: <UpcomingPage />,
  history: <HistoryPage />,
  stocks: <StocksPage />,
  crypto: <CryptoPage />,
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabId>('paycheck')

  return (
    <div className="min-h-screen bg-background">
      {/* Main content — scrollable, padded bottom for tab bar */}
      <main className="max-w-2xl mx-auto pb-[76px] min-h-screen">
        {PAGES[activeTab]}
      </main>

      <BottomTabBar active={activeTab} onChange={setActiveTab} />

      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
            fontSize: '14px',
          },
          success: { iconTheme: { primary: 'hsl(160 60% 45%)', secondary: 'hsl(var(--card))' } },
        }}
      />
    </div>
  )
}
