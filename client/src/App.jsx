import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";

import ProtectedRoute from "./auth/ProtectedRoute";
import RoleRoute from "./auth/RoleRoute";

/* Temporary dashboard placeholders */
function StudentDashboard() {
  return <div>Student Dashboard</div>;
}

function ClubDashboard() {
  return <div>Club Dashboard</div>;
}

function SuperAdminPanel() {
  return <div>Super Admin Control Panel</div>;
}

export default function App() {
  return (
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
        </Route>

      </Route>

      {/* Fallback route */}
      <Route path="*" element={<div>404 - Page Not Found</div>} />
    </Routes>
  );
}