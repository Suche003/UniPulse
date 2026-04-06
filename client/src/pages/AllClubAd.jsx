import React, { useEffect, useState } from "react";
import axios from "axios";

const ClubList = () => {
  const [clubs, setClubs] = useState([]);

  useEffect(() => {
    fetchClubs();
  }, []);

  const fetchClubs = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/clubs");
      setClubs(res.data?.data || []);
    } catch (err) {
      console.error("Error fetching clubs:", err);
      setClubs([]); // prevent crash
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Club List</h2>
      {clubs.length === 0 ? (
        <p>No clubs found</p>
      ) : (
        <table border="1" cellPadding="10" style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>Club Name</th>
              <th>Club ID</th>
              <th>Faculty</th>
              <th>Email</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {clubs.map((club) => (
              <tr key={club._id}>
                <td>{club.clubName || "N/A"}</td>
                <td>{club.clubid || "N/A"}</td>
                <td>{club.faculty || "N/A"}</td>
                <td>{club.email || "N/A"}</td>
                <td>
                  {club.isActive ? (
                    <span style={{ color: "green" }}>Active</span>
                  ) : (
                    <span style={{ color: "red" }}>Inactive</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ClubList;