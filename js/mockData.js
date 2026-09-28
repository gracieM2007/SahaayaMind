/* ==========================================================================
   SahaayaMind - Mock Data & Initial State
   Smart India Hackathon 2026 (SIH26003)
   ========================================================================== */

const SAHAAYA_DEFAULT_PROFILES = [
  {
    id: "user_ramesh",
    name: "Ramesh Sharma",
    age: 72,
    location: "Guwahati, Assam",
    cognitiveLevel: "Gentle Pace (Level 2)",
    lastSession: "Yesterday, 4:30 PM",
    streakDays: 5,
    overallScore: 86,
    weeklyImprovement: "+5%",
    sessionsCompleted: 14,
    avatarInitials: "RS",
    statusNote: "Consistent daily engagement"
  },
  {
    id: "user_maya",
    name: "Maya Barua",
    age: 68,
    location: "Shillong, Meghalaya",
    cognitiveLevel: "Moderate (Level 3)",
    lastSession: "Today, 10:15 AM",
    streakDays: 7,
    overallScore: 91,
    weeklyImprovement: "+8%",
    sessionsCompleted: 22,
    avatarInitials: "MB",
    statusNote: "High attention retention"
  },
  {
    id: "user_bipul",
    name: "Bipul Das",
    age: 75,
    location: "Dibrugarh, Assam",
    cognitiveLevel: "Introductory (Level 1)",
    lastSession: "2 days ago",
    streakDays: 3,
    overallScore: 78,
    weeklyImprovement: "+3%",
    sessionsCompleted: 9,
    avatarInitials: "BD",
    statusNote: "Needs voice-guided prompts"
  }
];

const SAHAAYA_DEFAULT_HISTORY = [
  {
    id: "sess_01",
    gameName: "Memory Recall & Match",
    gameType: "memory",
    date: "30 Aug 2026",
    time: "4:30 PM",
    score: 92,
    accuracy: "94%",
    duration: "3 min 20s",
    speedRating: "Fast & Confident",
    status: "Completed",
    memoryScore: 92,
    attentionScore: 88,
    speedScore: 90
  },
  {
    id: "sess_02",
    gameName: "Attention & Pattern Focus",
    gameType: "attention",
    date: "29 Aug 2026",
    time: "11:00 AM",
    score: 85,
    accuracy: "88%",
    duration: "4 min 10s",
    speedRating: "Steady",
    status: "Completed",
    memoryScore: 82,
    attentionScore: 89,
    speedScore: 84
  },
  {
    id: "sess_03",
    gameName: "Memory Recall & Match",
    gameType: "memory",
    date: "28 Aug 2026",
    time: "5:15 PM",
    score: 88,
    accuracy: "90%",
    duration: "3 min 45s",
    speedRating: "Steady",
    status: "Completed",
    memoryScore: 88,
    attentionScore: 85,
    speedScore: 86
  },
  {
    id: "sess_04",
    gameName: "Attention & Pattern Focus",
    gameType: "attention",
    date: "27 Aug 2026",
    time: "10:30 AM",
    score: 80,
    accuracy: "84%",
    duration: "4 min 30s",
    speedRating: "Relaxed",
    status: "Completed",
    memoryScore: 79,
    attentionScore: 82,
    speedScore: 80
  },
  {
    id: "sess_05",
    gameName: "Memory Recall & Match",
    gameType: "memory",
    date: "26 Aug 2026",
    time: "4:00 PM",
    score: 84,
    accuracy: "86%",
    duration: "4 min 00s",
    speedRating: "Steady",
    status: "Completed",
    memoryScore: 85,
    attentionScore: 81,
    speedScore: 82
  }
];

const SAHAAYA_DEFAULT_LATEST_RESULT = {
  gameName: "Memory Recall & Match",
  gameType: "memory",
  score: 92,
  maxScore: 100,
  accuracy: "95%",
  duration: "3m 15s",
  memoryScore: 94,
  attentionScore: 90,
  speedScore: 92,
  feedback: "Outstanding work! Your visual recall was 12% faster today than previous sessions. Keep up this regular morning rhythm.",
  recommendation: "Take a short water break, then practice the Attention Game tomorrow morning."
};

// Initialize Storage if empty
function initializeSahaayaStorage() {
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
}

initializeSahaayaStorage();
