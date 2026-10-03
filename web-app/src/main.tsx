import { createRoot } from 'react-dom/client';
import App from './App';
import '@fontsource/fredoka/400.css';
import '@fontsource/fredoka/600.css';
import '@fontsource/fredoka/700.css';
import './index.css';

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const r of registrations) {
      r.unregister();
    }
  });
}

createRoot(document.getElementById('root')!).render(<App />);
