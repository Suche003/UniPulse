import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";

const API = "http://localhost:5000";

export default function Profile() {
  const token = localStorage.getItem("unipulse_token");

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
      setError("");
      setSuccess("");

      if (!token) {
        setError("You are not logged in.");
        setLoading(false);
        return;
      }

      const res = await fetch(`${API}/api/students/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to fetch student");
        return;
      }

      setForm({
        name: data.name || "",
        regNo: data.regNo || "",
        nic: data.nic || "",
        contact: data.contact || "",
        address: data.address || "",
      });

      localStorage.setItem("unipulse_user", JSON.stringify(data));
    } catch (err) {
      console.error("Profile load error:", err);
      setError("Failed to connect to server");
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
      setError("");
      setSuccess("");

      const payload = {
        contact: form.contact,
        address: form.address,
      };

      const res = await fetch(`${API}/api/students/me`, {
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

        setError(msg);
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
      setSuccess("Profile updated successfully!");
    } catch (err) {
      console.error("Profile update error:", err);
      setError("Server error while updating profile");
    } finally {
      setSaving(false);
    }
  }

  function handleCancel() {
    setIsEditing(false);
    setError("");
    setSuccess("");
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

        {error && (
          <div
            style={{
              marginBottom: "18px",
              padding: "14px 16px",
              borderRadius: "14px",
              background: "rgba(255, 93, 115, 0.12)",
              border: "1px solid rgba(255, 93, 115, 0.34)",
              color: "#ffd2d8",
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              marginBottom: "18px",
              padding: "14px 16px",
              borderRadius: "14px",
              background: "rgba(35, 196, 131, 0.14)",
              border: "1px solid rgba(35, 196, 131, 0.35)",
              color: "#bff3dd",
            }}
          >
            {success}
          </div>
        )}

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