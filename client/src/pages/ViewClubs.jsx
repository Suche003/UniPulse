import { useEffect, useState } from "react";
import axios from "axios";
import "./ClubForm.css"; // Using same CSS as CreateClub for styling

export default function ViewAllClubs() {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchClubs = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/clubs/viewall");
        setClubs(res.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch clubs");
        setLoading(false);
      }
    };

    fetchClubs();
  }, []);

  if (loading) return <div className="create-club-container">Loading...</div>;
  if (error) return <div className="create-club-container">{error}</div>;

  return (
    <div className="create-club-page">
      <div className="create-club-container">
        <h2>All Clubs</h2>
        {clubs.length === 0 ? (
          <p>No clubs found</p>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={thStyle}>Club ID</th>
                <th style={thStyle}>Name</th>
                <th style={thStyle}>Faculty</th>
                <th style={thStyle}>Email</th>
              </tr>
            </thead>
            <tbody>
              {clubs.map((club) => (
                <tr key={club.clubId} style={{ textAlign: "center" }}>
                  <td style={tdStyle}>{club.clubId}</td>
                  <td style={tdStyle}>{club.clubName}</td>
                  <td style={tdStyle}>{club.faculty}</td>
                  <td style={tdStyle}>{club.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const thStyle = {
  borderBottom: "1px solid rgba(255,255,255,0.2)",
  padding: "8px",
  color: "#eaeaf2",
};

const tdStyle = {
  borderBottom: "1px solid rgba(255,255,255,0.1)",
  padding: "8px",
  color: "#eaeaf2",
};