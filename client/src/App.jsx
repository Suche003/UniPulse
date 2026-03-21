import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import EventForm from "./pages/EventFormPage";
import EventList from "./pages/EventList";

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
  return (<div>
    <h2>Super Admin Control Panel</h2>
    <button 
    style={{
          backgroundColor: "#4caf50", // green
          color: "#fff", // text color white
          padding: "12px 24px", // size
          fontSize: "16px",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
    
    onClick={()=>{
      window.location.href="/superadmin/events";
    }}>
    Create Event
    </button>


    <button 
    style={{
          backgroundColor: "#4caf50", // green
          color: "#fff", // text color white
          padding: "12px 24px", // size
          fontSize: "16px",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
    
    onClick={()=>{
      window.location.href="/superadmin/events-get";
    }}>
   ShowEvent
    </button>
    </div>

    


    )
    ;
  
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
          <Route path="/superadmin/events" element={<EventForm />} />
           <Route path="/superadmin/events-get" element={<EventList />} />
          
          
        </Route>

      </Route>

      {/* Fallback route */}
      <Route path="*" element={<div>404 - Page Not Found</div>} />
    </Routes>
  );
}