/**
 * Customer App Router
 * 
 * Handles routing for the customer-facing application
 */

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { CustomerApp } from './App';
import { MdfPowderCoatingPage } from './pages/MdfPowderCoatingPage';
import { AdminLogin } from './pages/AdminLogin';
import { AdminCatalog } from './pages/AdminCatalog';
import { KempaHeader } from './components/KempaHeader';
import { KempaFooter } from './components/KempaFooter';

export function AppRouter() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-white flex flex-col">
        <KempaHeader />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<CustomerApp />} />
            <Route path="/mdf-poederlakken" element={<MdfPowderCoatingPage />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/catalog" element={<AdminCatalog />} />
          </Routes>
        </main>
        <KempaFooter />
      </div>
    </BrowserRouter>
  );
}
