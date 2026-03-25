import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast"; // ← import

import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import EventForm from "./pages/EventFormPage";
import EventListAd from "./pages/EventListAd";
import SponsorList from './pages/SponsorList';
import SponsorForm from './pages/SponsorForm';
import VendorList from './pages/VendorList';
import VendorForm from './pages/VendorForm';
import VendorDashboard from './pages/VendorDashboard';    
import PackageManagement from './pages/PackageManagement';

import ProtectedRoute from "./auth/ProtectedRoute";
import RoleRoute from "./auth/RoleRoute";

function StudentDashboard() {
  return <div>Student Dashboard</div>;
}

function ClubDashboard() {
  return <div>Club Dashboard</div>;
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

        {/* Protected routes (must be logged in) */}
        <Route element={<ProtectedRoute />}>
          {/* Student only */}
          <Route element={<RoleRoute allow={["student"]} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
          </Route>

          {/* Club only */}
          <Route element={<RoleRoute allow={["club"]} />}>
            <Route path="/club/dashboard" element={<ClubDashboard />} />
          </Route>

          {/* Super Admin only */}
          <Route element={<RoleRoute allow={["superadmin"]} />}>
            <Route path="/superadmin/control-panel" element={<SuperAdminPanel />} />
            <Route path="/superadmin/events" element={<EventForm />} />
            <Route path="/superadmin/events-get" element={<EventListAd />} />
          </Route>

          {/* Sponsor routes (superadmin only) */}
          <Route element={<RoleRoute allow={["superadmin"]} />}>
            <Route path="/sponsors" element={<SponsorList />} />
            <Route path="/sponsors/new" element={<SponsorForm />} />
            <Route path="/sponsors/edit/:id" element={<SponsorForm />} />
          </Route>

          {/* Vendor management (superadmin only) */}
          <Route element={<RoleRoute allow={["superadmin"]} />}>
            <Route path="/vendors" element={<VendorList />} />
            <Route path="/vendors/new" element={<VendorForm />} />
            <Route path="/vendors/edit/:id" element={<VendorForm />} />
          </Route>

          {/* Vendor Dashboard */}
          <Route element={<RoleRoute allow={["vendor"]} />}>
            <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          </Route>
        </Route>

        <Route path="/admin/packages" element={<PackageManagement />} />


        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </>
  );
}
