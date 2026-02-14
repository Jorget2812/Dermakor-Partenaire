import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
console.log('Vite Env Check:', import.meta.env);
import App from './App';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Global error handler for white screen debugging
window.addEventListener('error', (event) => {
  if (rootElement.innerHTML === '') {
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: sans-serif; text-align: center; color: #1a1a1a;">
        <h2 style="color: #EF4444;">Erreur d'initialisation</h2>
        <p>Une erreur est survenue lors du chargement de l'application.</p>
        <pre style="text-align: left; background: #f5f5f5; padding: 15px; border-radius: 5px; overflow: auto; margin-top: 20px;">${event.message}\n${event.filename}:${event.lineno}:${event.colno}</pre>
        <button onclick="window.location.reload()" style="margin-top: 20px; padding: 10px 20px; background: #1a1a1a; color: white; border: none; border-radius: 5px; cursor: pointer;">Réessayer</button>
      </div>
    `;
  }
});

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <App />
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);