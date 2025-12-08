import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './base.css'
import './index.css'
import './mobile-override.css'
import './components/StickyHeader.css'
import App from './App.tsx'

/**
 * 🌟 Halterra Premium - Main Application Entry Point
 */
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// UNREGISTER all Service Workers to fix caching issues
// This will clear any stuck SW on user devices
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      registration.unregister();
      console.log('SW unregistered:', registration);
    }
  });
  // Also clear all caches
  if ('caches' in window) {
    caches.keys().then((names) => {
      for (const name of names) {
        caches.delete(name);
        console.log('Cache deleted:', name);
      }
    });
  }
}
