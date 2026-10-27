import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register service worker with auto-update for offline support and mobile installability
const updateSW = registerSW({ 
  immediate: true,
  onNeedRefresh() {
    console.log('[PWA] New version detected from deployment. Updating immediately...');
    // Automatically apply update without blocking confirm prompt
    updateSW(true);
  },
  onOfflineReady() {
    console.log('[PWA] App is ready to work offline.');
  },
  onRegistered(registration) {
    if (registration) {
      // 1. Periodically check for updates (every 15 minutes)
      setInterval(() => {
        registration.update().catch(() => {});
      }, 15 * 60 * 1000);

      // 2. Check for update when the user brings the app to foreground on phone
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          registration.update().catch(() => {});
        }
      });

      // 3. Check for update when device reconnects to internet
      window.addEventListener('online', () => {
        registration.update().catch(() => {});
      });
    }
  }
});

// Auto-reload to activate the new version as soon as the service worker updates
let isRefreshing = false;
navigator.serviceWorker?.addEventListener('controllerchange', () => {
  if (!isRefreshing) {
    isRefreshing = true;
    console.log('[PWA] New service worker activated. Refreshing page...');
    window.location.reload();
  }
});

console.log('AG Notepad App v1.2.0 initialized (PWA Auto-Update Enabled)');

createRoot(document.getElementById('root')!).render(<App />);


