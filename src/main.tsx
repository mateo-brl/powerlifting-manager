import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Accessibility testing in development mode
if (import.meta.env.DEV) {
  import('@axe-core/react').then((axe) => {
    axe.default(React, ReactDOM, 1000, {
      rules: [
        // Focus on WCAG 2.1 AA compliance
        { id: 'color-contrast', enabled: true },
        { id: 'label', enabled: true },
        { id: 'aria-allowed-attr', enabled: true },
        { id: 'aria-required-attr', enabled: true },
        { id: 'aria-valid-attr', enabled: true },
        { id: 'aria-valid-attr-value', enabled: true },
        { id: 'button-name', enabled: true },
        { id: 'input-button-name', enabled: true },
        { id: 'link-name', enabled: true },
      ],
    });
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
