import { lazy, StrictMode, Suspense } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
import App from './App';
import './styles.css';
import './film.css';

const container = document.getElementById('root')!;
const PrintPortfolio = lazy(() => import('./PrintPortfolio'));

if (new URLSearchParams(location.search).get('print') === '1') {
  createRoot(container).render(<Suspense fallback={null}><PrintPortfolio /></Suspense>);
} else {
  const app = <StrictMode><App /></StrictMode>;
  if (container.firstElementChild) hydrateRoot(container, app);
  else createRoot(container).render(app);
}
