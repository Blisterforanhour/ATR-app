export interface User {
  id: string;
  email: string;
  name: string;
  username?: string;
  phone?: string;
  location?: string;
  bio?: string;
  profilePicture?: string | null;
  skillLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  rating: number;
  matchesPlayed: number;
  matchesWon: number;
  isOnboarded: boolean;
}

export interface Match {
  id: string;
  challengerId: string;
  challengedId: string;
  date: string;
  location: string;
  status: 'pending' | 'confirmed' | 'completed' | 'declined';
  challengerScore?: number;
  challengedScore?: number;
  winner?: string;
  createdAt: string;
}

export interface Tournament {
  id: string;
  name: string;
  description: string;
  organizerId: string;
  registrationDeadline: string;
  startDate: string;
  endDate: string;
  format: 'single_elimination' | 'double_elimination' | 'round_robin';
  location: string;
  maxParticipants: number;
  umpireId: string;
  status: 'registration_open' | 'registration_closed' | 'in_progress' | 'completed';
  winnerId?: string;
  createdAt: string;
}

export interface TournamentParticipant {
  id: string;
  tournamentId: string;
  playerId: string;
  seed?: number;
  registeredAt: string;
}

export interface TournamentMatch {
  id: string;
  tournamentId: string;
  round: number;
  matchNumber: number;
  player1Id?: string;
  player2Id?: string;
  winnerId?: string;
  score?: string;
  status: 'pending' | 'in_progress' | 'completed';
  scheduledDate?: string;
  location: string;
  umpireId: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface ThemeContextType {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}