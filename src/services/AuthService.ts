import { User } from '../types';

export class AuthService {
  private static STORAGE_KEY = 'tennis-platform-auth';
  private static TOKEN_KEY = 'tennis-platform-token';

  static async login(email: string): Promise<{ user: User; token: string }> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Check if user exists
    let user = this.getUserByEmail(email);
    
    if (!user) {
      // Create new user
      user = {
        id: this.generateId(),
        email,
        name: '',
        skillLevel: 'Beginner',
        rating: 1200,
        matchesPlayed: 0,
        matchesWon: 0,
        isOnboarded: false,
      };
      this.saveUser(user);
    }

    const token = this.generateToken();
    localStorage.setItem(this.TOKEN_KEY, token);
    
    return { user, token };
  }

  static async getCurrentUser(): Promise<User | null> {
    const token = localStorage.getItem(this.TOKEN_KEY);
    if (!token) return null;

    const users = this.getAllUsers();
    return users.find(user => user.email) || null;
  }

  static logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  private static getUserByEmail(email: string): User | null {
    const users = this.getAllUsers();
    return users.find(user => user.email === email) || null;
  }

  private static getAllUsers(): User[] {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private static saveUser(user: User): void {
    const users = this.getAllUsers();
    const existingIndex = users.findIndex(u => u.id === user.id);
    
    if (existingIndex >= 0) {
      users[existingIndex] = user;
    } else {
      users.push(user);
    }
    
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(users));
  }

  private static generateId(): string {
    return 'user_' + Math.random().toString(36).substr(2, 9);
  }

  private static generateToken(): string {
    return 'token_' + Math.random().toString(36).substr(2, 16);
  }
}