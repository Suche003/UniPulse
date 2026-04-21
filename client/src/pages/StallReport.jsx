import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useNavigate } from "react-router-dom";
import "./StallReport.css";

/* CATEGORY COLORS */
const CATEGORY_COLORS = {
  Food: "#f97316",
  Games: "#3b82f6",
  Merchandise: "#8b5cf6",
  Unknown: "#9ca3af",
};

/* PIE TOOLTIP */
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="custom-tooltip">
        <p className="tooltip-value">Count: {payload[0].value}</p>
      </div>
    );
  }
  return null;
};

/* CATEGORY AXIS COLOR */
const renderCategoryTick = (props) => {
  const { x, y, payload } = props;
  const name = payload.value;

  return (
    <text
      x={x}
      y={y + 12}
      fill={CATEGORY_COLORS[name] || "#9ca3af"}
      fontSize={16}
      fontWeight="bold"
      textAnchor="middle"
    >
      {name}
    </text>
  );
};

const StallReport = () => {
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const club = JSON.parse(localStorage.getItem("unipulse_user")) || {};
  const clubId = club.clubid || club._id;

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `http://localhost:5000/api/bookings/club?clubid=${clubId}`
      );

      const data = res.data || [];
      setBookings(data);
      setFiltered(data);
    } catch {
      setError("Failed to load report");
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = () => {
    if (!fromDate && !toDate) {
      setFiltered(bookings);
      return;
    }

    const from = fromDate ? new Date(fromDate) : null;
    const to = toDate ? new Date(toDate) : null;

    const data = bookings.filter((b) => {
      const d = new Date(b.createdAt);
      if (from && d < from) return false;
      if (to && d > to) return false;
      return true;
    });

    setFiltered(data);
  };

  const total = filtered.length;
  const pending = filtered.filter((b) => b.status === "pending").length;
  const approved = filtered.filter((b) => b.status === "approved").length;
  const rejected = filtered.filter((b) => b.status === "rejected").length;
  const booked = filtered.filter((b) => b.status === "booked").length;

  /* PIE DATA */
  const categoryPie = useMemo(() => {
    const grouped = filtered.reduce((acc, b) => {
      const cat = (b.category || "Unknown").trim();
      acc[cat] = (acc[cat] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(grouped).map(([name, value]) => ({
      name,
      value,
    }));
  }, [filtered]);

  const safeCategoryPie =
    categoryPie.length > 0 ? categoryPie : [{ name: "No Data", value: 1 }];

  /* BOOKED DATA (USING updatedAt AS PAYMENT TIME) */
  const bookedBar = useMemo(() => {
    const grouped = filtered
      .filter((b) => b.status === "booked")
      .reduce((acc, b) => {
        const cat = (b.category || "Unknown").trim();

        // updatedAt
        const date =
          b.updatedAt || b.createdAt
            ? new Date(b.updatedAt || b.createdAt).toLocaleDateString()
            : "N/A";

        if (!acc[cat]) {
          acc[cat] = {
            category: cat,
            count: 0,
            dates: [],
          };
        }

        acc[cat].count += 1;
        acc[cat].dates.push(date);

        return acc;
      }, {});

    return Object.values(grouped);
  }, [filtered]);

  if (loading) return <div className="stallreport-container">Loading...</div>;
  if (error) return <div className="stallreport-container">{error}</div>;

  return (
    <div className="stallreport-container">

      {/* HEADER */}
      <section className="admin-events-header glass-card-events">
        <div>
          <h1>Stall Booking Analytics Dashboard</h1>
        </div>

        <button
          className="admin-events-back-btn"
          onClick={() => navigate(-1)}
        >
          &#8617; Go Back
        </button>
      </section>

      {/* KPI CARDS */}
      <div className="stallreport-cards">
        <div className="report-card"><h4>Total</h4><p>{total}</p></div>
        <div className="report-card yellow"><h4>Pending</h4><p>{pending}</p></div>
        <div className="report-card blue"><h4>Approved</h4><p>{approved}</p></div>
        <div className="report-card red"><h4>Rejected</h4><p>{rejected}</p></div>
        <div className="report-card green"><h4>Booked</h4><p>{booked}</p></div>
      </div>

      {/* FILTERS */}
      <div className="stallreport-filters">
        <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
        <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
        <button onClick={applyFilter}>Filter</button>
      </div>

      {/* PIE CHART */}
      <div className="stallreport-chart-card">
        <h3>Stall Categories</h3>

        <ResponsiveContainer width="80%" height={300}>
          <PieChart>
            <Pie
              data={safeCategoryPie}
              dataKey="value"
              nameKey="name"
              outerRadius={100}
              label
            >
              {safeCategoryPie.map((entry, i) => (
                <Cell
                  key={i}
                  fill={CATEGORY_COLORS[entry.name] || "#9ca3af"}
                />
              ))}
            </Pie>

            <Tooltip content={<CustomTooltip />} cursor={false} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* BOOKED CHART */}
      <div className="stallreport-chart-card">
        <h3>Booked Stalls</h3>

        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={bookedBar}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="category" tick={renderCategoryTick} />

            <YAxis allowDecimals={false} />

            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload;

                  return (
                    <div className="custom-tooltip">
                      <p className="tooltip-value">
                        📅 Date: {data.dates.join(" | ")}
                      </p>
                      <p className="tooltip-value">
                        🔢 Count: {data.count}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
              cursor={false}
            />

            <Bar dataKey="count" fill="#22c55e" />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};

export default StallReport;