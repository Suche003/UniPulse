import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../api/api';
import toast from 'react-hot-toast';
import './Chat.css';

const Chat = ({ requestId, userRole }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const previousMessagesLength = useRef(0);

  const fetchMessages = async () => {
    try {
      const data = await apiRequest(`/api/messages/${requestId}`);
      // Sort oldest first (ascending)
      const sorted = [...data].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      setMessages(sorted);
    } catch (err) {
      toast.error('Failed to load messages');
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [requestId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    if (messages.length !== previousMessagesLength.current && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    previousMessagesLength.current = messages.length;
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setLoading(true);
    try {
      await apiRequest('/api/messages', {
        method: 'POST',
        body: { requestId, content: newMessage }
      });
      setNewMessage('');
      await fetchMessages();
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  // Determine if a message is from the current logged-in user
  const isOwnMessage = (msg) => {
    if (userRole === 'club' && msg.senderModel === 'Club') return true;
    if (userRole === 'sponsor' && msg.senderModel === 'Sponsor') return true;
    return false;
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.map((msg, idx) => {
          const own = isOwnMessage(msg);
          // Display sender name as "You" for own messages, otherwise "Sponsor" or "Club"
          const senderName = own ? 'You' : (msg.senderModel === 'Sponsor' ? 'Sponsor' : 'Club');
          return (
            <div key={idx} className={`chat-message ${own ? 'own' : 'other'}`}>
              <strong>{senderName}:</strong>
              <p>{msg.content}</p>
              <small>{new Date(msg.createdAt).toLocaleString()}</small>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={sendMessage} className="chat-input-form">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={loading}
        />
        <button type="submit" disabled={loading}>Send</button>
      </form>
    </div>
  );
};

export default Chat;