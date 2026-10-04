import { createRoot } from 'react-dom/client';
import App from './App';
import { I18nProvider } from './i18n';
import '@fontsource/fredoka/latin-400.css';
import '@fontsource/fredoka/latin-600.css';
import '@fontsource/fredoka/latin-700.css';
import './index.css';

if ('serviceWorker' in navigator) {
  if (import.meta.env.MODE === 'web') {
    // Web / iPhone version: keep the app on the phone so it also opens offline
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch((err) => console.warn('Service worker not registered:', err));
      // Ask the browser not to clear the app's data (models and voices) when space runs low
      navigator.storage?.persist?.().catch(() => undefined);
    });
  } else {
    // Android app: no service worker (content is bundled in the APK)
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const r of registrations) {
        r.unregister();
      }
    });
  }
}

createRoot(document.getElementById('root')!).render(
  <I18nProvider>
    <App />
  </I18nProvider>
);
