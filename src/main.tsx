import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { seedIfEmpty } from './lib/seedData.ts'

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

// Apply dark mode by default
document.documentElement.classList.add('dark')

// Pre-load with initial data on first launch
seedIfEmpty()

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
