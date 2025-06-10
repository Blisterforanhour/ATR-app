import React, { useState } from 'react';
import { User, Trophy, ArrowRight } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const OnboardingPage: React.FC = () => {
  const [name, setName] = useState('');
  const [skillLevel, setSkillLevel] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Beginner');
  const { updateUser } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    updateUser({
      name: name.trim(),
      skillLevel,
      isOnboarded: true,
    });
  };

  const skillLevels = [
    { value: 'Beginner', description: 'New to competitive tennis', rating: '1000-1400' },
    { value: 'Intermediate', description: 'Regular player with solid fundamentals', rating: '1400-1700' },
    { value: 'Advanced', description: 'Experienced competitive player', rating: '1700+' },
  ] as const;

  return (
    <div className="onboarding-page">
      <div className="card border-flow onboarding-container">
        <div className="onboarding-header">
          <div className="float onboarding-icon">
            <Trophy size={48} className="mx-auto text-quantum-cyan" style={{ color: 'var(--quantum-cyan)' }} />
          </div>
          <h1 className="onboarding-title">
            Welcome to Africa Tennis
          </h1>
          <p className="onboarding-subtitle">
            Complete your profile to start challenging players
          </p>
        </div>

        <form onSubmit={handleSubmit} className="onboarding-form">
          <div className="onboarding-form-group">
            <label htmlFor="name" className="onboarding-form-label">
              <User size={16} className="icon" />
              Your Name
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="onboarding-input"
              placeholder="Enter your name"
              required
            />
          </div>

          <div className="onboarding-form-group">
            <label className="onboarding-form-label">
              <Trophy size={16} className="icon" />
              Skill Level
            </label>
            <div className="skill-level-options">
              {skillLevels.map((level) => (
                <label
                  key={level.value}
                  className={`skill-level-option ${skillLevel === level.value ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="skillLevel"
                    value={level.value}
                    checked={skillLevel === level.value}
                    onChange={(e) => setSkillLevel(e.target.value as typeof skillLevel)}
                  />
                  <div className="skill-level-content">
                    <div className="skill-level-info">
                      <div className="skill-level-name">
                        {level.value}
                      </div>
                      <div className="skill-level-description">
                        {level.description}
                      </div>
                    </div>
                    <div className="skill-level-rating">
                      {level.rating}
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={!name.trim()}
            className="onboarding-submit-btn"
          >
            <span>Enter the Arena</span>
            <ArrowRight size={18} />
          </button>
        </form>
      </div>
    </div>
  );
};

export default OnboardingPage;