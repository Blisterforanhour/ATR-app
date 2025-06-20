import React, { useState } from 'react';
import { X, Trophy, Target, Plus, Minus } from 'lucide-react';
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
    if (challengerScore === challengedScore) {
      alert('Scores cannot be tied. Please enter different scores.');
      return;
    }
    onSubmit(challengerScore, challengedScore);
  };

  const adjustScore = (player: 'challenger' | 'challenged', adjustment: number) => {
    if (player === 'challenger') {
      setChallengerScore(Math.max(0, Math.min(999, challengerScore + adjustment)));
    } else {
      setChallengedScore(Math.max(0, Math.min(999, challengedScore + adjustment)));
    }
  };

  const getWinnerStyle = () => {
    if (challengerScore === challengedScore) return {};
    return challengerScore > challengedScore 
      ? { challenger: { color: 'var(--quantum-cyan)' }, challenged: {} }
      : { challenger: {}, challenged: { color: 'var(--quantum-cyan)' } };
  };

  const winnerStyles = getWinnerStyle();

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
            Enter the final point score for this match
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Player Names */}
          <div className="grid grid-cols-3 gap-4 items-center mb-4">
            <div className="text-center">
              <div className="player-avatar mx-auto mb-2">
                {challenger.name.split(' ').map(n => n[0]).join('')}
              </div>
              <p className="font-medium text-sm" style={{ color: 'var(--text-standard)', ...winnerStyles.challenger }}>
                {challenger.name}
              </p>
            </div>

            <div className="text-center">
              <div className="text-lg font-bold" style={{ color: 'var(--text-muted)' }}>
                VS
              </div>
            </div>

            <div className="text-center">
              <div className="player-avatar mx-auto mb-2">
                {challenged.name.split(' ').map(n => n[0]).join('')}
              </div>
              <p className="font-medium text-sm" style={{ color: 'var(--text-standard)', ...winnerStyles.challenged }}>
                {challenged.name}
              </p>
            </div>
          </div>

          {/* Score Controls */}
          <div className="grid grid-cols-3 gap-4 items-center mb-6">
            {/* Challenger Score */}
            <div className="text-center">
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => adjustScore('challenger', 1)}
                  className="btn btn-ghost p-2 rounded-full hover:bg-opacity-20"
                  style={{ backgroundColor: 'var(--quantum-cyan)', color: 'white' }}
                >
                  <Plus size={16} />
                </button>
                
                <div className="relative">
                  <input
                    type="number"
                    value={challengerScore}
                    onChange={(e) => setChallengerScore(Math.max(0, Math.min(999, parseInt(e.target.value) || 0)))}
                    className="form-input text-center text-3xl font-bold w-20"
                    style={{ ...winnerStyles.challenger }}
                    min="0"
                    max="999"
                    required
                  />
                </div>
                
                <button
                  type="button"
                  onClick={() => adjustScore('challenger', -1)}
                  className="btn btn-ghost p-2 rounded-full hover:bg-opacity-20"
                  style={{ backgroundColor: 'var(--surface-subtle)', color: 'var(--text-muted)' }}
                  disabled={challengerScore === 0}
                >
                  <Minus size={16} />
                </button>
              </div>
            </div>

            {/* Separator */}
            <div className="text-center">
              <div className="text-2xl font-bold" style={{ color: 'var(--text-muted)' }}>
                -
              </div>
            </div>

            {/* Challenged Score */}
            <div className="text-center">
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => adjustScore('challenged', 1)}
                  className="btn btn-ghost p-2 rounded-full hover:bg-opacity-20"
                  style={{ backgroundColor: 'var(--quantum-cyan)', color: 'white' }}
                >
                  <Plus size={16} />
                </button>
                
                <div className="relative">
                  <input
                    type="number"
                    value={challengedScore}
                    onChange={(e) => setChallengedScore(Math.max(0, Math.min(999, parseInt(e.target.value) || 0)))}
                    className="form-input text-center text-3xl font-bold w-20"
                    style={{ ...winnerStyles.challenged }}
                    min="0"
                    max="999"
                    required
                  />
                </div>
                
                <button
                  type="button"
                  onClick={() => adjustScore('challenged', -1)}
                  className="btn btn-ghost p-2 rounded-full hover:bg-opacity-20"
                  style={{ backgroundColor: 'var(--surface-subtle)', color: 'var(--text-muted)' }}
                  disabled={challengedScore === 0}
                >
                  <Minus size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Quick Score Buttons */}
          <div className="mb-6">
            <p className="text-sm text-center mb-3" style={{ color: 'var(--text-subtle)' }}>
              Quick Add Points:
            </p>
            <div className="flex justify-center gap-2 mb-4">
              <button
                type="button"
                onClick={() => adjustScore('challenger', 5)}
                className="btn btn-ghost text-xs px-3 py-1"
                style={{ backgroundColor: 'var(--surface-subtle)' }}
              >
                +5 {challenger.name.split(' ')[0]}
              </button>
              <button
                type="button"
                onClick={() => adjustScore('challenger', 10)}
                className="btn btn-ghost text-xs px-3 py-1"
                style={{ backgroundColor: 'var(--surface-subtle)' }}
              >
                +10 {challenger.name.split(' ')[0]}
              </button>
              <button
                type="button"
                onClick={() => adjustScore('challenged', 5)}
                className="btn btn-ghost text-xs px-3 py-1"
                style={{ backgroundColor: 'var(--surface-subtle)' }}
              >
                +5 {challenged.name.split(' ')[0]}
              </button>
              <button
                type="button"
                onClick={() => adjustScore('challenged', 10)}
                className="btn btn-ghost text-xs px-3 py-1"
                style={{ backgroundColor: 'var(--surface-subtle)' }}
              >
                +10 {challenged.name.split(' ')[0]}
              </button>
            </div>
          </div>

          {/* Winner Indicator */}
          {challengerScore !== challengedScore && (
            <div className="text-center mb-4">
              <p className="text-sm font-medium" style={{ color: 'var(--quantum-cyan)' }}>
                🏆 {challengerScore > challengedScore ? challenger.name : challenged.name} Wins!
              </p>
            </div>
          )}

          {/* Tie Warning */}
          {challengerScore === challengedScore && challengerScore > 0 && (
            <div className="text-center mb-4">
              <p className="text-sm" style={{ color: 'var(--text-warning, #ff9800)' }}>
                ⚠️ Ties are not allowed. Please adjust the scores.
              </p>
            </div>
          )}

          <div className="text-center mb-6">
            <p className="text-xs" style={{ color: 'var(--text-subtle)' }}>
              Enter the total points scored by each player
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
              disabled={challengerScore === challengedScore}
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