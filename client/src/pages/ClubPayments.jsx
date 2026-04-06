import React, { useState, useEffect } from 'react';
import { apiRequest } from '../api/api';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import toast from 'react-hot-toast';
import './ClubPayments.css';

const ClubPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      const data = await apiRequest('/api/payments/my-club-payments');
      setPayments(data);
    } catch (err) {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  const viewReceipt = (paymentId) => {
    window.open(`/api/payments/receipt/${paymentId}`, '_blank');
  };

  if (loading) return <LoadingSpinner size="lg" message="Loading payments..." />;

  return (
    <div className="club-payments">
      <h1>💰 Received Sponsorship Payments</h1>
      {payments.length === 0 ? (
        <div className="empty-state">
          <p>No payments received yet.</p>
        </div>
      ) : (
        <div className="payments-table-wrapper">
          <table className="payments-table">
            <thead>
              <tr>
                <th>Event</th>
                <th>Sponsor</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Transaction ID</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {payments.map(p => (
                <tr key={p._id}>
                  <td>{p.event?.title}</td>
                  <td>
                    <strong>{p.sponsor?.name}</strong><br />
                    <small>{p.sponsor?.contactEmail}</small>
                  </td>
                  <td>${p.amount}</td>
                  <td>{new Date(p.paidAt).toLocaleDateString()}</td>
                  <td>{p.transactionId || '—'}</td>
                  <td>
                    <button className="btn-sm" onClick={() => viewReceipt(p._id)}>
                      View Receipt
                    </button>
                   </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ClubPayments;