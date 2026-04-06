import { Routes, Route, useNavigate } from "react-router-dom";

import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Stalls from "./pages/Stalls";
import AddStall from "./pages/AddStall";
import EditStall from "./pages/EditStall"; 
import VendorStalls from "./pages/VendorStalls"; 
import BookingForm from "./pages/BookingForm";
import Requests from "./pages/Requests";
import Vendor from "./pages/Vendors"; 
import ApprovedStall from "./pages/ApprovedStall"; 
import StallPayment from "./pages/StallPayment";
import VendorDashboard from "./pages/VendorDashboard"; 
import VendorRegister from "./pages/VendorRegister"; 

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
  const navigate = useNavigate();

  const buttonStyle = {
    backgroundColor: "rgba(124,44,255,0.65)",
    color: "#fff",
    padding: "12px 24px",
    fontSize: "16px",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    marginRight: "10px",
    marginBottom: "10px",
  };

  return (
    <div>
      <h2>Super Admin Control Panel</h2>

      <button style={buttonStyle} onClick={() => navigate("/superadmin/requests")}>
        Requests
      </button>

      <button style={buttonStyle} onClick={() => navigate("/superadmin/vendors")}>
        Vendors
      </button>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />

      {/* Vendor registration route */}
      <Route path="/register" element={<VendorRegister />} />

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

        {/* Vendor only */}
        <Route element={<RoleRoute allow={["vendor"]} />}>
          <Route path="/vendor/dashboard" element={<VendorDashboard />} />
          <Route path="/vendor-stalls" element={<VendorStalls />} />
          <Route path="/approved-stalls" element={<ApprovedStall />} />
          <Route path="/stall-payment" element={<StallPayment />} />
          <Route path="/vendor-profile" element={<Vendor />} />

          {/* Booking Form route for vendor */}
          <Route path="/booking-stalls/:eventid" element={<BookingForm />} />
        </Route>

        {/* Super Admin only */}
        <Route element={<RoleRoute allow={["superadmin"]} />}>
          <Route path="/superadmin/control-panel" element={<SuperAdminPanel />} />

          {/* Stall management routes */}
          <Route path="/stalls/:eventid" element={<Stalls />} />
          <Route path="/stalls/:eventid/add" element={<AddStall />} />
          <Route path="/stalls/:eventid/edit/:stallId" element={<EditStall />} />

          {/* Vendor Stalls route */}
          <Route path="/vendor-stalls" element={<VendorStalls />} />

          {/* Approved Stalls route */}
          <Route path="/approved-stalls" element={<ApprovedStall />} />

          {/* Stall Payment route */}
          <Route path="/stall-payment" element={<StallPayment />} />

          <Route path="/superadmin/requests" element={<Requests />} />

          {/* Vendor requests route */}
          <Route path="/superadmin/vendors" element={<Vendor />} />

          <Route path="/payment/:bookingId" element={<StallPayment />} />
        </Route>
      </Route>

      {/* Fallback route */}
      <Route path="*" element={<div>404 - Page Not Found</div>} />
    </Routes>
  );
}