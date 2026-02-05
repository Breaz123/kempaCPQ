/**
 * CPQ Application Entry Point
 */

console.log('[CPQ] Script started, importing modules...');

import './globals.css';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { ErrorBoundary } from './components/ErrorBoundary';

console.log('[CPQ] All imports successful');

// Verify basic DOM access
const container = document.getElementById('root');
if (!container) {
  document.body.innerHTML = '<h1 style="color: red; padding: 20px;">Error: Root element not found</h1>';
  throw new Error('Root element not found');
}

console.log('[CPQ] Root container found:', container);

// Show immediate feedback while React loads
container.innerHTML = '<div style="padding: 20px;"><h1>Loading CPQ Application...</h1><p>If this message persists, check the console (F12) for errors.</p></div>';

try {
  console.log('[CPQ] Creating React root...');
  const root = createRoot(container);
  console.log('[CPQ] React root created');
  
  console.log('[CPQ] Rendering app...');
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>
  );
  
  console.log('[CPQ] App rendered successfully');
} catch (error) {
  console.error('[CPQ] Fatal error during render:', error);
  container.innerHTML = `
    <div style="padding: 20px; font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto;">
      <h1 style="color: red;">Error Loading Application</h1>
      <p><strong>Error:</strong> ${error instanceof Error ? error.message : 'Unknown error'}</p>
      <details style="margin-top: 20px;">
        <summary>Error Details</summary>
        <pre style="background: #f5f5f5; padding: 10px; overflow: auto; margin-top: 10px; white-space: pre-wrap;">${error instanceof Error ? error.stack : String(error)}</pre>
      </details>
      <p style="margin-top: 20px;">Check the browser console (F12) for more details.</p>
    </div>
  `;
  throw error;
}
