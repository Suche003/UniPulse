import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import EventForm from "./pages/EventFormPage";
import EventListAd from "./pages/EventListAd";
import SponsorList from './pages/SponsorList';
import PackageManagement from './pages/PackageManagement';

// Sponsor-related pages
import SponsorSignup from './pages/SponsorSignup';
import SponsorDashboard from './pages/SponsorDashboard';
import SponsorDirectory from './pages/SponsorDirectory';
import ClubRequests from './pages/ClubRequests';
import SponsorMarketplace from './pages/SponsorMarketplace';
import ClubPayments from './pages/ClubPayments';

import ProtectedRoute from "./auth/ProtectedRoute";
import RoleRoute from "./auth/RoleRoute";

/* Temporary dashboard placeholders */
function StudentDashboard() {
  return <div>Student Dashboard</div>;
}

function ClubDashboard() {
  return (
    <div className="container" style={{ padding: '2rem' }}>
      <h1>Club Dashboard</h1>
      <div className="card" style={{ padding: '1.5rem', marginBottom: '1rem' }}>
        <p>Welcome to your club dashboard. Manage your events and sponsorship requests here.</p>
      </div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <a href="/club/marketplace" className="btn-primary">Sponsorship Marketplace</a>
        <a href="/club/requests" className="btn-primary">View Requests</a>
        <a href="/club/payments" className="btn-primary">Payments Received</a>
      </div>
    </div>
  );
}

function SuperAdminPanel() {
  return (
    <div>
      <h2>Super Admin Control Panel</h2>
      <button 
        style={{
          backgroundColor: "#4caf50",
          color: "#fff",
          padding: "12px 24px",
          fontSize: "16px",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
        onClick={() => window.location.href="/superadmin/events"}
      >
        Create Event
      </button>

      <button 
        style={{
          backgroundColor: "#4caf50",
          color: "#fff",
          padding: "12px 24px",
          fontSize: "16px",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
        onClick={() => window.location.href="/superadmin/events-get"}
      >
        Show Event
      </button>
    </div>
  );
}

export default function App() {
  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#10b981',
            },
          },
          error: {
            duration: 4000,
            style: {
              background: '#ef4444',
            },
          },
        }}
      />
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/sponsor-signup" element={<SponsorSignup />} />

        {/* Protected routes (must be logged in) */}
        <Route element={<ProtectedRoute />}>
          {/* Student only */}
          <Route element={<RoleRoute allow={["student"]} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
          </Route>

          {/* Club only */}
          <Route element={<RoleRoute allow={["club"]} />}>
            <Route path="/club/dashboard" element={<ClubDashboard />} />
            <Route path="/club/sponsors" element={<SponsorDirectory />} />
            <Route path="/club/marketplace" element={<SponsorMarketplace />} />
            <Route path="/club/requests" element={<ClubRequests />} />
            <Route path="/club/payments" element={<ClubPayments />} />
          </Route>

          {/* Super Admin only */}
          <Route element={<RoleRoute allow={["superadmin"]} />}>
            <Route path="/superadmin/control-panel" element={<SuperAdminPanel />} />
            <Route path="/superadmin/events" element={<EventForm />} />
            <Route path="/superadmin/events-get" element={<EventListAd />} />
          </Route>

          {/* Sponsor management (superadmin only) – only list, no create/edit */}
          <Route element={<RoleRoute allow={["superadmin"]} />}>
            <Route path="/sponsors" element={<SponsorList />} />
          </Route>

          {/* Sponsor Dashboard */}
          <Route element={<RoleRoute allow={["sponsor"]} />}>
            <Route path="/sponsor/dashboard" element={<SponsorDashboard />} />
          </Route>
        </Route>

        <Route path="/admin/packages" element={<PackageManagement />} />

        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </>
  );
}