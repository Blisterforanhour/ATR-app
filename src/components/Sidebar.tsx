import React, { useState } from 'react';
import { 
  Home, 
  Trophy, 
  Calendar, 
  BarChart3, 
  Settings, 
  Menu, 
  X,
  ChevronLeft,
  ChevronRight,
  Gavel,
  Swords
} from 'lucide-react';
import ThemeToggle from './ThemeToggle';

interface SidebarProps {
  currentPage: string;
  onPageChange: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentPage, onPageChange }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigationItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'matches', label: 'My Matches', icon: Swords },
    { id: 'tournaments', label: 'Tournaments', icon: Trophy },
    { id: 'umpire', label: 'Live Scoring', icon: Gavel },
    { id: 'rankings', label: 'Ratings & Rankings', icon: BarChart3 },
    { id: 'profile', label: 'Profile', icon: Settings },
  ];

  const handleNavigation = (pageId: string) => {
    onPageChange(pageId);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="sidebar-mobile-trigger"
        aria-label="Open navigation menu"
      >
        <Menu size={24} />
      </button>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div 
          className="sidebar-backdrop"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${isCollapsed ? 'sidebar-collapsed' : ''} ${isMobileOpen ? 'sidebar-mobile-open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          {!isCollapsed && (
            <div className="sidebar-brand">
              <Trophy size={32} style={{ color: 'var(--quantum-cyan)' }} />
              <span className="sidebar-brand-text">Africa Tennis</span>
            </div>
          )}
          
          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="sidebar-toggle desktop-only"
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileOpen(false)}
            className="sidebar-close mobile-only"
            aria-label="Close navigation menu"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <ul className="sidebar-nav-list">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPage === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavigation(item.id)}
                    className={`sidebar-nav-item ${isActive ? 'active' : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon size={20} className="sidebar-nav-icon" />
                    {!isCollapsed && (
                      <span className="sidebar-nav-label">{item.label}</span>
                    )}
                    {isActive && <div className="sidebar-nav-indicator" />}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Theme Toggle Section */}
        <div className="sidebar-theme-section">
          <div className={`sidebar-theme-container ${isCollapsed ? 'collapsed' : ''}`}>
            <ThemeToggle isInSidebar={true} isCollapsed={isCollapsed} />
          </div>
        </div>

        {/* Footer */}
        {!isCollapsed && (
          <div className="sidebar-footer">
            <div className="sidebar-footer-content">
              <p className="sidebar-footer-text">Africa Tennis</p>
              <p className="sidebar-footer-version">v1.0.0</p>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;