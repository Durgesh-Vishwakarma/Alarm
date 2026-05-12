export const colors = {
  // Brand Identity (Futuristic AI Crimson)
  // Transitioned away from 'Zomato Red' to an electric, higher-energy crimson.
  primary: '#FF3B30',      
  primaryLight: '#FFF2F2', 
  
  // Semantic Status Colors
  // Essential for communicating AI states, anti-cheat levels, and verification status.
  success: '#34C759',      // Success/Morning Win
  warning: '#FFCC00',      // Caution/Retry
  danger: '#FF3B30',       // Failure/Active Alarm
  verification: '#00F2FF', // AI HUD Cyan / Scanning
  lockdown: '#AF52DE',     // Security Purple / Anti-Cheat
  ringing: '#FF2D55',      // High-Energy Alarm State
  
  // Interface (Light Theme - Dashboard & Settings)
  background: '#F8F9FA',   
  white: '#FFFFFF',
  card: '#FFFFFF',
  surface: '#F1F3F5',
  
  // Text System
  text: {
    primary: '#1A1A1A',    // High-contrast for headings
    secondary: '#5F6368',  // Balanced for body text
    muted: '#9AA0A6',      // Tertiary for secondary metadata
    light: '#FFFFFF',      // Inverse text
  },

  // Dark Theme System (The Core "Wake Experience" Identity)
  // Implements a unified futuristic/cyberpunk language for the HUD and Verification screens.
  dark: {
    background: '#0D0F14', // Deep obsidian
    surface: '#1A1D26',    // Soft dark surface
    card: '#242835',       // Elevated dark cards
    border: '#2D3343',     // Subtle dark dividers
    
    // AI HUD Tokens
    neon: '#00F2FF',       // Cyber Cyan
    glow: 'rgba(0, 242, 255, 0.15)',
    hud: 'rgba(255, 255, 255, 0.05)',
    accent: '#FF3B30',     // Crimson accents in dark mode
  },

  // Interaction & Layout
  border: '#E8EAED',
  dot: '#DADCE0',
  inactive: '#F1F3F4',
  input: '#F8F9FA',
};
