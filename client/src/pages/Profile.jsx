import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

export default function Profile() {
  const token = localStorage.getItem("unipulse_token");

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    regNo: "",
    nic: "",
    contact: "",
    address: "",
  });

  async function loadProfile() {
    try {
      setLoading(true);

      const res = await fetch("http://localhost:5000/api/students/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to load profile");
        return;
      }

      setForm({
        name: data.name || "",
        regNo: data.regNo || "",
        nic: data.nic || "",
        contact: data.contact || "",
        address: data.address || "",
      });

      // keep localStorage synced with latest backend data
      localStorage.setItem("unipulse_user", JSON.stringify(data));
    } catch (err) {
      alert("Failed to connect to server");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfile();
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSave() {
    try {
      setSaving(true);

      const payload = {
        contact: form.contact,
        address: form.address,
      };

      const res = await fetch("http://localhost:5000/api/students/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const msg = data?.errors
          ? data.errors.map((x) => `• ${x.msg}`).join("\n")
          : data.message || "Failed to update profile";
        alert(msg);
        return;
      }

      localStorage.setItem("unipulse_user", JSON.stringify(data.user));

      setForm({
        name: data.user.name || "",
        regNo: data.user.regNo || "",
        nic: data.user.nic || "",
        contact: data.user.contact || "",
        address: data.user.address || "",
      });

      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Server error while updating profile");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setIsEditing(false);
    loadProfile();
  }

  return (
    <div className="page">
      <Navbar />

      <main className="container">
        <section className="profileHero">
          <p className="dashboardTag">My Profile</p>
          <h1 className="dashboardTitle">Student Profile</h1>
          <p className="dashboardSubtitle">
            View and manage your personal information registered in UniPulse.
          </p>
        </section>

        <section className="profileGrid">
          <div className="profileCard">
            <div className="profileCardHeader">
              <h2>Personal Information</h2>

              {!isEditing ? (
                <button
                  className="btn btn--primary"
                  onClick={() => setIsEditing(true)}
                  disabled={loading}
                >
                  Edit Profile
                </button>
              ) : (
                <div className="profileActionButtons">
                  <button
                    className="btn btn--primary"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>

                  <button
                    className="btn btn--ghost"
                    onClick={handleCancel}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {loading ? (
              <p className="emptyText">Loading profile...</p>
            ) : (
              <div className="profileInfo">
                <div className="profileRow">
                  <span>Full Name</span>
                  <strong>{form.name || "Not available"}</strong>
                </div>

                <div className="profileRow">
                  <span>Registration Number</span>
                  <strong>{form.regNo || "Not available"}</strong>
                </div>

                <div className="profileRow">
                  <span>NIC Number</span>
                  <strong>{form.nic || "Not available"}</strong>
                </div>

                <div className="profileRow">
                  <span>Contact Number</span>
                  {isEditing ? (
                    <input
                      className="profileInput"
                      name="contact"
                      value={form.contact}
                      onChange={handleChange}
                      placeholder="0771234567"
                    />
                  ) : (
                    <strong>{form.contact || "Not available"}</strong>
                  )}
                </div>

                <div className="profileRow">
                  <span>Address</span>
                  {isEditing ? (
                    <textarea
                      className="profileTextarea"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      rows="3"
                      placeholder="Enter your address"
                    />
                  ) : (
                    <strong>{form.address || "Not available"}</strong>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="profileCard">
            <h2>Account Overview</h2>

            <div className="profileInfo">
              <div className="profileRow">
                <span>Role</span>
                <strong>Student</strong>
              </div>

              <div className="profileRow">
                <span>Status</span>
                <strong>Active</strong>
              </div>

              <div className="profileRow">
                <span>Editable Fields</span>
                <strong>Contact, Address</strong>
              </div>

              <div className="profileRow">
                <span>Protected Fields</span>
                <strong>Name, Reg No, NIC</strong>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}