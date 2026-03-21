import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuditProvider } from './context/AuditContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuditProvider>
      <App />
    </AuditProvider>
  </StrictMode>,
)
