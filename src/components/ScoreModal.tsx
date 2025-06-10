import React, { useState } from 'react';
import { X, Trophy, Target } from 'lucide-react';
import { Match } from '../types';
import { UserService } from '../services/UserService';

interface ScoreModalProps {
  match: Match;
  onSubmit: (challengerScore: number, challengedScore: number) => void;
  onClose: () => void;
}

const ScoreModal: React.FC<ScoreModalProps> = ({ match, onSubmit, onClose }) => {
  const [challengerScore, setChallengerScore] = useState(0);
  const [challengedScore, setChallengedScore] = useState(0);

  const challenger = UserService.getPlayerById(match.challengerId);
  const challenged = UserService.getPlayerById(match.challengedId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(challengerScore, challengedScore);
  };

  if (!challenger || !challenged) return null;

  return (
    <div className="modal-backdrop fade-in">
      <div className="modal scale-in">
        <button onClick={onClose} className="modal-close">
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <Trophy size={48} className="mx-auto mb-4" style={{ color: 'var(--quantum-cyan)' }} />
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-standard)' }}>
            Report Match Score
          </h2>
          <p style={{ color: 'var(--text-subtle)' }}>
            Enter the final score for this match
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-3 gap-4 items-center mb-6">
            {/* Challenger */}
            <div className="text-center">
              <div className="player-avatar mx-auto mb-2">
                {challenger.name.split(' ').map(n => n[0]).join('')}
              </div>
              <p className="font-medium text-sm" style={{ color: 'var(--text-standard)' }}>
                {challenger.name}
              </p>
            </div>

            {/* VS */}
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: 'var(--text-muted)' }}>
                VS
              </div>
            </div>

            {/* Challenged */}
            <div className="text-center">
              <div className="player-avatar mx-auto mb-2">
                {challenged.name.split(' ').map(n => n[0]).join('')}
              </div>
              <p className="font-medium text-sm" style={{ color: 'var(--text-standard)' }}>
                {challenged.name}
              </p>
            </div>
          </div>

          {/* Score Inputs */}
          <div className="grid grid-cols-3 gap-4 items-center mb-6">
            <div>
              <input
                type="number"
                value={challengerScore}
                onChange={(e) => setChallengerScore(parseInt(e.target.value) || 0)}
                className="form-input text-center text-2xl font-bold"
                min="0"
                max="99"
                required
              />
            </div>
            <div className="text-center">
              <div className="text-xl font-bold" style={{ color: 'var(--text-muted)' }}>
                -
              </div>
            </div>
            <div>
              <input
                type="number"
                value={challengedScore}
                onChange={(e) => setChallengedScore(parseInt(e.target.value) || 0)}
                className="form-input text-center text-2xl font-bold"
                min="0"
                max="99"
                required
              />
            </div>
          </div>

          <div className="text-center mb-6">
            <p className="text-sm" style={{ color: 'var(--text-subtle)' }}>
              Enter the games/sets won by each player
            </p>
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
              className="btn btn-primary btn-glare flex-1"
            >
              <Target size={16} />
              Submit Score
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScoreModal;