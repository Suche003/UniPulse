import { useNavigate } from "react-router-dom";

export default function ClubDashboard() {
  const navigate = useNavigate();

  return (
    <div style={{ marginTop: "80px", padding: "20px" }}>
      <h2>Club Dashboard</h2>

      <button onClick={() => navigate("/club/clubrequest")}>
        Request Event
      </button>

      <button onClick={() => navigate("/club/clubeventlist")}>
        Show Event
      </button>
    </div>
  );
}