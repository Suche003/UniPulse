import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import { Routes, Route, useNavigate } from "react-router-dom";

import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import EventForm from "./pages/EventFormPage";
import PendingEvents from "./pages/PendingEventsAd";
import EventListAdmin from "./pages/EventListAd";
import ClubForm from "./pages/ClubCreateForm";
import ClubDashboard from "./pages/ClubDashbord";
import ClubEvent from "./pages/EventListCl";
import UpdateEvent from "./pages/UpdateEvent";
import ViewClub from "./pages/ViewClubs";
import AllClubAd from "./pages/AllClubAd";


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
import StudentDashboard from "./pages/StudentDashboard";
import Profile from "./pages/Profile";
import Payment from "./pages/Payment";

import ProtectedRoute from "./auth/ProtectedRoute";
import RoleRoute from "./auth/RoleRoute";

/* Dashboards */
function StudentDashboard() {
  return <div style={{ marginTop: "80px" }}>Student Dashboard</div>;
}

/* Temporary dashboard placeholders */
function ClubDashboard() {
  return <div>Club Dashboard</div>;
}


/* Super Admin Panel */
function SuperAdminPanel() {
  const cards = [
    { title: "Create Club", color: "#9D4DFF", link: "/superadmin/createclub" }, // bright red
    { title: "Upcoming Events", color: "#4DD9FF", link: "/superadmin/alleventsadmin" }, // bright blue
    { title: "Pending Events", color: "#FFB84D", link: "/superadmin/pendingevents" }, // bright orange
    { title: "All Events", color: "#944dff", link: "/superadmin/viewallclubs" }, 
    
  ];

  const navigate = (link) => {
    window.location.href = link;
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "flex-start",
        alignItems: "center",
        flexDirection: "column",
        padding: "40px",
        marginTop: "80px",
        gap: "30px",
      }}
    >
      <h1 style={{ color: "#eff0f0" }}>Super Admin Control Panel</h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "25px",
          width: "100%",
          maxWidth: "800px",
        }}
      >
        {cards.map((card, index) => (
          <div
            key={index}
            style={{
              backgroundColor: "#fff", // card background white
              height: "150px",
              borderRadius: "16px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              boxShadow: `0 4px 12px ${card.color}33`,
              border: `2px solid ${card.color}`,
              transition: "all 0.3s ease",
              cursor: "pointer",
            }}
            onClick={() => navigate(card.link)}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-6px)";
              e.currentTarget.style.boxShadow = `0 8px 20px ${card.color}55`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = `0 4px 12px ${card.color}33`;
            }}
          >
            <h3 style={{ color: card.color, marginBottom: "10px", fontWeight: "bold" }}>
              {card.title}
            </h3>

            <button
              style={{
                marginTop: "8px",
                padding: "7px 16px",
                fontSize: "14px",
                borderRadius: "10px",
                border: `1px solid ${card.color}`,
                cursor: "pointer",
                backgroundColor: card.color,
                color: "#fff",
                fontWeight: "bold",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.backgroundColor = "#fff";
                e.target.style.color = card.color;
              }}
              onMouseLeave={(e) => {
                e.target.style.backgroundColor = card.color;
                e.target.style.color = "#fff";
              }}
            >
              Go
            </button>
          </div>
        ))}
      </div>
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

/* ✅ MAIN APP */
export default function App() {
  return (
    <>
      <Navbar />
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />

      {/* Vendor registration route */}
      <Route path="/register" element={<VendorRegister />} />

      {/* Protected routes (must be logged in) */}
      <Route element={<ProtectedRoute />}>

      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        {/* Student only */}
        <Route element={<RoleRoute allow={["student"]} />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/profile" element={<Profile />} />
          <Route path="/student/events/:id" element={<EventDetails />} />
          <Route path="/student/payment/:id" element={<Payment />} />
        </Route>

      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />

        {/* Protected */}
        <Route element={<ProtectedRoute />}>

          <Route element={<RoleRoute allow={["student"]} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
          </Route>

          <Route element={<RoleRoute allow={["club"]} />}>
            <Route path="/club/dashboard" element={<ClubDashboard />} />
            <Route path="/club/clubrequest" element={<EventForm />} />
            <Route path="/club/clubeventlist" element={<ClubEvent />} />
            <Route path="/club/update-event/:id" element={<UpdateEvent />} />
             <Route path="/club/viewall" element={<ViewClub />} />
          </Route>

          <Route element={<RoleRoute allow={["superadmin"]} />}>
            <Route path="/superadmin/control-panel" element={<SuperAdminPanel />} />
  
            <Route path="/superadmin/pendingevents" element={<PendingEvents />} />
            <Route path="/superadmin/alleventsadmin" element={<EventListAdmin />} />
            <Route path="/superadmin/createclub" element={<ClubForm />} />
             <Route path="/superadmin/viewallclubs" element={<AllClubAd />} />
          </Route>

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
          <Route
            path="/superadmin/control-panel"
            element={<SuperAdminPanel />}
          />
        </Route>
      </Route>

        {/* 404 */}
        <Route path="*" element={<div style={{ marginTop: "80px" }}>404 - Page Not Found</div>} />
      </Routes>
    </>
  );
}