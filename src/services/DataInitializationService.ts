import { UserService } from './UserService';
import { MatchService } from './MatchService';
import { TournamentService } from './TournamentService';

export class DataInitializationService {
  private static isInitialized = false;
  private static initializationPromise: Promise<void> | null = null;

  static async initializeAllMockData(): Promise<void> {
    // Return existing promise if initialization is already in progress
    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    // Return immediately if already initialized
    if (this.isInitialized) {
      return Promise.resolve();
    }

    // Create and store the initialization promise
    this.initializationPromise = this.performInitialization();
    
    try {
      await this.initializationPromise;
    } finally {
      this.initializationPromise = null;
    }
  }

  private static async performInitialization(): Promise<void> {
    console.log('🚀 Initializing Africa Tennis mock data...');
    
    try {
      // Initialize in dependency order to ensure data consistency
      console.log('📊 Initializing user data...');
      UserService.initializeMockData();
      
      console.log('🎾 Initializing match data...');
      MatchService.initializeMockData();
      
      console.log('🏆 Initializing tournament data...');
      TournamentService.initializeMockData();
      
      // Simulate realistic initialization delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      this.isInitialized = true;
      console.log('✅ Mock data initialization complete');
    } catch (error) {
      console.error('❌ Failed to initialize mock data:', error);
      this.isInitialized = false;
      throw error;
    }
  }

  static reset(): void {
    this.isInitialized = false;
    this.initializationPromise = null;
    console.log('🔄 Data initialization status reset');
  }

  static getInitializationStatus(): boolean {
    return this.isInitialized;
  }

  static isInitializing(): boolean {
    return this.initializationPromise !== null;
  }
}