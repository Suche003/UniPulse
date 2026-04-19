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
      console.log('✅ Notifications loaded:', data);
      setNotifications(data);
    } catch (err) {
      console.error('❌ Failed to load notifications:', err);
      toast.error('Could not load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await apiRequest(`/api/notifications/${id}/read`, { method: 'PATCH' });
      setNotifications(notifications.map(n => n._id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error('Failed to mark as read:', err);
      toast.error(err.message);
    }
  };

  const markAllAsRead = async () => {
    try {
      await apiRequest('/api/notifications/read-all', { method: 'PATCH' });
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch (err) {
      console.error('Failed to mark all as read:', err);
      toast.error(err.message);
    }
  };

  const getIconForType = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return '🔔';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="notifications-dropdown">
      <div className="notifications-header">
        <h3>Notifications</h3>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {unreadCount > 0 && (
            <button className="mark-all-btn" onClick={markAllAsRead}>
              Mark all read
            </button>
          )}
          <button className="close-btn" onClick={onClose}>×</button>
        </div>
      </div>
      <div className="notifications-list">
        {loading ? (
          <div className="no-notifications">Loading...</div>
        ) : notifications.length === 0 ? (
          <div className="no-notifications">No notifications</div>
        ) : (
          notifications.map(notif => (
            <div 
              key={notif._id} 
              className={`notification-item ${!notif.read ? 'unread' : ''}`}
              data-type={notif.type}
              onClick={() => markAsRead(notif._id)}
            >
              <div className="notification-icon">{getIconForType(notif.type)}</div>
              <div className="notification-content">
                <div className="notification-title">{notif.title}</div>
                <div className="notification-message">{notif.message}</div>
                <div className="notification-time">
                  {new Date(notif.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;