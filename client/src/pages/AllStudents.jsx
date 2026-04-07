import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./AdminPeoplePages.css";

export default function AllStudents() {
  const navigate = useNavigate();

  const [students, setStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStudents = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await axios.get("http://localhost:5000/api/students");
      setStudents(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("Fetch students error:", err);
      console.error("Response data:", err.response?.data);
      console.error("Status:", err.response?.status);

      setError(err.response?.data?.message || "Failed to fetch students.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteStudent = async (studentId, studentName) => {
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${studentName}?`
    );

    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:5000/api/students/${studentId}`);

      if (selectedStudent && selectedStudent._id === studentId) {
        setSelectedStudent(null);
      }

      fetchStudents();
    } catch (err) {
      console.error("Delete student error:", err);
      alert(err.response?.data?.message || "Failed to delete student.");
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    const value = searchTerm.toLowerCase();

    return students.filter((student) => {
      return (
        student?.name?.toLowerCase().includes(value) ||
        student?.nic?.toLowerCase().includes(value) ||
        student?.contact?.toLowerCase().includes(value) ||
        student?.regNo?.toLowerCase().includes(value) ||
        student?.address?.toLowerCase().includes(value)
      );
    });
  }, [students, searchTerm]);

  return (
    <div className="admin-people-page">
      <div className="admin-people-bg"></div>

      <div className="admin-people-container">
        <div className="admin-people-header glass-card">
          <div>
            <h1>All Students List</h1>
          </div>

          <button
            className="admin-back-btn"
            onClick={() => navigate("/superadmin/control-panel")}
          >
            <span>&#8617;</span> Go Back
          </button>
        </div>

        <div className="admin-people-stats">
          <div className="glass-card stat-card">
            <span className="stat-label">Total Students</span>
            <h2>{students.length}</h2>
          </div>

          <div className="glass-card stat-card">
            <span className="stat-label">Showing Results</span>
            <h2>{filteredStudents.length}</h2>
          </div>
        </div>

        <div className="glass-card admin-toolbar">
          <input
            type="text"
            placeholder="Search by name, NIC, contact, reg no, address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="admin-search-input"
          />

          <button className="admin-refresh-btn" onClick={fetchStudents}>
            Refresh
          </button>
        </div>

        {loading && (
          <div className="glass-card admin-message">Loading students...</div>
        )}

        {error && <div className="glass-card admin-error">{error}</div>}

        {!loading && !error && (
          <div className="glass-card admin-table-wrap">
            {filteredStudents.length === 0 ? (
              <div className="admin-message">No students found.</div>
            ) : (
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Student Name</th>
                    <th>NIC</th>
                    <th>Registration No</th>
                    <th>Contact</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, index) => (
                    <tr key={student._id || index}>
                      <td>{index + 1}</td>
                      <td>{student.name || "N/A"}</td>
                      <td>{student.nic || "N/A"}</td>
                      <td>{student.regNo || "N/A"}</td>
                      <td>{student.contact || "N/A"}</td>
                      <td>
                        <div className="table-action-group">
                          <button
                            className="table-action-btn"
                            onClick={() => setSelectedStudent(student)}
                          >
                            View
                          </button>

                          <button
                            className="table-delete-btn"
                            onClick={() =>
                              handleDeleteStudent(student._id, student.name)
                            }
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>

      {selectedStudent && (
        <div
          className="admin-modal-overlay"
          onClick={() => setSelectedStudent(null)}
        >
          <div
            className="admin-modal glass-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="admin-modal-header">
              <div>
                <h3>Student Details</h3>
              </div>

              <button
                className="modal-close-btn"
                onClick={() => setSelectedStudent(null)}
              >
                ✕
              </button>
            </div>

            <div className="details-grid">
              <div className="detail-box">
                <span>Name</span>
                <p>{selectedStudent.name || "N/A"}</p>
              </div>

              <div className="detail-box">
                <span>NIC</span>
                <p>{selectedStudent.nic || "N/A"}</p>
              </div>

              <div className="detail-box">
                <span>Contact Number</span>
                <p>{selectedStudent.contact || "N/A"}</p>
              </div>

              <div className="detail-box">
                <span>Registration Number</span>
                <p>{selectedStudent.regNo || "N/A"}</p>
              </div>

              <div className="detail-box detail-box--full">
                <span>Address</span>
                <p>{selectedStudent.address || "N/A"}</p>
              </div>

              <div className="detail-box">
                <span>Created At</span>
                <p>
                  {selectedStudent.createdAt
                    ? new Date(selectedStudent.createdAt).toLocaleString()
                    : "N/A"}
                </p>
              </div>

              <div className="detail-box">
                <span>Updated At</span>
                <p>
                  {selectedStudent.updatedAt
                    ? new Date(selectedStudent.updatedAt).toLocaleString()
                    : "N/A"}
                </p>
              </div>
            </div>

            <div className="admin-modal-actions">
              <button
                className="table-delete-btn"
                onClick={() =>
                  handleDeleteStudent(selectedStudent._id, selectedStudent.name)
                }
              >
                Delete Student
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}