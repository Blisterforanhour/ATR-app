import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  Clock, 
  Trophy, 
  Users,
  AlertTriangle,
  ArrowLeft,
  Plus,
  Minus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { TournamentService } from '../services/TournamentService';
import { Tournament, TournamentMatch } from '../types';
import { UserService } from '../services/UserService';

interface MatchScore {
  player1Sets: number[];
  player2Sets: number[];
  player1Games: number;
  player2Games: number;
  player1Points: number;
  player2Points: number;
  currentSet: number;
  isDeuce: boolean;
  advantage: 'player1' | 'player2' | null;
  servingPlayer: 'player1' | 'player2';
}

interface MatchScoreHistory {
  score: MatchScore;
  timestamp: number;
  action: string;
}

const UmpirePage: React.FC = () => {
  const { user } = useAuth();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [matches, setMatches] = useState<TournamentMatch[]>([]);
  const [activeMatch, setActiveMatch] = useState<TournamentMatch | null>(null);
  const [matchScore, setMatchScore] = useState<MatchScore | null>(null);
  const [scoreHistory, setScoreHistory] = useState<MatchScoreHistory[]>([]);
  const [canUndo, setCanUndo] = useState(false);
  const [showStartConfirmation, setShowStartConfirmation] = useState(false);
  const [showEndMatchConfirmation, setShowEndMatchConfirmation] = useState(false);
  const [tournamentToStart, setTournamentToStart] = useState<Tournament | null>(null);

  useEffect(() => {
    loadTournaments();
  }, [user]);

  useEffect(() => {
    if (selectedTournament) {
      loadMatches();
    }
  }, [selectedTournament]);

  const loadTournaments = () => {
    if (!user) return;

    const allTournaments = TournamentService.getAllTournaments();
    
    // Filter tournaments based on user involvement
    const userRelevantTournaments = allTournaments.filter(tournament => {
      // Show tournaments where user is the organizer
      if (tournament.organizerId === user.id) {
        return true;
      }
      
      // Show tournaments where user is the assigned umpire
      if (tournament.umpireId === user.id) {
        return true;
      }
      
      // Show tournaments where user is registered as a participant
      const isParticipant = TournamentService.isPlayerRegistered(tournament.id, user.id);
      if (isParticipant) {
        return true;
      }
      
      return false;
    });

    // Filter to only show tournaments that are ready to start or in progress
    const activeTournaments = userRelevantTournaments.filter(t => 
      t.status === 'registration_closed' || t.status === 'in_progress'
    );
    
    setTournaments(activeTournaments);
  };

  const loadMatches = () => {
    if (selectedTournament) {
      const tournamentMatches = TournamentService.getTournamentMatches(selectedTournament.id);
      setMatches(tournamentMatches);
    }
  };

  const initializeMatchScore = (): MatchScore => {
    return {
      player1Sets: [],
      player2Sets: [],
      player1Games: 0,
      player2Games: 0,
      player1Points: 0,
      player2Points: 0,
      currentSet: 1,
      isDeuce: false,
      advantage: null,
      servingPlayer: 'player1'
    };
  };

  const saveScoreToHistory = (score: MatchScore, action: string) => {
    const historyEntry: MatchScoreHistory = {
      score: JSON.parse(JSON.stringify(score)), // Deep clone
      timestamp: Date.now(),
      action
    };
    
    setScoreHistory(prev => {
      const newHistory = [...prev, historyEntry];
      // Keep only last 50 actions to prevent memory issues
      return newHistory.slice(-50);
    });
    setCanUndo(true);
  };

  const getPointDisplay = (points: number, isDeuce: boolean, advantage: 'player1' | 'player2' | null, player: 'player1' | 'player2') => {
    if (isDeuce) {
      if (advantage === player) return 'AD';
      if (advantage && advantage !== player) return '40';
      return '40';
    }
    
    switch (points) {
      case 0: return '0';
      case 1: return '15';
      case 2: return '30';
      case 3: return '40';
      default: return '40';
    }
  };

  const handleStartTournamentClick = (tournament: Tournament) => {
    setTournamentToStart(tournament);
    setShowStartConfirmation(true);
  };

  const handleStartTournament = () => {
    if (tournamentToStart) {
      console.log('Starting tournament:', tournamentToStart.name);
      
      // Generate the bracket (this will also update the tournament status to 'in_progress')
      const bracketGenerated = TournamentService.generateBracket(tournamentToStart.id);
      if (bracketGenerated) {
        console.log('Tournament started and bracket generated successfully');
        
        // Update the selected tournament if it's the one we just started
        if (selectedTournament?.id === tournamentToStart.id) {
          const updatedTournament = TournamentService.getTournamentById(tournamentToStart.id);
          if (updatedTournament) {
            setSelectedTournament(updatedTournament);
          }
        }
        
        // Reload tournaments and matches
        loadTournaments();
        loadMatches();
      } else {
        console.error('Failed to generate bracket');
        alert('Failed to generate tournament bracket. Please ensure there are enough participants.');
      }
      
      setShowStartConfirmation(false);
      setTournamentToStart(null);
    }
  };

  const handleStartMatch = (match: TournamentMatch) => {
    setActiveMatch(match);
    const initialScore = initializeMatchScore();
    setMatchScore(initialScore);
    setScoreHistory([]);
    setCanUndo(false);
  };

  const handleBackToMatches = () => {
    setActiveMatch(null);
    setMatchScore(null);
    setScoreHistory([]);
    setCanUndo(false);
  };

  const awardPoint = (player: 'player1' | 'player2') => {
    if (!matchScore) return;

    // Save current state before making changes
    saveScoreToHistory(matchScore, `Point awarded to ${player}`);

    const newScore = { ...matchScore };
    const opponent = player === 'player1' ? 'player2' : 'player1';

    // Award point
    if (player === 'player1') {
      newScore.player1Points++;
    } else {
      newScore.player2Points++;
    }

    // Check for game win
    const playerPoints = player === 'player1' ? newScore.player1Points : newScore.player2Points;
    const opponentPoints = player === 'player1' ? newScore.player2Points : newScore.player1Points;

    // Game logic
    if (playerPoints >= 4 && playerPoints - opponentPoints >= 2) {
      // Player wins the game
      if (player === 'player1') {
        newScore.player1Games++;
      } else {
        newScore.player2Games++;
      }
      
      // Reset points
      newScore.player1Points = 0;
      newScore.player2Points = 0;
      newScore.isDeuce = false;
      newScore.advantage = null;
      
      // Switch serve
      newScore.servingPlayer = newScore.servingPlayer === 'player1' ? 'player2' : 'player1';

      // Check for set win (6 games with 2 game lead, or 7-6)
      const playerGames = player === 'player1' ? newScore.player1Games : newScore.player2Games;
      const opponentGames = player === 'player1' ? newScore.player2Games : newScore.player1Games;

      if ((playerGames >= 6 && playerGames - opponentGames >= 2) || playerGames === 7) {
        // Player wins the set
        if (player === 'player1') {
          newScore.player1Sets.push(newScore.player1Games);
          newScore.player2Sets.push(newScore.player2Games);
        } else {
          newScore.player1Sets.push(newScore.player1Games);
          newScore.player2Sets.push(newScore.player2Games);
        }
        
        // Reset games for next set
        newScore.player1Games = 0;
        newScore.player2Games = 0;
        newScore.currentSet++;
      }
    } else if (playerPoints >= 3 && opponentPoints >= 3) {
      // Deuce situation
      if (playerPoints === opponentPoints) {
        newScore.isDeuce = true;
        newScore.advantage = null;
      } else if (playerPoints - opponentPoints === 1) {
        newScore.isDeuce = true;
        newScore.advantage = player;
      }
    }

    setMatchScore(newScore);
  };

  const undoLastPoint = () => {
    if (scoreHistory.length === 0) return;

    const lastEntry = scoreHistory[scoreHistory.length - 1];
    setMatchScore(lastEntry.score);
    
    setScoreHistory(prev => prev.slice(0, -1));
    setCanUndo(scoreHistory.length > 1);
    
    // Show confirmation message
    console.log(`Undid: ${lastEntry.action}`);
  };

  const handleEndMatch = () => {
    if (activeMatch && matchScore) {
      // Determine winner based on sets won
      const player1SetsWon = matchScore.player1Sets.filter((games, index) => 
        games > matchScore.player2Sets[index]
      ).length;
      const player2SetsWon = matchScore.player2Sets.filter((games, index) => 
        games > matchScore.player1Sets[index]
      ).length;

      const winnerId = player1SetsWon > player2SetsWon ? activeMatch.player1Id : activeMatch.player2Id;
      const score = `${matchScore.player1Sets.join('-')} vs ${matchScore.player2Sets.join('-')}`;

      if (winnerId) {
        TournamentService.reportMatchResult(activeMatch.id, winnerId, score);
        loadMatches();
        setActiveMatch(null);
        setMatchScore(null);
        setScoreHistory([]);
        setCanUndo(false);
        setShowEndMatchConfirmation(false);
      }
    }
  };

  const getMatchStatus = (match: TournamentMatch) => {
    if (match.status === 'completed') return 'Completed';
    if (match.status === 'in_progress') return 'In Progress';
    if (!match.player1Id || !match.player2Id) return 'Waiting for Players';
    return 'Ready to Start';
  };

  const getStatusColor = (match: TournamentMatch) => {
    if (match.status === 'completed') return 'var(--success-green)';
    if (match.status === 'in_progress') return 'var(--quantum-cyan)';
    if (!match.player1Id || !match.player2Id) return 'var(--warning-orange)';
    return 'var(--text-muted)';
  };

  const getUserRole = (tournament: Tournament) => {
    if (!user) return '';
    
    if (tournament.organizerId === user.id) return 'Organizer';
    if (tournament.umpireId === user.id) return 'Umpire';
    if (TournamentService.isPlayerRegistered(tournament.id, user.id)) return 'Participant';
    return '';
  };

  // Main Dashboard View
  if (!activeMatch) {
    return (
      <div className="umpire-page">
        <div className="umpire-container">
          <div className="umpire-header">
            <h1 className="umpire-title">
              <Trophy size={32} />
              Live Scoring Dashboard
            </h1>
            <p className="umpire-subtitle">
              Manage live tournament matches and scoring for your tournaments
            </p>
          </div>

          {tournaments.length === 0 ? (
            <div className="umpire-empty-state">
              <div className="umpire-empty-content">
                <Trophy size={64} className="umpire-empty-icon" />
                <h3 className="umpire-empty-title">
                  No Active Tournaments
                </h3>
                <p className="umpire-empty-description">
                  You don't have any tournaments ready for live scoring. You can only see tournaments where you are:
                </p>
                <ul className="umpire-empty-list">
                  <li>• The tournament organizer</li>
                  <li>• The assigned umpire</li>
                  <li>• A registered participant</li>
                </ul>
                <p className="umpire-empty-note">
                  Tournaments must have closed registration to appear here.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Tournament Selection */}
              <div className="umpire-tournament-section">
                <h2 className="umpire-section-title">Your Tournaments</h2>
                <div className="umpire-tournament-grid">
                  {tournaments.map(tournament => {
                    const userRole = getUserRole(tournament);
                    return (
                      <div
                        key={tournament.id}
                        className={`umpire-tournament-card ${selectedTournament?.id === tournament.id ? 'selected' : ''}`}
                        onClick={() => setSelectedTournament(tournament)}
                      >
                        <div className="umpire-tournament-header">
                          <h3 className="umpire-tournament-name">{tournament.name}</h3>
                          <div 
                            className="umpire-tournament-status"
                            style={{ 
                              backgroundColor: tournament.status === 'in_progress' ? 'rgba(0, 212, 255, 0.2)' : 'rgba(255, 149, 0, 0.2)',
                              color: tournament.status === 'in_progress' ? 'var(--quantum-cyan)' : 'var(--warning-orange)'
                            }}
                          >
                            {tournament.status === 'in_progress' ? 'Live' : 'Ready to Start'}
                          </div>
                        </div>
                        
                        <p className="umpire-tournament-location">{tournament.location}</p>
                        
                        <div className="umpire-tournament-role">
                          <span className="role-badge" style={{
                            backgroundColor: userRole === 'Organizer' ? 'rgba(0, 255, 170, 0.2)' : 
                                           userRole === 'Umpire' ? 'rgba(0, 212, 255, 0.2)' : 
                                           'rgba(255, 149, 0, 0.2)',
                            color: userRole === 'Organizer' ? 'var(--success-green)' : 
                                   userRole === 'Umpire' ? 'var(--quantum-cyan)' : 
                                   'var(--warning-orange)'
                          }}>
                            Your Role: {userRole}
                          </span>
                        </div>
                        
                        {tournament.status === 'registration_closed' && (tournament.organizerId === user?.id || tournament.umpireId === user?.id) && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleStartTournamentClick(tournament);
                            }}
                            className="umpire-start-tournament-btn"
                          >
                            <Play size={16} />
                            Start Tournament
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Matches List */}
              {selectedTournament && (
                <div className="umpire-matches-section">
                  <h2 className="umpire-section-title">
                    <Users size={24} />
                    Tournament Matches
                  </h2>
                  
                  <div className="umpire-matches-grid">
                    {matches.map(match => {
                      const player1 = match.player1Id ? UserService.getPlayerById(match.player1Id) : null;
                      const player2 = match.player2Id ? UserService.getPlayerById(match.player2Id) : null;
                      
                      return (
                        <div key={match.id} className="umpire-match-card">
                          <div className="umpire-match-header">
                            <div className="umpire-match-round">
                              Round {match.round} - Match {match.matchNumber}
                            </div>
                            <div 
                              className="umpire-match-status"
                              style={{ color: getStatusColor(match) }}
                            >
                              {getMatchStatus(match)}
                            </div>
                          </div>
                          
                          <div className="umpire-match-players">
                            <div className="umpire-match-player">
                              {player1 ? player1.name : 'TBD'}
                            </div>
                            <div className="umpire-match-vs">vs</div>
                            <div className="umpire-match-player">
                              {player2 ? player2.name : 'TBD'}
                            </div>
                          </div>

                          {match.score && (
                            <div className="umpire-match-score">
                              Final Score: {match.score}
                            </div>
                          )}

                          {match.status === 'pending' && player1 && player2 && (selectedTournament.umpireId === user?.id || selectedTournament.organizerId === user?.id) && (
                            <button
                              onClick={() => handleStartMatch(match)}
                              className="umpire-match-btn"
                            >
                              <Play size={16} />
                              Umpire Match
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Start Tournament Confirmation Modal */}
          {showStartConfirmation && tournamentToStart && (
            <div className="modal-backdrop fade-in">
              <div className="modal scale-in">
                <div className="text-center mb-6">
                  <AlertTriangle size={48} className="mx-auto mb-4" style={{ color: 'var(--warning-orange)' }} />
                  <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-standard)' }}>
                    Start Tournament
                  </h2>
                  <p style={{ color: 'var(--text-subtle)' }}>
                    This will lock the tournament schedule and begin live scoring. This action cannot be undone.
                  </p>
                  <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <p className="text-sm font-medium" style={{ color: 'var(--warning-orange)' }}>
                      Tournament: {tournamentToStart.name}
                    </p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowStartConfirmation(false);
                      setTournamentToStart(null);
                    }}
                    className="btn btn-ghost flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleStartTournament}
                    className="btn btn-primary btn-glare flex-1"
                  >
                    <Play size={16} />
                    Start Tournament
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Live Scoring Interface
  const player1 = activeMatch.player1Id ? UserService.getPlayerById(activeMatch.player1Id) : null;
  const player2 = activeMatch.player2Id ? UserService.getPlayerById(activeMatch.player2Id) : null;

  if (!player1 || !player2 || !matchScore) return null;

  return (
    <div className="umpire-scoring-page">
      <div className="umpire-scoring-container">
        {/* Header */}
        <div className="umpire-scoring-header">
          <button
            onClick={handleBackToMatches}
            className="umpire-back-btn"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="umpire-scoring-match-info">
            Round {activeMatch.round} - Match {activeMatch.matchNumber}
          </div>
          <div className="umpire-scoring-set">
            Set {matchScore.currentSet}
          </div>
        </div>

        {/* Player Names and Set Scores */}
        <div className="umpire-scoring-players">
          <div className="umpire-scoring-player">
            <div className="umpire-player-name">
              {matchScore.servingPlayer === 'player1' && (
                <div className="umpire-serve-indicator">●</div>
              )}
              {player1.name}
            </div>
            <div className="umpire-player-sets">
              {matchScore.player1Sets.map((games, index) => (
                <span key={index} className="umpire-set-score">{games}</span>
              ))}
            </div>
          </div>
          
          <div className="umpire-scoring-player">
            <div className="umpire-player-name">
              {matchScore.servingPlayer === 'player2' && (
                <div className="umpire-serve-indicator">●</div>
              )}
              {player2.name}
            </div>
            <div className="umpire-player-sets">
              {matchScore.player2Sets.map((games, index) => (
                <span key={index} className="umpire-set-score">{games}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Current Game Score */}
        <div className="umpire-scoring-current">
          <div className="umpire-current-games">
            <div className="umpire-current-game">
              <div className="umpire-game-score">{matchScore.player1Games}</div>
              <div className="umpire-game-label">Games</div>
            </div>
            <div className="umpire-current-game">
              <div className="umpire-game-score">{matchScore.player2Games}</div>
              <div className="umpire-game-label">Games</div>
            </div>
          </div>

          <div className="umpire-current-points">
            <div className="umpire-point-score">
              {getPointDisplay(matchScore.player1Points, matchScore.isDeuce, matchScore.advantage, 'player1')}
            </div>
            <div className="umpire-point-separator">-</div>
            <div className="umpire-point-score">
              {getPointDisplay(matchScore.player2Points, matchScore.isDeuce, matchScore.advantage, 'player2')}
            </div>
          </div>
        </div>

        {/* Game State */}
        {matchScore.isDeuce && (
          <div className="umpire-game-state">
            {matchScore.advantage ? `Advantage ${matchScore.advantage === 'player1' ? player1.name : player2.name}` : 'Deuce'}
          </div>
        )}

        {/* Scoring Controls */}
        <div className="umpire-scoring-controls">
          <button
            onClick={() => awardPoint('player1')}
            className="umpire-point-btn player1"
          >
            <Plus size={24} />
            <span>Point {player1.name}</span>
          </button>
          
          <button
            onClick={() => awardPoint('player2')}
            className="umpire-point-btn player2"
          >
            <Plus size={24} />
            <span>Point {player2.name}</span>
          </button>
        </div>

        {/* Action Buttons */}
        <div className="umpire-action-buttons">
          <button
            onClick={undoLastPoint}
            disabled={!canUndo}
            className="umpire-action-btn undo"
          >
            <RotateCcw size={20} />
            Undo Last Point
          </button>
          
          <button
            onClick={() => setShowEndMatchConfirmation(true)}
            className="umpire-action-btn end-match"
          >
            <CheckCircle size={20} />
            End Match
          </button>
        </div>

        {/* End Match Confirmation Modal */}
        {showEndMatchConfirmation && (
          <div className="modal-backdrop fade-in">
            <div className="modal scale-in">
              <div className="text-center mb-6">
                <CheckCircle size={48} className="mx-auto mb-4" style={{ color: 'var(--success-green)' }} />
                <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--text-standard)' }}>
                  End Match
                </h2>
                <p style={{ color: 'var(--text-subtle)' }}>
                  Confirm the final score and declare the winner.
                </p>
              </div>

              <div className="umpire-final-score">
                <div className="umpire-final-player">
                  <div className="umpire-final-name">{player1.name}</div>
                  <div className="umpire-final-sets">
                    {matchScore.player1Sets.join(' - ')}
                  </div>
                </div>
                <div className="umpire-final-vs">vs</div>
                <div className="umpire-final-player">
                  <div className="umpire-final-name">{player2.name}</div>
                  <div className="umpire-final-sets">
                    {matchScore.player2Sets.join(' - ')}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setShowEndMatchConfirmation(false)}
                  className="btn btn-ghost flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEndMatch}
                  className="btn btn-primary btn-glare flex-1"
                >
                  <CheckCircle size={16} />
                  Confirm Result
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UmpirePage;