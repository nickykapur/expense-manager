export interface VestEvent {
  id: string
  date: string       // ISO date
  shares: number
  vested: boolean
  notes?: string
}

export interface StockHolding {
  id: string
  ticker: string
  companyName?: string
  totalGrantedShares: number
  vestedShares: number
  grantDate: string
  cliffDate?: string
  vestingSchedule: VestEvent[]
  currentPricePerShare?: number
  currency: string
  notes?: string
  createdAt: string
}
