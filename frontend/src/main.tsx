import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

// --- Legacy hash deep-link bridge ---
// Older certificate PDFs (and the admin shortcut) print URLs of the form
// `.../#verify=ALIM-XXXX-XXXX` and `.../#admin`. HashRouter treats the raw
// `verify=CODE` / `admin` fragment as an unknown path, so the catch-all route
// (`path="*"` -> Navigate to "/") rewrites the hash to `#/` DURING the first
// render — before any in-app effect can read the original code. The result was
// that scanning/clicking a diploma's verification link landed the visitor on
// the marketing homepage instead of the certificate.
//
// Normalizing the hash to the canonical route here — before `createRoot().render()`
// mounts HashRouter — guarantees the router only ever sees a valid path. This
// keeps every already-issued diploma's verification link working.
function normalizeLegacyHash() {
  const hash = window.location.hash;
  if (hash.startsWith('#verify=')) {
    const code = hash.substring('#verify='.length);
    window.location.hash = `#/verify/${code}`;
  } else if (hash === '#admin') {
    window.location.hash = '#/admin/login';
  }
}

normalizeLegacyHash();
// Also bridge legacy fragments that arrive while the app is already open
// (e.g. pasting an old link into the address bar of a loaded tab).
window.addEventListener('hashchange', normalizeLegacyHash);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
