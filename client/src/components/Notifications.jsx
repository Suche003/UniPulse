import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/api';
import toast from 'react-hot-toast';
import './Notifications.css';

const Notifications = ({ onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await apiRequest('/api/notifications');
      setNotifications(data);
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await apiRequest(`/api/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiRequest('/api/notifications/read-all', { method: 'PATCH' });
      setNotifications(notifications.map(n => ({ ...n, read: true })));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="notifications-dropdown">
      <div className="notifications-header">
        <h3>Notifications</h3>
        {unreadCount > 0 && (
          <button className="btn-sm" onClick={markAllAsRead}>Mark all as read</button>
        )}
        <button className="close-btn" onClick={onClose}>×</button>
      </div>
      <div className="notifications-list">
        {loading ? (
          <p>Loading...</p>
        ) : notifications.length === 0 ? (
          <p className="no-notifications">No notifications</p>
        ) : (
          notifications.map(notif => (
            <div key={notif._id} className={`notification-item ${!notif.read ? 'unread' : ''}`} onClick={() => markAsRead(notif._id)}>
              <div className="notification-title">{notif.title}</div>
              <div className="notification-message">{notif.message}</div>
              <div className="notification-time">{new Date(notif.createdAt).toLocaleString()}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;