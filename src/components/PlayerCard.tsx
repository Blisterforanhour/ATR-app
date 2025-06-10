import React from 'react';
import { Zap, Trophy, Target } from 'lucide-react';
import { User } from '../types';
import MatchModal from './MatchModal';
import { useState } from 'react';

interface PlayerCardProps {
  player: User;
  onCreateMatch?: () => void;
  className?: string;
}

const PlayerCard: React.FC<PlayerCardProps> = ({ player, onCreateMatch, className = '' }) => {
  const [showMatchModal, setShowMatchModal] = useState(false);

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const getRatingClass = (skillLevel: string) => {
    switch (skillLevel.toLowerCase()) {
      case 'beginner':
        return 'rating-beginner';
      case 'intermediate':
        return 'rating-intermediate';
      case 'advanced':
        return 'rating-advanced';
      default:
        return 'rating-beginner';
    }
  };

  const winRate = player.matchesPlayed > 0 ? (player.matchesWon / player.matchesPlayed * 100).toFixed(0) : '0';

  const handleCreateMatch = () => {
    if (onCreateMatch) {
      onCreateMatch();
    } else {
      setShowMatchModal(true);
    }
  };

  const handleMatchCreated = () => {
    setShowMatchModal(false);
    // Could trigger a refresh or callback here if needed
  };

  return (
    <>
      <div className={`card player-card slide-in-up ${className}`}>
        <div className="player-info">
          <div className="player-avatar">
            {getInitials(player.name)}
          </div>
          <div className="player-details">
            <h3 className="text-lg font-semibold">{player.name}</h3>
            <div className={`rating-badge ${getRatingClass(player.skillLevel)}`}>
              <Trophy size={12} />
              {player.skillLevel}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="font-bold text-lg" style={{ color: 'var(--quantum-cyan)' }}>
              {player.rating}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Rating
            </div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg" style={{ color: 'var(--text-standard)' }}>
              {player.matchesPlayed}
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Matches
            </div>
          </div>
          <div className="text-center">
            <div className="font-bold text-lg" style={{ color: 'var(--success-green)' }}>
              {winRate}%
            </div>
            <div className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Win Rate
            </div>
          </div>
        </div>

        <button
          onClick={handleCreateMatch}
          className="btn btn-primary btn-glare w-full"
        >
          <Target size={16} />
          <span>Create Match</span>
          <Zap size={16} />
        </button>
      </div>

      {/* Match Modal */}
      {showMatchModal && (
        <MatchModal
          isOpen={showMatchModal}
          onClose={() => setShowMatchModal(false)}
          onMatchCreated={handleMatchCreated}
          preselectedPlayer={player}
          mode="challenge"
        />
      )}
    </>
  );
};

export default PlayerCard;