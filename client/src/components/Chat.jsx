import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../api/api';
import toast from 'react-hot-toast';
import './Chat.css';

const Chat = ({ requestId, userRole }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesContainerRef = useRef(null);
  const previousMessagesLength = useRef(0);

  const fetchMessages = async () => {
    try {
      const data = await apiRequest(`/api/messages/${requestId}`);
      setMessages(data);
    } catch (err) {
      toast.error('Failed to load messages');
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [requestId]);

  // Scroll to top when new messages arrive (since newest at top)
  useEffect(() => {
    if (messages.length !== previousMessagesLength.current && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = 0;
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
      await fetchMessages(); // refresh to get the new message at the top
    } catch (err) {
      toast.error('Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages" ref={messagesContainerRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-message ${msg.senderModel.toLowerCase()}`}>
            <strong>{msg.senderModel === 'Sponsor' ? 'Sponsor' : 'Club'}:</strong>
            <p>{msg.content}</p>
            <small>{new Date(msg.createdAt).toLocaleString()}</small>
          </div>
        ))}
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