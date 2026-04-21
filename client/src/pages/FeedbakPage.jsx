import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import "./FeedbackPage.css";

const API = "http://localhost:5000";

export default function FeedbackPage() {
  const { id } = useParams(); // IMPORTANT: route must also use :id
  const navigate = useNavigate();

  const [event, setEvent] = useState(null);
  const [feedbacks, setFeedbacks] = useState([]);
  const [stats, setStats] = useState({
    averageRating: 0,
    totalFeedbacks: 0,
  });
  const [myFeedback, setMyFeedback] = useState(null);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const [editing, setEditing] = useState(false);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const token = localStorage.getItem("unipulse_token");
  const storedUser = localStorage.getItem("unipulse_user");
  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  useEffect(() => {
    if (id) {
      fetchData();
    } else {
      setLoading(false);
      setError("Invalid feedback page route");
    }
  }, [id]);

  async function fetchData() {
    try {
      setLoading(true);
      setError("");
      setMessage("");

      let eventData = null;
      let feedbackData = { feedbacks: [], stats: { averageRating: 0, totalFeedbacks: 0 } };
      let myFeedbackData = { feedback: null };

      try {
        const eventRes = await axios.get(`${API}/api/events/${id}`);
        eventData = eventRes.data;
      } catch (err) {
        console.error("Event fetch error:", err);
      }

      try {
        const feedbackRes = await axios.get(`${API}/api/feedback/event/${id}`);
        feedbackData = feedbackRes.data;
      } catch (err) {
        console.error("Feedback list fetch error:", err);
      }

      if (token) {
        try {
          const myFeedbackRes = await axios.get(`${API}/api/feedback/me/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });
          myFeedbackData = myFeedbackRes.data;
        } catch (err) {
          console.error("My feedback fetch error:", err);
        }
      }

      setEvent(eventData);
      setFeedbacks(feedbackData.feedbacks || []);
      setStats(
        feedbackData.stats || {
          averageRating: 0,
          totalFeedbacks: 0,
        }
      );

      const existingMyFeedback = myFeedbackData.feedback || null;
      setMyFeedback(existingMyFeedback);

      if (existingMyFeedback) {
        setRating(existingMyFeedback.rating);
        setComment(existingMyFeedback.comment);
      } else {
        setRating(5);
        setComment("");
      }

    } catch (err) {
      console.error(err);
      setError("Failed to load feedback page");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setMessage("");

      const res = await axios.post(
        `${API}/api/feedback/${id}`,
        {
          rating,
          comment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(res.data.message || "Feedback submitted successfully");
      setComment("");
      setRating(5);

      await fetchData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to submit feedback");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUpdate(e) {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");
      setMessage("");

      const res = await axios.put(
        `${API}/api/feedback/${id}`,
        {
          rating,
          comment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(res.data.message || "Feedback updated successfully");
      setEditing(false);

      await fetchData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to update feedback");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete() {
    const ok = window.confirm("Are you sure you want to delete your feedback?");
    if (!ok) return;

    try {
      setSubmitting(true);
      setError("");
      setMessage("");

      const res = await axios.delete(`${API}/api/feedback/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage(res.data.message || "Feedback deleted successfully");
      setMyFeedback(null);
      setEditing(false);
      setRating(5);
      setComment("");

      await fetchData();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Failed to delete feedback");
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit() {
    if (!myFeedback) return;
    setEditing(true);
    setRating(myFeedback.rating);
    setComment(myFeedback.comment);
    setError("");
    setMessage("");
  }

  function cancelEdit() {
    setEditing(false);
    if (myFeedback) {
      setRating(myFeedback.rating);
      setComment(myFeedback.comment);
    } else {
      setRating(5);
      setComment("");
    }
  }

  function isOwnFeedback(item) {
    const currentId =
      currentUser?._id || currentUser?.id || currentUser?.studentId;
    return String(item.studentId || item.student?._id) === String(currentId);
  }

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="feedback-page">
          <div className="feedback-shell">
            <div className="feedback-card">Loading feedback page...</div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="feedback-page">
        <div className="feedback-shell">
          <button
            className="feedback-back-btn"
            onClick={() => navigate(-1)}
          >
            ← Back
          </button>

          <div className="feedback-header-card">
            <h1>Event Feedback</h1>
            <p>Share your experience and help improve future events.</p>
          </div>

          {event && (
            <div className="feedback-event-card">
              <div className="feedback-event-image-wrap">
                {event.image ? (
                  <img
                    src={event.image}
                    alt={event.title}
                    className="feedback-event-image"
                  />
                ) : (
                  <div className="feedback-image-placeholder">
                    UniPulse
                  </div>
                )}
              </div>

              <div className="feedback-event-content">
                <h2>{event.title}</h2>
                <p>
                  <strong>Date:</strong>{" "}
                  {event.date
                    ? new Date(event.date).toLocaleDateString()
                    : "N/A"}
                </p>

                <div className="feedback-stats-row">
                  <div className="feedback-stat-box">
                    <span>Average Rating</span>
                    <h3>
                      {Number(stats.averageRating || 0).toFixed(1)} / 5
                    </h3>
                  </div>

                  <div className="feedback-stat-box">
                    <span>Total Reviews</span>
                    <h3>{stats.totalFeedbacks || 0}</h3>
                  </div>
                </div>
              </div>
            </div>
          )}

          {message && <div className="feedback-success">{message}</div>}
          {error && <div className="feedback-error">{error}</div>}

          <div className="feedback-grid">
            <div className="feedback-form-card">
              {!myFeedback && (
                <>
                  <h3>Leave Your Feedback</h3>

                  <form onSubmit={handleSubmit} className="feedback-form">
                    <label>Rating</label>
                    <select
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                    >
                      <option value={5}>5 - Excellent</option>
                      <option value={4}>4 - Very Good</option>
                      <option value={3}>3 - Good</option>
                      <option value={2}>2 - Fair</option>
                      <option value={1}>1 - Poor</option>
                    </select>

                    <label>Comment</label>
                    <textarea
                      rows="6"
                      placeholder="Write your feedback here..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required
                      maxLength={500}
                    />

                    <button type="submit" disabled={submitting}>
                      {submitting ? "Submitting..." : "Submit Feedback"}
                    </button>
                  </form>
                </>
              )}

              {myFeedback && !editing && (
                <>
                  <div className="my-feedback-head">
                    <h3>My Submitted Feedback</h3>
                    <span className="my-feedback-badge">Submitted</span>
                  </div>

                  <div className="my-feedback-box">
                    <div className="my-feedback-rating">
                      Rating: <strong>{myFeedback.rating} / 5</strong>
                    </div>
                    <p className="my-feedback-comment">{myFeedback.comment}</p>
                    <small>
                      Submitted on{" "}
                      {new Date(myFeedback.createdAt).toLocaleDateString()}
                    </small>

                    <div className="my-feedback-actions">
                      <button
                        type="button"
                        className="edit-btn"
                        onClick={startEdit}
                      >
                        Edit Feedback
                      </button>

                      <button
                        type="button"
                        className="delete-btn"
                        onClick={handleDelete}
                        disabled={submitting}
                      >
                        {submitting ? "Deleting..." : "Delete Feedback"}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {myFeedback && editing && (
                <>
                  <h3>Edit Your Feedback</h3>

                  <form onSubmit={handleUpdate} className="feedback-form">
                    <label>Rating</label>
                    <select
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                    >
                      <option value={5}>5 - Excellent</option>
                      <option value={4}>4 - Very Good</option>
                      <option value={3}>3 - Good</option>
                      <option value={2}>2 - Fair</option>
                      <option value={1}>1 - Poor</option>
                    </select>

                    <label>Comment</label>
                    <textarea
                      rows="6"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      required
                      maxLength={500}
                    />

                    <div className="my-feedback-actions">
                      <button type="submit" disabled={submitting}>
                        {submitting ? "Updating..." : "Update Feedback"}
                      </button>

                      <button
                        type="button"
                        className="cancel-btn"
                        onClick={cancelEdit}
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>

            <div className="feedback-list-card">
              <h3>Student Reviews</h3>

              {feedbacks.length === 0 ? (
                <div className="feedback-empty">
                  No feedback yet for this event.
                </div>
              ) : (
                <div className="feedback-list">
                  {feedbacks.map((item) => (
                    <div
                      key={item._id}
                      className={`feedback-item ${
                        isOwnFeedback(item) ? "my-feedback-highlight" : ""
                      }`}
                    >
                      <div className="feedback-item-top">
                        <h4>{item.studentName || item.student?.name || "Student"}</h4>
                        <span>{item.rating} / 5</span>
                      </div>

                      <p>{item.comment}</p>

                      <small>
                        {new Date(item.createdAt).toLocaleDateString()}
                      </small>

                      {isOwnFeedback(item) && (
                        <div className="my-feedback-tag">Your Feedback</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}