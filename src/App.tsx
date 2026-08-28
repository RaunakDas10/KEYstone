import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { MarketplacePage } from './pages/public/MarketplacePage';
import { FreelancerProfilePage } from './pages/public/FreelancerProfilePage';
import { HowItWorksPage } from './pages/public/HowItWorksPage';
import { SecurityPage } from './pages/public/SecurityPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// Client Pages
import { ClientDashboard } from './pages/client/ClientDashboard';
import { ClientNewProjectPage } from './pages/client/ClientNewProjectPage';
import { ClientProjectDetailPage } from './pages/client/ClientProjectDetailPage';

// Freelancer Pages
import { FreelancerDashboard } from './pages/freelancer/FreelancerDashboard';
import { FreelancerProjectDetailPage } from './pages/freelancer/FreelancerProjectDetailPage';
import { FreelancerIncomePage } from './pages/freelancer/FreelancerIncomePage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminDisputesPage } from './pages/admin/AdminDisputesPage';
import { AdminFundsPage } from './pages/admin/AdminFundsPage';
import { AdminLedgerPage } from './pages/admin/AdminLedgerPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';

const PublicLayout: React.FC = () => (
  <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100">
    <div>
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
    <Footer />
  </div>
);

const DashboardLayout: React.FC = () => (
  <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100">
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto flex w-full">
        <Sidebar />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
    <Footer />
  </div>
);

export function App() {
  return (
    <Router>
      <Routes>
        {/* Public Landing & Marketing Pages */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/freelancers/:id" element={<FreelancerProfilePage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/security" element={<SecurityPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<LoginPage />} />
        </Route>

        {/* Private Client Workspace Routes */}
        <Route element={<ProtectedRoute allowedRoles={['client']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/client/dashboard" element={<ClientDashboard />} />
            <Route path="/client/projects" element={<ClientDashboard />} />
            <Route path="/client/projects/new" element={<ClientNewProjectPage />} />
            <Route path="/client/projects/:id" element={<ClientProjectDetailPage />} />
            <Route path="/client/messages" element={<ClientProjectDetailPage />} />
            <Route path="/client/transactions" element={<AdminLedgerPage />} />
            <Route path="/client/notifications" element={<ClientDashboard />} />
            <Route path="/client/settings" element={<ClientDashboard />} />
          </Route>
        </Route>

        {/* Private Freelancer Workspace Routes */}
        <Route element={<ProtectedRoute allowedRoles={['freelancer']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/freelancer/dashboard" element={<FreelancerDashboard />} />
            <Route path="/freelancer/projects" element={<FreelancerDashboard />} />
            <Route path="/freelancer/projects/:id" element={<FreelancerProjectDetailPage />} />
            <Route path="/freelancer/income" element={<FreelancerIncomePage />} />
            <Route path="/freelancer/transactions" element={<FreelancerIncomePage />} />
            <Route path="/freelancer/portfolio" element={<FreelancerProfilePage />} />
            <Route path="/freelancer/messages" element={<FreelancerProjectDetailPage />} />
            <Route path="/freelancer/notifications" element={<FreelancerDashboard />} />
            <Route path="/freelancer/settings" element={<FreelancerDashboard />} />
          </Route>
        </Route>

        {/* Private Admin Governance Routes */}
        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsersPage />} />
            <Route path="/admin/projects" element={<AdminDashboard />} />
            <Route path="/admin/disputes" element={<AdminDisputesPage />} />
            <Route path="/admin/funds" element={<AdminFundsPage />} />
            <Route path="/admin/ledger" element={<AdminLedgerPage />} />
            <Route path="/admin/settings" element={<AdminDashboard />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
