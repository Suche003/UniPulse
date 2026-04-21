import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import SuperAdminPanel from "./pages/SuperAdminPanel";

import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import EventForm from "./pages/EventFormPage";
import EventListAd from "./pages/EventListAd";
import PackageManagement from "./pages/PackageManagement";
import UpdateEventForm from "./pages/UpdateEventForm";
import ViewEvent from "./pages/ViewEvent";

import AllClubs from "./pages/AllClubAd";

// Sponsor-related pages
import SponsorSignup from "./pages/SponsorSignup";
import SponsorDashboard from "./pages/SponsorDashboard";
import SponsorDirectory from "./pages/SponsorDirectory";
import ClubRequests from "./pages/ClubRequests";
import SponsorMarketplace from "./pages/SponsorMarketplace";
import ClubPayments from "./pages/ClubPayments";
import SponsorList from "./pages/SponsorList";

import PendingEvents from "./pages/PendingEventsAd";
import EventListAdmin from "./pages/EventListAd";
import ClubForm from "./pages/ClubCreateForm";
import ClubDashboard from "./pages/ClubDashboard";
import ClubEvent from "./pages/EventListCl";
import ViewClub from "./pages/ViewClubs";

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
import EventDetails from "./pages/EventDetails";

// Super Admin pages
import AllVendors from "./pages/AllVendors";
import AllSponsors from "./pages/AllSponsors";
import AllStudents from "./pages/AllStudents";

import ProtectedRoute from "./auth/ProtectedRoute";
import RoleRoute from "./auth/RoleRoute";

export default function App() {
  return (
    <>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: "#363636",
            color: "#fff",
          },
          success: {
            duration: 3000,
            style: {
              background: "#10b981",
            },
          },
          error: {
            duration: 4000,
            style: {
              background: "#ef4444",
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
        <Route path="/register" element={<VendorRegister />} />

        {/* Protected routes */}
        <Route element={<ProtectedRoute />}>
          {/* Student only */}
          <Route element={<RoleRoute allow={["student"]} />}>
            <Route path="/student/dashboard" element={<StudentDashboard />} />
            <Route path="/student/profile" element={<Profile />} />
            <Route path="/student/events/:id" element={<EventDetails />} />
            <Route path="/student/payment/:id" element={<Payment />} />
          </Route>

          {/* Club only */}
          <Route element={<RoleRoute allow={["club"]} />}>
            <Route path="/club/dashboard" element={<ClubDashboard />} />
            <Route path="/club/clubrequest" element={<EventForm />} />
            <Route path="/club/clubeventlist" element={<ClubEvent />} />
            <Route path="/events/view/:id" element={<ViewEvent />} />
            <Route path="/club/viewall" element={<ViewClub />} />

            <Route path="/club/sponsors" element={<SponsorDirectory />} />
            <Route path="/club/marketplace" element={<SponsorMarketplace />} />
            <Route path="/club/requests" element={<ClubRequests />} />
            <Route path="/club/payments" element={<ClubPayments />} />
            <Route path="/events/update/:id" element={<UpdateEventForm />} />
          </Route>

          {/* Sponsor only */}
          <Route element={<RoleRoute allow={["sponsor"]} />}>
            <Route path="/sponsor/dashboard" element={<SponsorDashboard />} />
          </Route>

          {/* Vendor only */}
          <Route element={<RoleRoute allow={["vendor"]} />}>
            <Route path="/vendor/dashboard" element={<VendorDashboard />} />
            <Route path="/vendor-stalls" element={<VendorStalls />} />
            <Route path="/approved-stalls" element={<ApprovedStall />} />
            <Route path="/stall-payment" element={<StallPayment />} />
            <Route path="/booking-stalls/:eventid" element={<BookingForm />} />
          </Route>

          {/* Super Admin only */}
          <Route element={<RoleRoute allow={["superadmin"]} />}>
            <Route
              path="/superadmin/control-panel"
              element={<SuperAdminPanel />}
            />

            <Route path="/superadmin/events" element={<EventForm />} />
            <Route path="/superadmin/events-get" element={<EventListAd />} />

            {/* Request pages */}
            <Route
              path="/superadmin/pendingevents"
              element={<PendingEvents />}
            />
            <Route
              path="/superadmin/vendor-requests"
              element={<Vendor />}
            />
            <Route
              path="/superadmin/sponsor-requests"
              element={<SponsorList />}
            />

            {/* All data pages */}
            <Route
              path="/superadmin/alleventsadmin"
              element={<EventListAdmin />}
            />
            <Route path="/superadmin/vendors" element={<AllVendors />} />
            <Route path="/superadmin/sponsors" element={<AllSponsors />} />
            <Route path="/superadmin/students" element={<AllStudents />} />

            {/* Club management */}
            <Route path="/superadmin/createclub" element={<ClubForm />} />
            <Route path="/superadmin/viewallclubs" element={<AllClubs />} />

            {/* Old requests route kept if used elsewhere */}
            <Route path="/superadmin/requests" element={<Requests />} />

            {/* Stall management routes */}
            <Route path="/stalls/:eventid" element={<Stalls />} />
            <Route path="/stalls/:eventid/add" element={<AddStall />} />
            <Route
              path="/stalls/:eventid/edit/:stallId"
              element={<EditStall />}
            />
          </Route>
        </Route>

        {/* Other routes */}
        <Route path="/admin/packages" element={<PackageManagement />} />
        <Route path="/payment/:bookingId" element={<StallPayment />} />

        {/* 404 */}
        <Route
          path="*"
          element={<div style={{ marginTop: "80px" }}>404 - Page Not Found</div>}
        />
      </Routes>
    </>
  );
}