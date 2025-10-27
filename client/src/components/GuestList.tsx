import React, { useState, useEffect, JSX } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { fetchGuests, deleteGuest } from '../features/guests/guestsSlice';
import EditGuestForm from './EditGuestForm';
import { Guest, InvitationStats } from '../types/types';

const GuestList: React.FC = () => {
  const dispatch = useAppDispatch();
  const { 
    data: guests, 
    loading, 
    error, 
    invitationStats 
  } = useAppSelector(state => state.guests);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);

  useEffect(() => {
    dispatch(fetchGuests());
  }, [dispatch]);

  const handleEdit = (guest: Guest): void => {
    setEditingGuest(guest);
  };

  const handleDelete = async (guestId: string): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this guest?')) {
      try {
        await dispatch(deleteGuest(guestId)).unwrap();
      } catch (error) {
        console.error('Failed to delete guest:', error);
      }
    }
  };

  const renderStatBox = (label: keyof InvitationStats, value: number): JSX.Element => (
    <div className="stat-box">
      <span className="stat-label">{label.charAt(0).toUpperCase() + label.slice(1)}</span>
      <span className="stat-value">{value}</span>
    </div>
  );

  if (loading) return <div>Loading guests...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="guest-list-container">
      {editingGuest && (
        <div className="modal">
          <EditGuestForm 
            guest={editingGuest} 
            onClose={() => setEditingGuest(null)} 
          />
        </div>
      )}

      <div className="stats-panel">
        <h3>Invitation Statistics</h3>
        <div className="stats-grid">
          {Object.entries(invitationStats).map(([key, value]) => (
            renderStatBox(key as keyof InvitationStats, value)
          ))}
        </div>
      </div>

      <div className="guest-grid">
        {guests.map((guest: Guest) => (
          <div key={guest.id} className="guest-card">
            <h3>{guest.name}</h3>
            <p>Phone: {guest.phoneNumber}</p>
            <p>Email: {guest.email}</p>
            <p className={`status status-${guest.status.toLowerCase()}`}>
              Status: {guest.status}
            </p>
            <div className="card-actions">
              <button 
                onClick={() => handleEdit(guest)}
                className="edit-button"
              >
                Edit
              </button>
              <button 
                onClick={() => handleDelete(guest.id)}
                className="delete-button"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GuestList;