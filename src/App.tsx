import React, { useEffect, useRef } from 'react';
import { MemoryRouter as Router, Routes, Route, Navigate, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useProjectStore } from './store';
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
import { VerifyEmailPage } from './pages/auth/VerifyEmailPage';

// Client Pages
import { ClientOverview } from './pages/client/ClientOverview';
import { ClientNewProjectPage } from './pages/client/ClientNewProjectPage';
import { ClientProjectDetailPage } from './pages/client/ClientProjectDetailPage';

// Freelancer Pages
import { FreelancerOverview } from './pages/freelancer/FreelancerOverview';
import { FreelancerProjectDetailPage } from './pages/freelancer/FreelancerProjectDetailPage';
import { FreelancerIncomePage } from './pages/freelancer/FreelancerIncomePage';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminDisputesPage } from './pages/admin/AdminDisputesPage';
import { AdminFundsPage } from './pages/admin/AdminFundsPage';
import { AdminLedgerPage } from './pages/admin/AdminLedgerPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminReportsPage } from './pages/admin/AdminReportsPage';
import { ChatPage } from './pages/shared/ChatPage';
import { NotificationsPage } from './pages/shared/NotificationsPage';
import { FreelancersDirectoryPage } from './pages/shared/FreelancersDirectoryPage';
import { StandInPage } from './pages/public/StandInPage';
import { AccountProfilePage } from './pages/shared/AccountProfilePage';
import { SettingsPage } from './pages/shared/SettingsPage';
import { TransactionsPage } from './pages/shared/TransactionsPage';

const PublicLayout: React.FC = () => {
  const location = useLocation();
  const isCinematicLanding = location.pathname === '/' || location.pathname === '/landing';

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100">
      <div>
        {!isCinematicLanding && <Navbar />}
        <main>
          <Outlet />
        </main>
      </div>
      <Footer />
    </div>
  );
};

const FullWidthLayout: React.FC = () => (
  <div className="min-h-screen bg-slate-950 flex flex-col justify-between text-slate-100">
    <div>
      <Navbar />
      <main className="w-full min-w-0">
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

/**
 * Keep internal routes out of the address bar while preserving browser Back
 * and Forward navigation. Each screen is stored as a same-URL history entry.
 */
const BrowserHistoryBridge: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isInitialRender = useRef(true);
  const pendingPopRoute = useRef<string | null>(null);
  const route = `${location.pathname}${location.search}${location.hash}`;

  useEffect(() => {
    if (isInitialRender.current) {
      isInitialRender.current = false;
      window.history.replaceState({ ...(window.history.state ?? {}), keystoneRoute: route }, '', '/');
      return;
    }

    if (pendingPopRoute.current === route) {
      pendingPopRoute.current = null;
      return;
    }

    window.history.pushState({ keystoneRoute: route }, '', '/');
  }, [route]);

  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      const previousRoute = event.state?.keystoneRoute;

      if (typeof previousRoute !== 'string' || previousRoute === route) return;

      pendingPopRoute.current = previousRoute;
      navigate(previousRoute);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [navigate, route]);

  return null;
};

export function App() {
  const fetchInitialData = useProjectStore((state) => state.fetchInitialData);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  return (
    <Router>
      <BrowserHistoryBridge />
      <Routes>
        {/* Public Landing & Marketing Pages */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/marketplace" element={<MarketplacePage />} />
          <Route path="/freelancers" element={<FreelancersDirectoryPage />} />
          <Route path="/freelancers/:id" element={<FreelancerProfilePage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
          <Route path="/security" element={<SecurityPage />} />
          <Route path="/standin" element={<StandInPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<LoginPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/profile" element={<AccountProfilePage />} />
          </Route>
        </Route>

        {/* Private Client Workspace Routes */}
        <Route element={<ProtectedRoute allowedRoles={['client']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/client/dashboard" element={<ClientOverview />} />
            <Route path="/client/overview" element={<ClientOverview />} />
            <Route path="/client/projects" element={<ClientOverview />} />
            <Route path="/client/projects/new" element={<ClientNewProjectPage />} />
            <Route path="/client/projects/:id" element={<ClientProjectDetailPage />} />
            <Route path="/client/messages" element={<ChatPage />} />
            <Route path="/client/transactions" element={<TransactionsPage />} />
            <Route path="/client/notifications" element={<NotificationsPage />} />
            <Route path="/client/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Private Freelancer Workspace Routes */}
        <Route element={<ProtectedRoute allowedRoles={['freelancer']} />}>
          <Route element={<DashboardLayout />}>
            <Route path="/freelancer/dashboard" element={<FreelancerOverview />} />
            <Route path="/freelancer/overview" element={<FreelancerOverview />} />
            <Route path="/freelancer/projects" element={<FreelancerOverview />} />
            <Route path="/freelancer/projects/:id" element={<FreelancerProjectDetailPage />} />
            <Route path="/freelancer/income" element={<FreelancerIncomePage />} />
            <Route path="/freelancer/transactions" element={<TransactionsPage />} />
            <Route path="/freelancer/portfolio" element={<FreelancerProfilePage />} />
            <Route path="/freelancer/messages" element={<ChatPage />} />
            <Route path="/freelancer/notifications" element={<NotificationsPage />} />
            <Route path="/freelancer/settings" element={<SettingsPage />} />
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
            <Route path="/admin/notifications" element={<NotificationsPage />} />
            <Route path="/admin/reports" element={<AdminReportsPage />} />
            <Route path="/admin/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
