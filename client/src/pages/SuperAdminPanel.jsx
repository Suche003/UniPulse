import React from "react";
import Navbar from "../components/Navbar"; // your Navbar component

function SuperAdminPanel() {
  const cards = [
    { title: "Create Event", color: "#A084FF", link: "/superadmin/events" },
    { title: "Show Events", color: "#FF7BA9", link: "/superadmin/events-get" },
    { title: "Pending Events", color: "#FFD47B", link: "/superadmin/pendingevents" },
  ];

  const navigate = (link) => {
    window.location.href = link;
  };

  return (
    <div>
      <Navbar />

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          padding: "40px",
          gap: "40px",
        }}
      >
        <h2 style={{ color: "var(--text)", marginBottom: "40px" }}>
          Super Admin Control Panel
        </h2>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            flexWrap: "wrap",
            gap: "20px",
          }}
        >
          {cards.map((card, index) => (
            <div
              key={index}
              style={{
                backgroundColor: card.color + "22",
                color: "#000",
                width: "220px",
                height: "140px",
                borderRadius: "16px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                boxShadow: `0 4px 12px ${card.color}66`,
                transition: "transform 0.2s, box-shadow 0.2s",
                cursor: "pointer",
              }}
              onClick={() => navigate(card.link)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-5px)";
                e.currentTarget.style.boxShadow = `0 8px 20px ${card.color}88`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = `0 4px 12px ${card.color}66`;
              }}
            >
              <h3 style={{ margin: 0 }}>{card.title}</h3>
              <button
                style={{
                  marginTop: "12px",
                  padding: "6px 14px",
                  fontSize: "14px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  backgroundColor: card.color,
                  color: "#fff",
                  fontWeight: "bold",
                }}
              >
                Go
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SuperAdminPanel;