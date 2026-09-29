/* ==========================================================================
   SahaayaMind - Initial State (Clean Zero Start)
   Smart India Hackathon 2026 (SIH26003) | Team Arbalest
   ========================================================================== */

const SAHAAYA_DEFAULT_PROFILES = [
  {
    id: "user_senior",
    name: "Senior Member",
    age: 70,
    location: "Home Care",
    cognitiveLevel: "Gentle Pace (Level 1)",
    lastSession: "No sessions played yet",
    streakDays: 0,
    overallScore: 0,
    weeklyImprovement: "0%",
    sessionsCompleted: 0,
    avatarInitials: "SM",
    statusNote: "Ready to start your first session"
  },
  {
    id: "user_ramesh",
    name: "Ramesh Sharma",
    age: 72,
    location: "Home Care (Guwahati)",
    cognitiveLevel: "Gentle Pace (Level 1)",
    lastSession: "No sessions played yet",
    streakDays: 0,
    overallScore: 0,
    weeklyImprovement: "0%",
    sessionsCompleted: 0,
    avatarInitials: "RS",
    statusNote: "Ready to start your first session"
  },
  {
    id: "user_maya",
    name: "Maya Barua",
    age: 68,
    location: "Home Care (Dispur)",
    cognitiveLevel: "Gentle Pace (Level 1)",
    lastSession: "No sessions played yet",
    streakDays: 0,
    overallScore: 0,
    weeklyImprovement: "0%",
    sessionsCompleted: 0,
    avatarInitials: "MB",
    statusNote: "Ready to start your first session"
  }
];

const SAHAAYA_DEFAULT_HISTORY = [];

const SAHAAYA_DEFAULT_LATEST_RESULT = {
  gameName: "Memory Recall & Match",
  gameType: "memory",
  score: 0,
  maxScore: 100,
  accuracy: "0%",
  duration: "0s",
  memoryScore: 0,
  attentionScore: 0,
  speedScore: 0,
  attempts: 0,
  feedback: "Welcome to SahaayaMind! Complete your first cognitive exercise to see your memory and attention scores.",
  recommendation: "Tap 'Play Memory Game' below to start your gentle daily routine."
};

const SAHAAYA_DEFAULT_DEVICE_STREAK = {
  currentStreak: 0,
  bestStreak: 0,
  totalDaysPlayed: 0,
  totalGamesPlayed: 0,
  lastPlayedDate: null,
  streakStartDate: null,
  recentHistory: []
};

// Initialize Storage: Starts completely clean from 0
function initializeSahaayaStorage() {
  // Clear any legacy mock data once to ensure all progress begins from 0
  const ZERO_RESET_KEY = 'sahaaya_progress_zero_reset_v3';
  if (localStorage.getItem(ZERO_RESET_KEY) !== 'done') {
    localStorage.removeItem('sahaaya_history');
    localStorage.removeItem('sahaaya_latest_result');
    localStorage.removeItem('sahaaya_device_streak');
    localStorage.removeItem('sahaaya_active_user');
    localStorage.removeItem('sahaaya_profiles');
    localStorage.setItem(ZERO_RESET_KEY, 'done');
  }

  if (!localStorage.getItem('sahaaya_active_user')) {
    localStorage.setItem('sahaaya_active_user', JSON.stringify(SAHAAYA_DEFAULT_PROFILES[0]));
  }
  if (!localStorage.getItem('sahaaya_profiles')) {
    localStorage.setItem('sahaaya_profiles', JSON.stringify(SAHAAYA_DEFAULT_PROFILES));
  }
  if (!localStorage.getItem('sahaaya_history')) {
    localStorage.setItem('sahaaya_history', JSON.stringify(SAHAAYA_DEFAULT_HISTORY));
  }
  if (!localStorage.getItem('sahaaya_latest_result')) {
    localStorage.setItem('sahaaya_latest_result', JSON.stringify(SAHAAYA_DEFAULT_LATEST_RESULT));
  }
  if (!localStorage.getItem('sahaaya_device_streak')) {
    localStorage.setItem('sahaaya_device_streak', JSON.stringify(SAHAAYA_DEFAULT_DEVICE_STREAK));
  }
}

initializeSahaayaStorage();
