import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// ----------------------------------------------------------------
// SINGLE SERVICE WORKER REGISTRATION
// Register sw.js once here. FirebaseService registers firebase-messaging-sw.js
// separately (different scope & purpose). Do NOT register sw.js anywhere else.
// ----------------------------------------------------------------
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js', { scope: '/' })
      .then((registration) => {
        console.log('[main] sw.js registered:', registration.scope);
      })
      .catch((err) => {
        console.warn('[main] sw.js registration failed:', err);
      });
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
