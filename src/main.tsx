import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Register service worker
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    // Automatically update without prompting
    updateSW(true);
  },
  onOfflineReady() {
    console.log('App ready to work offline')
  },
  onRegistered(r) {
    console.log('Service Worker registered')
    // Check for updates every hour
    r && setInterval(() => {
      r.update()
    }, 60 * 60 * 1000)
  },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)