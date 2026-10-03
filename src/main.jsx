import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
)

// Register the service worker so the app can be added to the home screen
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}))
}

// Chrome/Android fire this when the app can be installed — keep it so the in-app button can use it
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  window.__wildInstallPrompt = e
  window.dispatchEvent(new Event('wild-install-available'))
})
