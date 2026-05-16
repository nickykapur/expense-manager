export interface CryptoHolding {
  id: string
  symbol: string
  name?: string
  amountHeld: number
  costBasisPerUnit: number
  currentPricePerUnit?: number
  lastUpdated?: string
  walletLabel?: string
  notes?: string
  createdAt: string
}
