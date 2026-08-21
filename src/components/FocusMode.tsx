'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, Pause, RotateCcw, X, Brain, Volume2, VolumeX, Maximize, Minimize,
  Coffee, Target, Zap, Wind, Music, Waves, CloudRain, Sparkles, CheckCircle2,
  Trophy, Flame, Timer, Settings2, ChevronDown, ChevronUp, Keyboard,
  Focus, Moon, Sun, Heart, Activity
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface FocusModeProps {
  onClose: () => void;
}

interface Session {
  id: string;
  type: 'focus' | 'break' | 'longBreak';
  duration: number;
  completed: boolean;
  timestamp: Date;
  task?: string;
}

const QUOTES = [
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { text: "Your future is created by what you do today, not tomorrow.", author: "Robert Kiyosaki" },
  { text: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
];

const PRESETS = [
  { name: 'Pomodoro', focus: 25, break: 5, longBreak: 15 },
  { name: 'Deep Work', focus: 50, break: 10, longBreak: 30 },
  { name: 'Quick Sprint', focus: 15, break: 3, longBreak: 15 },
  { name: 'Marathon', focus: 90, break: 15, longBreak: 30 },
];

export default function FocusMode({ onClose }: FocusModeProps) {
  // Timer state
  const [mode, setMode] = useState<'focus' | 'break' | 'longBreak'>('focus');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [customDurations, setCustomDurations] = useState({ focus: 25, break: 5, longBreak: 15 });
  
  // Features
  const [currentTask, setCurrentTask] = useState('');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [ambientSound, setAmbientSound] = useState<'none' | 'rain' | 'lofi' | 'waves' | 'wind'>('none');
  
  // Stats
  const [sessions, setSessions] = useState<Session[]>([]);
  const [streak, setStreak] = useState(0);
  const [totalFocusMinutes, setTotalFocusMinutes] = useState(0);
  const [dailyGoal] = useState(8); // sessions
  
  // UI
  const [quote, setQuote] = useState(QUOTES[0]);
  const [breathing, setBreathing] = useState(false);
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize
  useEffect(() => {
    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    const saved = localStorage.getItem('focusSessions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessions(parsed.map((s: Session) => ({ ...s, timestamp: new Date(s.timestamp) })));
      } catch {}
    }
    const savedStreak = localStorage.getItem('focusStreak');
    if (savedStreak) setStreak(parseInt(savedStreak));
    const savedMinutes = localStorage.getItem('totalFocusMinutes');
    if (savedMinutes) setTotalFocusMinutes(parseInt(savedMinutes));
  }, []);

  // Timer logic
  useEffect(() => {
    if (isActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(t => t - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      handleTimerComplete();
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isActive, timeLeft]);

  const handleTimerComplete = () => {
    setIsActive(false);
    
    // Save session
    const newSession: Session = {
      id: Date.now().toString(),
      type: mode,
      duration: getDuration(mode),
      completed: true,
      timestamp: new Date(),
      task: currentTask || undefined,
    };
    const updated = [...sessions, newSession];
    setSessions(updated);
    localStorage.setItem('focusSessions', JSON.stringify(updated));
    
    if (mode === 'focus') {
      const newStreak = streak + 1;
      setStreak(newStreak);
      localStorage.setItem('focusStreak', newStreak.toString());
      const newMinutes = totalFocusMinutes + customDurations.focus;
      setTotalFocusMinutes(newMinutes);
      localStorage.setItem('totalFocusMinutes', newMinutes.toString());
      
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#06b6d4', '#8b5cf6', '#10b981', '#f59e0b']
      });
    }
    
    if (soundEnabled) {
      playCompletionSound();
    }
    
    // Auto switch
    if (mode === 'focus') {
      if (streak % 4 === 3) {
        switchMode('longBreak');
      } else {
        switchMode('break');
      }
    } else {
      switchMode('focus');
    }
  };

  const playCompletionSound = () => {
    // Simple beep using Web Audio API
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.frequency.value = 800;
    oscillator.type = 'sine';
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  };

  const getDuration = (m: typeof mode) => {
    switch (m) {
      case 'focus': return customDurations.focus * 60;
      case 'break': return customDurations.break * 60;
      case 'longBreak': return customDurations.longBreak * 60;
    }
  };

  const switchMode = (newMode: typeof mode) => {
    setMode(newMode);
    setIsActive(false);
    setTimeLeft(getDuration(newMode));
  };

  const toggleTimer = () => setIsActive(!isActive);

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(getDuration(mode));
  };

  const applyPreset = (preset: typeof PRESETS[0]) => {
    setCustomDurations({
      focus: preset.focus,
      break: preset.break,
      longBreak: preset.longBreak,
    });
    setMode('focus');
    setTimeLeft(preset.focus * 60);
    setIsActive(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = timeLeft / getDuration(mode);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        toggleTimer();
      } else if (e.code === 'KeyR') {
        resetTimer();
      } else if (e.code === 'KeyF') {
        toggleFullscreen();
      } else if (e.code === 'Escape') {
        onClose();
      } else if (e.code === 'KeyM') {
        setSoundEnabled(s => !s);
      } else if (e.code === 'Slash' && e.shiftKey) {
        setShowShortcutHelp(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isActive, timeLeft, mode]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  const getTodaysSessions = () => {
    const today = new Date().toDateString();
    return sessions.filter(s => new Date(s.timestamp).toDateString() === today && s.type === 'focus');
  };

  const getCurrentStreak = () => {
    // Simple streak calculation
    return streak;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex flex-col bg-[#040812] overflow-hidden"
    >
      {/* Ambient Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Breathing glow */}
        <motion.div
          animate={{
            scale: isActive ? [1, 1.2, 1] : [1, 1.05, 1],
            opacity: isActive ? [0.2, 0.4, 0.2] : [0.15, 0.25, 0.15],
          }}
          transition={{ duration: mode === 'focus' ? 4 : 6, repeat: Infinity, ease: "easeInOut" }}
          className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none transition-colors duration-1000 ${
            mode === 'focus' ? 'bg-cyan-500' : mode === 'break' ? 'bg-emerald-500' : 'bg-violet-500'
          }`}
        />
        
        {/* Stars/Particles */}
        <div className="absolute inset-0 opacity-30">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                opacity: [0.2, 1, 0.2],
                scale: [1, 1.5, 1],
              }}
              transition={{
                duration: 2 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${mode === 'focus' ? 'bg-cyan-500/20' : mode === 'break' ? 'bg-emerald-500/20' : 'bg-violet-500/20'}`}>
              <Brain size={20} className={mode === 'focus' ? 'text-cyan-400' : mode === 'break' ? 'text-emerald-400' : 'text-violet-400'} />
            </div>
            <span className="text-white/60 font-medium">Zen Focus</span>
          </div>
          
          {/* Streak Counter */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <Flame size={16} className="text-orange-400" />
            <span className="text-sm font-medium text-white/80">{getCurrentStreak()} session streak</span>
          </div>
          
          {/* Daily Progress */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <Target size={16} className="text-cyan-400" />
            <span className="text-sm text-white/60">{getTodaysSessions().length}/{dailyGoal}</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Stats Toggle */}
          <button
            onClick={() => setShowStats(!showStats)}
            className={`p-3 rounded-xl transition-all ${showStats ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
          >
            <Activity size={20} />
          </button>
          
          {/* Settings */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`p-3 rounded-xl transition-all ${showSettings ? 'bg-white/10 text-white' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
          >
            <Settings2 size={20} />
          </button>
          
          {/* Sound Toggle */}
          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className="p-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all"
          >
            {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
          </button>
          
          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="p-3 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-all"
          >
            {fullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
          
          {/* Close */}
          <button
            onClick={onClose}
            className="p-3 rounded-xl text-white/40 hover:text-white hover:bg-white/10 transition-all"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-8">
        <div className="flex flex-col items-center max-w-4xl w-full">
          
          {/* Mode Tabs */}
          <div className="flex gap-2 mb-8 p-1.5 rounded-2xl bg-white/5 border border-white/10">
            {(['focus', 'break', 'longBreak'] as const).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`px-6 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                  mode === m
                    ? m === 'focus' 
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' 
                      : m === 'break'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'bg-violet-500/20 text-violet-400 border border-violet-500/30'
                    : 'text-white/40 hover:text-white/80 hover:bg-white/5'
                }`}
              >
                {m === 'focus' && <Zap size={16} />}
                {m === 'break' && <Coffee size={16} />}
                {m === 'longBreak' && <Moon size={16} />}
                {m === 'focus' ? 'Deep Work' : m === 'break' ? 'Short Break' : 'Long Break'}
              </button>
            ))}
          </div>

          {/* Task Input */}
          <div className="mb-8 w-full max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="What are you focusing on?"
                value={currentTask}
                onChange={(e) => setCurrentTask(e.target.value)}
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white/90 placeholder:text-white/30 text-center focus:outline-none focus:border-cyan-500/30 transition-all"
              />
              {currentTask && (
                <motion.button
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => setCurrentTask('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-white/10 text-white/40"
                >
                  <X size={16} />
                </motion.button>
              )}
            </div>
          </div>

          {/* Timer Display */}
          <div className="relative mb-8">
            {/* Progress Ring */}
            <svg className="w-[350px] h-[350px] transform -rotate-90">
              <defs>
                <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor={mode === 'focus' ? '#06b6d4' : mode === 'break' ? '#10b981' : '#8b5cf6'} />
                  <stop offset="100%" stopColor={mode === 'focus' ? '#3b82f6' : mode === 'break' ? '#34d399' : '#a78bfa'} />
                </linearGradient>
              </defs>
              <circle
                cx="175"
                cy="175"
                r="160"
                stroke="rgba(255,255,255,0.05)"
                strokeWidth="4"
                fill="none"
              />
              <motion.circle
                cx="175"
                cy="175"
                r="160"
                stroke="url(#progressGradient)"
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 160}
                animate={{ strokeDashoffset: 2 * Math.PI * 160 * progress }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="drop-shadow-[0_0_20px_rgba(6,182,212,0.5)]"
              />
            </svg>

            {/* Time Display */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <motion.h1 
                className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/50 tracking-tight"
                key={timeLeft}
                initial={{ scale: 0.95, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.1 }}
              >
                {formatTime(timeLeft)}
              </motion.h1>
              <p className="text-white/40 tracking-widest uppercase text-sm mt-3 font-medium">
                {isActive ? (mode === 'focus' ? 'Stay Focused' : 'Breathe & Relax') : 'Ready to Start'}
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-6 mb-8">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTimer}
              className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${
                isActive
                  ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20'
                  : 'bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-[0_0_50px_rgba(6,182,212,0.4)] hover:shadow-[0_0_60px_rgba(6,182,212,0.6)]'
              }`}
            >
              {isActive ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" className="ml-1" />}
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.1, rotate: -180 }}
              whileTap={{ scale: 0.9 }}
              onClick={resetTimer}
              className="w-16 h-16 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all"
            >
              <RotateCcw size={24} />
            </motion.button>
          </div>

          {/* Quote */}
          <AnimatePresence mode="wait">
            {!isActive && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="text-center max-w-lg"
              >
                <p className="text-white/40 text-sm italic mb-2">"{quote.text}"</p>
                <p className="text-white/20 text-xs">— {quote.author}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Settings Panel */}
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ opacity: 0, x: 300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 300 }}
              className="absolute right-8 top-24 w-80 bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl"
            >
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Settings2 size={18} />
                Timer Settings
              </h3>
              
              {/* Presets */}
              <div className="mb-6">
                <p className="text-xs text-white/40 mb-3 uppercase tracking-wider">Presets</p>
                <div className="grid grid-cols-2 gap-2">
                  {PRESETS.map((preset) => (
                    <button
                      key={preset.name}
                      onClick={() => applyPreset(preset)}
                      className="px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-white/70 transition-all text-left"
                    >
                      <span className="block font-medium text-white">{preset.name}</span>
                      <span className="text-white/40">{preset.focus}/{preset.break}/{preset.longBreak} min</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Durations */}
              <div className="space-y-4">
                <p className="text-xs text-white/40 uppercase tracking-wider">Custom Durations</p>
                {(['focus', 'break', 'longBreak'] as const).map((m) => (
                  <div key={m} className="flex items-center justify-between">
                    <span className="text-sm text-white/60 capitalize">{m === 'longBreak' ? 'Long Break' : m}</span>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCustomDurations(d => ({ ...d, [m]: Math.max(1, d[m] - 5) }))}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/60"
                      >-</button>
                      <span className="w-12 text-center text-sm text-white">{customDurations[m]}m</span>
                      <button
                        onClick={() => setCustomDurations(d => ({ ...d, [m]: d[m] + 5 }))}
                        className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white/60"
                      >+</button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Ambient Sounds */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <p className="text-xs text-white/40 mb-3 uppercase tracking-wider">Ambient Sound</p>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'none', icon: VolumeX, label: 'None' },
                    { id: 'rain', icon: CloudRain, label: 'Rain' },
                    { id: 'waves', icon: Waves, label: 'Waves' },
                    { id: 'wind', icon: Wind, label: 'Wind' },
                  ].map((sound) => (
                    <button
                      key={sound.id}
                      onClick={() => setAmbientSound(sound.id as any)}
                      className={`p-3 rounded-xl border transition-all flex flex-col items-center gap-1 ${
                        ambientSound === sound.id
                          ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
                          : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10'
                      }`}
                    >
                      <sound.icon size={18} />
                      <span className="text-[10px]">{sound.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Panel */}
        <AnimatePresence>
          {showStats && (
            <motion.div
              initial={{ opacity: 0, x: -300 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -300 }}
              className="absolute left-8 top-24 w-80 bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/10 p-6 shadow-2xl"
            >
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <Trophy size={18} className="text-amber-400" />
                Your Progress
              </h3>
              
              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Target size={16} className="text-cyan-400" />
                    <span className="text-xs text-white/40">Sessions</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{sessions.filter(s => s.type === 'focus').length}</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <Timer size={16} className="text-emerald-400" />
                    <span className="text-xs text-white/40">Minutes</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{totalFocusMinutes}</p>
                </div>
              </div>

              {/* Today's Sessions */}
              <div>
                <p className="text-xs text-white/40 mb-3 uppercase tracking-wider">Today's Sessions</p>
                <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
                  {getTodaysSessions().length === 0 ? (
                    <p className="text-sm text-white/30 text-center py-4">No sessions yet today</p>
                  ) : (
                    getTodaysSessions().slice(-5).map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                        <div>
                          <p className="text-sm text-white/80">{session.task || 'Focus Session'}</p>
                          <p className="text-xs text-white/40">
                            {new Date(session.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        <CheckCircle2 size={16} className="text-emerald-400" />
                      </div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="relative z-10 flex items-center justify-center gap-8 pb-8 text-white/30 text-sm">
        <div className="flex items-center gap-2">
          <Keyboard size={14} />
          <span>Space to start/pause</span>
        </div>
        <div className="flex items-center gap-2">
          <span>R to reset</span>
        </div>
        <div className="flex items-center gap-2">
          <span>F for fullscreen</span>
        </div>
        <div className="flex items-center gap-2">
          <span>M to mute</span>
        </div>
        <div className="flex items-center gap-2">
          <span>ESC to exit</span>
        </div>
      </div>
    </motion.div>
  );
}
