import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const root = document.getElementById('root')
if (!root) throw new Error('Root element not found')

// Apply dark mode by default
document.documentElement.classList.add('dark')

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
