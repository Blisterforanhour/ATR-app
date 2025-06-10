import React, { useState } from 'react';
import { X, Calendar, MapPin, Zap } from 'lucide-react';
import { User } from '../types';

interface MatchModalProps {
  player: User;
  onSubmit: (date: string, location: string) => void;
  onClose: () => void;
}

const MatchModal: React.FC<MatchModalProps> = ({ player, onSubmit, onClose }) => {
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (date && location) {
      onSubmit(date, location);
    }
  };

  // Generate default date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().slice(0, 16);

  return (
    <div className="modal-backdrop fade-in">
      <div className="modal scale-in">
        <button onClick={onClose} className="modal-close">
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <div className="player-avatar mx-auto mb-4">
            {player.name.split(' ').map(n => n[0]).join('')}
          </div>
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-standard)' }}>
            Create Match with {player.name}
          </h2>
          <p style={{ color: 'var(--text-subtle)' }}>
            Set up your match details
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="date" className="form-label">
              <Calendar size={16} className="inline mr-2" />
              Date & Time
            </label>
            <input
              type="datetime-local"
              id="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="form-input"
              min={defaultDate}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="location" className="form-label">
              <MapPin size={16} className="inline mr-2" />
              Location
            </label>
            <input
              type="text"
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="form-input"
              placeholder="Tennis court or club name"
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!date || !location}
              className="btn btn-primary btn-glare flex-1"
            >
              <Zap size={16} />
              Create Match
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MatchModal;