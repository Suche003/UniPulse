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
  const previousLastMessageId = useRef(null);
  const notificationShownRef = useRef(false);

  const fetchMessages = async () => {
    try {
      const data = await apiRequest(`/api/messages/${requestId}`);
      // Sort oldest first (ascending)
      const sorted = [...data].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      
      // Check for new messages (not from current user)
      if (previousLastMessageId.current && previousLastMessageId.current !== sorted[sorted.length-1]?._id) {
        const lastMessage = sorted[sorted.length-1];
        // If last message is not from current user
        const isOwn = (userRole === 'club' && lastMessage?.senderModel === 'Club') ||
                      (userRole === 'sponsor' && lastMessage?.senderModel === 'Sponsor');
        if (!isOwn && !notificationShownRef.current) {
          toast.success(`💬 New message from ${lastMessage?.senderModel === 'Club' ? 'Club' : 'Sponsor'}`, {
            duration: 4000,
            icon: '💬',
          });
          notificationShownRef.current = true;
          setTimeout(() => { notificationShownRef.current = false; }, 2000);
        }
      }
      
      previousLastMessageId.current = sorted[sorted.length-1]?._id;
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
      // Reset notification flag after sending (so you don't get notified of your own message)
      notificationShownRef.current = false;
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

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