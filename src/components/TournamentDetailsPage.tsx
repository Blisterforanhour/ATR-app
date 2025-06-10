import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  Users, 
  Trophy, 
  Clock, 
  Target,
  User,
  Award,
  CheckCircle,
  AlertTriangle,
  Play
} from 'lucide-react';
import { Tournament, TournamentParticipant, TournamentMatch } from '../types';
import { TournamentService } from '../services/TournamentService';
import { UserService } from '../services/UserService';
import { useAuth } from '../contexts/AuthContext';

interface TournamentDetailsPageProps {
  tournament: Tournament;
  onBack: () => void;
  onRegister?: () => void;
}

const TournamentDetailsPage: React.FC<TournamentDetailsPageProps> = ({ 
  tournament, 
  onBack, 
  onRegister 
}) => {
  const { user } = useAuth();
  const [participants, setParticipants] = useState<TournamentParticipant[]>([]);
  const [matches, setMatches] = useState<TournamentMatch[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'participants' | 'bracket'>('overview');

  useEffect(() => {
    loadTournamentData();
  }, [tournament.id]);

  const loadTournamentData = () => {
    const tournamentParticipants = TournamentService.getTournamentParticipants(tournament.id);
    const tournamentMatches = TournamentService.getTournamentMatches(tournament.id);
    
    setParticipants(tournamentParticipants);
    setMatches(tournamentMatches);
  };

  const organizer = UserService.getPlayerById(tournament.organizerId);
  const umpire = UserService.getPlayerById(tournament.umpireId);
  const isRegistered = TournamentService.isPlayerRegistered(tournament.id, user?.id || '');
  const isOrganizer = tournament.organizerId === user?.id;
  
  const registrationDeadline = new Date(tournament.registrationDeadline);
  const startDate = new Date(tournament.startDate);
  const endDate = new Date(tournament.endDate);
  
  const isRegistrationOpen = tournament.status === 'registration_open' && new Date() < registrationDeadline;
  const canRegister = isRegistrationOpen && !isRegistered && !isOrganizer && participants.length < tournament.maxParticipants;

  const getStatusColor = (status: Tournament['status']) => {
    switch (status) {
      case 'registration_open':
        return 'var(--success-green)';
      case 'registration_closed':
        return 'var(--warning-orange)';
      case 'in_progress':
        return 'var(--quantum-cyan)';
      case 'completed':
        return 'var(--text-muted)';
      default:
        return 'var(--text-muted)';
    }
  };

  const getStatusText = (status: Tournament['status']) => {
    switch (status) {
      case 'registration_open':
        return 'Registration Open';
      case 'registration_closed':
        return 'Registration Closed';
      case 'in_progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };

  const getFormatText = (format: Tournament['format']) => {
    switch (format) {
      case 'single_elimination':
        return 'Single Elimination';
      case 'double_elimination':
        return 'Double Elimination';
      case 'round_robin':
        return 'Round Robin';
      default:
        return format;
    }
  };

  const renderOverview = () => (
    <div className="tournament-details-overview">
      {/* Tournament Info */}
      <div className="tournament-info-grid">
        <div className="tournament-info-card">
          <div className="tournament-info-header">
            <Calendar size={20} />
            <span>Schedule</span>
          </div>
          <div className="tournament-info-content">
            <div className="tournament-info-item">
              <span className="tournament-info-label">Registration Deadline:</span>
              <span className="tournament-info-value">
                {registrationDeadline.toLocaleDateString()} at {registrationDeadline.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="tournament-info-item">
              <span className="tournament-info-label">Tournament Start:</span>
              <span className="tournament-info-value">
                {startDate.toLocaleDateString()} at {startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <div className="tournament-info-item">
              <span className="tournament-info-label">Tournament End:</span>
              <span className="tournament-info-value">
                {endDate.toLocaleDateString()} at {endDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          </div>
        </div>

        <div className="tournament-info-card">
          <div className="tournament-info-header">
            <Trophy size={20} />
            <span>Format & Rules</span>
          </div>
          <div className="tournament-info-content">
            <div className="tournament-info-item">
              <span className="tournament-info-label">Format:</span>
              <span className="tournament-info-value">{getFormatText(tournament.format)}</span>
            </div>
            <div className="tournament-info-item">
              <span className="tournament-info-label">Max Participants:</span>
              <span className="tournament-info-value">{tournament.maxParticipants} players</span>
            </div>
            <div className="tournament-info-item">
              <span className="tournament-info-label">Current Registration:</span>
              <span className="tournament-info-value">
                {participants.length}/{tournament.maxParticipants} players
              </span>
            </div>
          </div>
        </div>

        <div className="tournament-info-card">
          <div className="tournament-info-header">
            <MapPin size={20} />
            <span>Location & Officials</span>
          </div>
          <div className="tournament-info-content">
            <div className="tournament-info-item">
              <span className="tournament-info-label">Venue:</span>
              <span className="tournament-info-value">{tournament.location}</span>
            </div>
            <div className="tournament-info-item">
              <span className="tournament-info-label">Organizer:</span>
              <span className="tournament-info-value">{organizer?.name || 'Unknown'}</span>
            </div>
            <div className="tournament-info-item">
              <span className="tournament-info-label">Umpire:</span>
              <span className="tournament-info-value">{umpire?.name || 'TBD'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Registration Progress */}
      <div className="tournament-registration-progress">
        <div className="tournament-progress-header">
          <h3>Registration Progress</h3>
          <span className="tournament-progress-count">
            {participants.length}/{tournament.maxParticipants} players
          </span>
        </div>
        <div className="tournament-progress-bar">
          <div 
            className="tournament-progress-fill"
            style={{ 
              width: `${(participants.length / tournament.maxParticipants) * 100}%`,
              backgroundColor: participants.length === tournament.maxParticipants ? 'var(--success-green)' : 'var(--quantum-cyan)'
            }}
          />
        </div>
        <div className="tournament-progress-percentage">
          {Math.round((participants.length / tournament.maxParticipants) * 100)}% Full
        </div>
      </div>

      {/* Description */}
      <div className="tournament-description-card">
        <h3>About This Tournament</h3>
        <p>{tournament.description}</p>
      </div>

      {/* Registration Status */}
      {isRegistered && (
        <div className="tournament-registration-status registered">
          <div className="tournament-status-content">
            <CheckCircle size={20} />
            <div>
              <div className="tournament-status-title">You're Registered!</div>
              <div className="tournament-status-subtitle">
                You're all set for this tournament. Check back for bracket updates.
              </div>
            </div>
          </div>
        </div>
      )}

      {!isRegistered && !isOrganizer && (
        <div className={`tournament-registration-status ${canRegister ? 'can-register' : 'cannot-register'}`}>
          <div className="tournament-status-content">
            {canRegister ? <Target size={20} /> : <AlertTriangle size={20} />}
            <div>
              <div className="tournament-status-title">
                {canRegister ? 'Registration Open' : 'Registration Unavailable'}
              </div>
              <div className="tournament-status-subtitle">
                {canRegister 
                  ? 'Join this tournament and compete against other players!'
                  : participants.length >= tournament.maxParticipants 
                    ? 'Tournament is full'
                    : 'Registration has closed'
                }
              </div>
            </div>
          </div>
          {canRegister && onRegister && (
            <button onClick={onRegister} className="btn btn-primary btn-glare">
              <Target size={16} />
              Register Now
            </button>
          )}
        </div>
      )}
    </div>
  );

  const renderParticipants = () => (
    <div className="tournament-participants">
      <div className="tournament-participants-header">
        <h3>Registered Players ({participants.length})</h3>
        {tournament.status !== 'registration_open' && (
          <div className="tournament-seeding-note">
            Players are seeded by rating
          </div>
        )}
      </div>
      
      <div className="tournament-participants-grid">
        {participants.map((participant, index) => {
          const player = UserService.getPlayerById(participant.playerId);
          if (!player) return null;

          return (
            <div key={participant.id} className="tournament-participant-card">
              <div className="tournament-participant-info">
                <div className="tournament-participant-avatar">
                  {player.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="tournament-participant-details">
                  <div className="tournament-participant-name">{player.name}</div>
                  <div className="tournament-participant-skill">{player.skillLevel}</div>
                </div>
              </div>
              
              <div className="tournament-participant-stats">
                <div className="tournament-participant-rating">
                  <span className="tournament-participant-rating-value">{player.rating}</span>
                  <span className="tournament-participant-rating-label">Rating</span>
                </div>
                {participant.seed && (
                  <div className="tournament-participant-seed">
                    <span className="tournament-participant-seed-value">#{participant.seed}</span>
                    <span className="tournament-participant-seed-label">Seed</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {participants.length === 0 && (
        <div className="tournament-participants-empty">
          <Users size={48} />
          <h3>No Players Registered Yet</h3>
          <p>Be the first to register for this tournament!</p>
        </div>
      )}
    </div>
  );

  const renderBracket = () => (
    <div className="tournament-bracket">
      {matches.length > 0 ? (
        <div className="tournament-bracket-content">
          <div className="tournament-bracket-header">
            <h3>Tournament Bracket</h3>
            <div className="tournament-bracket-legend">
              <div className="tournament-bracket-legend-item">
                <div className="tournament-bracket-status completed"></div>
                <span>Completed</span>
              </div>
              <div className="tournament-bracket-legend-item">
                <div className="tournament-bracket-status in-progress"></div>
                <span>In Progress</span>
              </div>
              <div className="tournament-bracket-legend-item">
                <div className="tournament-bracket-status pending"></div>
                <span>Pending</span>
              </div>
            </div>
          </div>

          {/* Group matches by round */}
          {Array.from(new Set(matches.map(m => m.round))).sort().map(round => (
            <div key={round} className="tournament-bracket-round">
              <h4 className="tournament-bracket-round-title">
                {round === Math.max(...matches.map(m => m.round)) ? 'Final' :
                 round === Math.max(...matches.map(m => m.round)) - 1 ? 'Semi-Final' :
                 `Round ${round}`}
              </h4>
              
              <div className="tournament-bracket-matches">
                {matches
                  .filter(m => m.round === round)
                  .sort((a, b) => a.matchNumber - b.matchNumber)
                  .map(match => {
                    const player1 = match.player1Id ? UserService.getPlayerById(match.player1Id) : null;
                    const player2 = match.player2Id ? UserService.getPlayerById(match.player2Id) : null;
                    
                    return (
                      <div key={match.id} className={`tournament-bracket-match ${match.status}`}>
                        <div className="tournament-bracket-match-header">
                          <span className="tournament-bracket-match-number">
                            Match {match.matchNumber}
                          </span>
                          <div className={`tournament-bracket-match-status ${match.status}`}>
                            {match.status === 'completed' && <CheckCircle size={14} />}
                            {match.status === 'in_progress' && <Play size={14} />}
                            {match.status === 'pending' && <Clock size={14} />}
                          </div>
                        </div>
                        
                        <div className="tournament-bracket-match-players">
                          <div className={`tournament-bracket-player ${match.winnerId === match.player1Id ? 'winner' : ''}`}>
                            <span className="tournament-bracket-player-name">
                              {player1?.name || 'TBD'}
                            </span>
                            {match.score && match.winnerId === match.player1Id && (
                              <Award size={14} className="tournament-bracket-winner-icon" />
                            )}
                          </div>
                          
                          <div className="tournament-bracket-vs">vs</div>
                          
                          <div className={`tournament-bracket-player ${match.winnerId === match.player2Id ? 'winner' : ''}`}>
                            <span className="tournament-bracket-player-name">
                              {player2?.name || 'TBD'}
                            </span>
                            {match.score && match.winnerId === match.player2Id && (
                              <Award size={14} className="tournament-bracket-winner-icon" />
                            )}
                          </div>
                        </div>
                        
                        {match.score && (
                          <div className="tournament-bracket-match-score">
                            {match.score}
                          </div>
                        )}
                        
                        {match.scheduledDate && (
                          <div className="tournament-bracket-match-time">
                            {new Date(match.scheduledDate).toLocaleString()}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="tournament-bracket-empty">
          <Trophy size={48} />
          <h3>Bracket Not Generated Yet</h3>
          <p>
            {tournament.status === 'registration_open' 
              ? 'The tournament bracket will be generated after registration closes.'
              : 'Bracket generation is in progress.'
            }
          </p>
        </div>
      )}
    </div>
  );

  return (
    <div className="tournament-details-page">
      <div className="tournament-details-container">
        {/* Header */}
        <div className="tournament-details-header">
          <button onClick={onBack} className="tournament-details-back-btn">
            <ArrowLeft size={20} />
          </button>
          
          <div className="tournament-details-title-section">
            <h1 className="tournament-details-title">{tournament.name}</h1>
            <div 
              className="tournament-details-status"
              style={{ 
                backgroundColor: `${getStatusColor(tournament.status)}20`,
                color: getStatusColor(tournament.status)
              }}
            >
              {getStatusText(tournament.status)}
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="tournament-details-tabs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`tournament-details-tab ${activeTab === 'overview' ? 'active' : ''}`}
          >
            <Trophy size={16} />
            Overview
          </button>
          <button
            onClick={() => setActiveTab('participants')}
            className={`tournament-details-tab ${activeTab === 'participants' ? 'active' : ''}`}
          >
            <Users size={16} />
            Players ({participants.length})
          </button>
          <button
            onClick={() => setActiveTab('bracket')}
            className={`tournament-details-tab ${activeTab === 'bracket' ? 'active' : ''}`}
          >
            <Award size={16} />
            Bracket
          </button>
        </div>

        {/* Tab Content */}
        <div className="tournament-details-content">
          {activeTab === 'overview' && renderOverview()}
          {activeTab === 'participants' && renderParticipants()}
          {activeTab === 'bracket' && renderBracket()}
        </div>
      </div>
    </div>
  );
};

export default TournamentDetailsPage;