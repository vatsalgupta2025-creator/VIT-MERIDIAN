'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    Play,
    Search,
    BookOpen,
    Trophy,
    Clock,
    X,
    Award,
    TrendingUp,
    Flame,
    CheckCircle,
    Lock,
    Zap,
    Loader2,
    Sparkles,
    Target,
    Brain,
    Eye,
    History,
    Crown,
    Medal,
    ChevronRight,
    Hexagon,
    Key,
    Link,
    Plus,
    Trash2,
    ListVideo,
    ChevronDown,
    ChevronUp,
    AlertCircle,
} from 'lucide-react';
import { YouTubeVideo, Quiz } from '@/types/learning';
import { mockLeaderboard, parseDuration, formatViewCount, mockSkills } from '@/data/learningData';
import { searchYouTubeVideos, getVideoByUrl, getPlaylistVideos, extractPlaylistId } from '@/lib/youtubeApi';
import { generateQuizFromVideo, calculateQuizPoints, generateQuizId } from '@/lib/quizGenerator';
import { fireConfetti, firePerfectScoreCelebration } from '@/lib/confetti';
import Squares from '@/components/Squares';

// ============================================================
// Video Player Modal
// ============================================================
function VideoPlayerModal({
    video,
    isOpen,
    onClose,
    onVideoComplete,
    onQuizComplete,
    watched,
    completedQuizId,
}: {
    video: YouTubeVideo;
    isOpen: boolean;
    onClose: () => void;
    onVideoComplete: (videoId: string) => void;
    onQuizComplete: (quizId: string, score: number, pointsEarned: number) => void;
    watched: boolean;
    completedQuizId?: string;
}) {
    const [isCompleted, setIsCompleted] = useState(watched);
    const [quiz, setQuiz] = useState<Quiz | null>(null);
    const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [showExplanation, setShowExplanation] = useState(false);
    const [score, setScore] = useState(0);
    const [isQuizCompleted, setIsQuizCompleted] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);
    const [quizStarted, setQuizStarted] = useState(false);
    const [pointsEarned, setPointsEarned] = useState(0);

    // Auto-generate quiz as soon as the modal opens
    useEffect(() => {
        const autoGenerate = async () => {
            if (completedQuizId) return; // already done
            setIsGeneratingQuiz(true);
            try {
                const generated = await generateQuizFromVideo(video.id, video.title, video.description, 5);
                if (generated) {
                    const newQuiz: Quiz = {
                        id: generateQuizId(video.id),
                        videoId: video.id,
                        courseId: 'dynamic',
                        title: generated.title,
                        questions: generated.questions,
                        timeLimit: Math.max(5, generated.questions.length * 2),
                        passingScore: 60,
                        rewardPoints: 100,
                    };
                    setQuiz(newQuiz);
                    setTimeLeft(newQuiz.timeLimit * 60);
                }
            } catch (error) {
                console.error('Error generating quiz:', error);
            } finally {
                setIsGeneratingQuiz(false);
            }
        };
        autoGenerate();
    }, [video.id]);

    const handleComplete = () => {
        setIsCompleted(true);
        onVideoComplete(video.id);
    };


    useEffect(() => {
        if (quizStarted && !isQuizCompleted && timeLeft > 0) {
            const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
            return () => clearInterval(timer);
        }
        if (timeLeft === 0 && !isQuizCompleted && quiz) {
            handleFinishQuiz();
        }
    }, [quizStarted, isQuizCompleted, timeLeft, quiz]);

    const handleSubmitAnswer = () => {
        if (selectedAnswer === null || !quiz) return;
        if (selectedAnswer === quiz.questions[currentQuestion].correctAnswer) {
            setScore(prev => prev + 1);
        }
        setShowExplanation(true);
    };

    const handleNextQuestion = () => {
        if (!quiz) return;
        if (currentQuestion < quiz.questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
            setSelectedAnswer(null);
            setShowExplanation(false);
        } else {
            handleFinishQuiz();
        }
    };

    const handleFinishQuiz = () => {
        if (!quiz) return;
        setIsQuizCompleted(true);
        const percentage = (score / quiz.questions.length) * 100;
        const calculatedPoints = calculateQuizPoints(score, quiz.questions.length, quiz.timeLimit * 60 - timeLeft, quiz.timeLimit * 60);
        setPointsEarned(calculatedPoints);
        onQuizComplete(quiz.id, score, calculatedPoints);
        if (percentage === 100) firePerfectScoreCelebration();
        else if (percentage >= 60) fireConfetti({ particleCount: 100, spread: 70 });
    };

    const formatTime = (seconds: number) => `${Math.floor(seconds / 60)}:${(seconds % 60).toString().padStart(2, '0')}`;

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4">
            <div className="relative w-full max-w-6xl bg-[#0a0a0f] rounded-2xl overflow-hidden border border-white/10 shadow-2xl max-h-[90vh] flex flex-col">
                <button onClick={onClose} className="absolute top-3 right-3 z-10 p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/60 hover:text-white transition-all">
                    <X size={18} />
                </button>

                <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
                    <div className="flex-1 p-4 overflow-y-auto">
                        <div className="aspect-video rounded-xl overflow-hidden bg-black mb-3">
                            <iframe
                                src={`https://www.youtube.com/embed/${video.id}?autoplay=1&rel=0&modestbranding=1`}
                                title={video.title}
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                className="w-full h-full"
                            />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1 line-clamp-2">{video.title}</h3>
                        <p className="text-white/40 text-sm mb-3">{video.channelTitle}</p>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleComplete}
                                disabled={isCompleted}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${isCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-cyan-500 text-black hover:bg-cyan-400'}`}
                            >
                                <CheckCircle size={16} />
                                {isCompleted ? 'Completed +10 XP' : 'Mark Complete'}
                            </button>
                            <div className="flex items-center gap-2 text-white/40 text-xs">
                                <Clock size={14} />
                                {parseDuration(video.duration)}
                            </div>
                        </div>
                    </div>

                    <div className="w-full lg:w-[300px] border-t lg:border-t-0 lg:border-l border-white/10 p-4 bg-[#08080c] overflow-y-auto">
                        <div className="flex items-center gap-2 mb-4">
                            <Brain size={20} className="text-violet-400" />
                            <h4 className="text-base font-bold text-white">Quiz</h4>
                        </div>

                        {completedQuizId ? (
                            <div className="text-center py-8">
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                                    <CheckCircle size={24} className="text-emerald-400" />
                                </div>
                                <h5 className="text-base font-bold text-white mb-1">Quiz Done! 🎉</h5>
                                <p className="text-white/40 text-xs">You already aced this quiz</p>
                            </div>
                        ) : !quiz ? (
                            <div className="text-center py-6">
                                {isGeneratingQuiz ? (
                                    <>
                                        <Loader2 size={28} className="text-cyan-400 animate-spin mx-auto mb-3" />
                                        <p className="text-white/60 text-xs">Generating AI quiz from video...</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-3">
                                            <Target size={24} className="text-violet-400" />
                                        </div>
                                        <h5 className="text-sm font-bold text-white mb-1">Quiz failed to load</h5>
                                        <p className="text-white/40 text-xs mb-3">Check your API key</p>
                                    </>
                                )}
                            </div>
                        ) : !quizStarted ? (
                            <div className="space-y-3">
                                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                    <h5 className="font-bold text-white mb-1 text-xs">{quiz.title}</h5>
                                    <p className="text-[10px] text-white/60">ðŸ“ {quiz.questions.length} questions â€¢ â±ï¸ {quiz.timeLimit} min</p>
                                </div>
                                <button onClick={() => setQuizStarted(true)} className="w-full py-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-lg font-medium text-sm">
                                    Begin
                                </button>
                            </div>
                        ) : !isQuizCompleted ? (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-[10px]">
                                    <span className="text-white/40">Q{currentQuestion + 1}/{quiz.questions.length}</span>
                                    <span className={`font-mono ${timeLeft < 60 ? 'text-red-400' : 'text-white/40'}`}>{formatTime(timeLeft)}</span>
                                </div>
                                <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                                    <p className="text-white text-xs font-medium">{quiz.questions[currentQuestion].question}</p>
                                </div>
                                <div className="space-y-1">
                                    {quiz.questions[currentQuestion].options.map((option, index) => (
                                        <button
                                            key={index}
                                            onClick={() => !showExplanation && setSelectedAnswer(index)}
                                            className={`w-full p-2 rounded-lg text-left text-[10px] transition-all ${showExplanation
                                                ? index === quiz.questions[currentQuestion].correctAnswer
                                                    ? 'bg-emerald-500/20 border border-emerald-500/50 text-emerald-400'
                                                    : selectedAnswer === index
                                                        ? 'bg-red-500/20 border border-red-500/50 text-red-400'
                                                        : 'bg-white/5 text-white/40'
                                                : selectedAnswer === index
                                                    ? 'bg-cyan-500/20 border border-cyan-500/50 text-cyan-400'
                                                    : 'bg-white/5 border border-transparent text-white/70 hover:bg-white/10'
                                                }`}
                                        >
                                            <span className="inline-block w-4 h-4 rounded bg-white/10 text-center mr-1 text-[10px]">{String.fromCharCode(65 + index)}</span>
                                            {option}
                                        </button>
                                    ))}
                                </div>
                                <button
                                    onClick={showExplanation ? handleNextQuestion : handleSubmitAnswer}
                                    disabled={!showExplanation && selectedAnswer === null}
                                    className="w-full py-2 bg-gradient-to-r from-cyan-500 to-violet-500 text-white rounded-lg font-medium text-xs disabled:opacity-50"
                                >
                                    {showExplanation ? (currentQuestion < quiz.questions.length - 1 ? 'Next' : 'Finish') : 'Submit'}
                                </button>
                            </div>
                        ) : (
                            <div className="text-center py-6">
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                                    <Trophy size={24} className="text-emerald-400" />
                                </div>
                                <h5 className="text-sm font-bold text-white mb-1">Done!</h5>
                                <p className="text-white/40 text-xs mb-2">{score}/{quiz.questions.length}</p>
                                <div className="grid grid-cols-2 gap-2 mb-3">
                                    <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                                        <p className="text-base font-bold text-cyan-400">+{pointsEarned}</p>
                                        <p className="text-[10px] text-white/40">XP</p>
                                    </div>
                                    <div className="p-2 rounded-lg bg-violet-500/10 border border-violet-500/20">
                                        <p className="text-base font-bold text-violet-400">{Math.round((score / quiz.questions.length) * 100)}%</p>
                                        <p className="text-[10px] text-white/40">Score</p>
                                    </div>
                                </div>
                                <button onClick={onClose} className="w-full py-2 bg-white/10 text-white rounded-lg font-medium text-xs">
                                    Continue
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================================
// Leaderboard Panel
// ============================================================
function LeaderboardPanel({
    leaderboard,
    userPoints
}: {
    leaderboard: typeof mockLeaderboard;
    userPoints: number;
}) {
    const getRankIcon = (rank: number) => {
        if (rank === 1) return <Crown size={14} className="text-yellow-400" />;
        if (rank === 2) return <Medal size={14} className="text-gray-300" />;
        if (rank === 3) return <Medal size={14} className="text-amber-600" />;
        return <span className="text-[10px] font-bold text-white/40">{rank}</span>;
    };

    return (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3">
            <div className="flex items-center gap-2 mb-3">
                <Trophy size={16} className="text-yellow-400" />
                <h3 className="text-sm font-bold text-white">Leaderboard</h3>
            </div>
            <div className="space-y-1.5">
                {leaderboard.slice(0, 5).map((entry) => (
                    <div
                        key={entry.userId}
                        className={`flex items-center gap-2 p-2 rounded-lg transition-all ${entry.userId === 'user-3'
                            ? 'bg-gradient-to-r from-cyan-500/10 to-violet-500/10 border border-cyan-500/20'
                            : 'bg-white/[0.02] hover:bg-white/[0.04]'
                            }`}
                    >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${entry.rank === 1 ? 'bg-yellow-500/20' :
                            entry.rank === 2 ? 'bg-gray-400/20' :
                                entry.rank === 3 ? 'bg-amber-600/20' :
                                    'bg-white/5'
                            }`}>
                            {getRankIcon(entry.rank)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-medium text-white truncate">{entry.userName}</p>
                            <p className="text-[8px] text-white/40">{entry.quizzesCompleted} quizzes</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-bold text-cyan-400">{entry.totalPoints.toLocaleString()}</p>
                            <p className="text-[8px] text-white/30">XP</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ============================================================
// Skills Honeycomb Panel
// ============================================================
function SkillsHoneycombPanel({
    completedQuizzes,
    watchedVideos
}: {
    completedQuizzes: Map<string, { score: number; points: number }>;
    watchedVideos: Set<string>;
}) {
    const skills = mockSkills.map((skill: { id: string; name: string; icon: React.ComponentType<{ size?: number; className?: string }>; level: number; progress: number }) => ({
        ...skill,
        progress: Math.min(100, (completedQuizzes.size * 15) + (watchedVideos.size * 5) + Math.random() * 20),
    }));

    const getSkillColor = (level: number) => {
        if (level >= 80) return { bg: 'from-emerald-500/20 to-emerald-600/20', border: 'border-emerald-500/30', text: 'text-emerald-400' };
        if (level >= 60) return { bg: 'from-cyan-500/20 to-cyan-600/20', border: 'border-cyan-500/30', text: 'text-cyan-400' };
        if (level >= 40) return { bg: 'from-violet-500/20 to-violet-600/20', border: 'border-violet-500/30', text: 'text-violet-400' };
        if (level >= 20) return { bg: 'from-orange-500/20 to-orange-600/20', border: 'border-orange-500/30', text: 'text-orange-400' };
        return { bg: 'from-gray-500/20 to-gray-600/20', border: 'border-gray-500/30', text: 'text-gray-400' };
    };

    return (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3">
            <div className="flex items-center gap-2 mb-3">
                <Hexagon size={16} className="text-violet-400" />
                <h3 className="text-sm font-bold text-white">Skills</h3>
            </div>
            <div className="grid grid-cols-3 gap-2">
                {skills.slice(0, 6).map((skill: { id: string; name: string; icon: React.ComponentType<{ size?: number; className?: string }>; progress: number }) => {
                    const colors = getSkillColor(skill.progress);
                    const IconComponent = skill.icon;
                    return (
                        <div
                            key={skill.id}
                            className={`relative aspect-square bg-gradient-to-br ${colors.bg} border ${colors.border} rounded-lg flex flex-col items-center justify-center p-1 group hover:scale-105 transition-transform cursor-pointer`}
                        >
                            <IconComponent size={16} className={colors.text} />
                            <span className="text-[8px] font-medium text-white/60 mt-0.5 text-center truncate w-full">{skill.name}</span>
                            <div className="absolute bottom-0.5 right-0.5 text-[7px] font-bold text-white/40">{Math.round(skill.progress)}%</div>

                            {/* Tooltip */}
                            <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/90 px-2 py-1 rounded text-[8px] text-white opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                                {skill.name}: {Math.round(skill.progress)}%
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// ============================================================
// Stats Panel
// ============================================================
function StatsPanel({
    totalPoints,
    streak,
    videosWatched,
    quizzesCompleted
}: {
    totalPoints: number;
    streak: number;
    videosWatched: number;
    quizzesCompleted: number;
}) {
    return (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-3">
            <div className="flex items-center gap-2 mb-3">
                <Zap size={16} className="text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Your Progress</h3>
            </div>
            <div className="grid grid-cols-2 gap-2">
                <div className="bg-gradient-to-br from-cyan-500/10 to-cyan-600/5 border border-cyan-500/20 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-cyan-400">{totalPoints.toLocaleString()}</p>
                    <p className="text-[8px] text-white/40">Total XP</p>
                </div>
                <div className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 border border-orange-500/20 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-orange-400">{streak}</p>
                    <p className="text-[8px] text-white/40">Day Streak</p>
                </div>
                <div className="bg-gradient-to-br from-violet-500/10 to-violet-600/5 border border-violet-500/20 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-violet-400">{videosWatched}</p>
                    <p className="text-[8px] text-white/40">Videos</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border border-emerald-500/20 rounded-lg p-2 text-center">
                    <p className="text-lg font-bold text-emerald-400">{quizzesCompleted}</p>
                    <p className="text-[8px] text-white/40">Quizzes</p>
                </div>
            </div>
        </div>
    );
}

// ============================================================
// YouTube API Key Setup Panel
// ============================================================
function YouTubeKeyPanel({
    apiKey,
    onSave,
}: {
    apiKey: string;
    onSave: (key: string) => void;
}) {
    const [draft, setDraft] = useState(apiKey);
    const [visible, setVisible] = useState(false);

    return (
        <div className="bg-gradient-to-br from-rose-500/10 to-orange-500/5 border border-rose-500/20 rounded-2xl p-5 mb-4">
            <div className="flex items-start gap-3 mb-3">
                <Key size={18} className="text-rose-400 flex-shrink-0 mt-0.5" />
                <div>
                    <h3 className="text-sm font-bold text-white">YouTube Data API Key</h3>
                    <p className="text-white/40 text-xs mt-0.5">
                        Enter your key to fetch real video metadata. Get one free at{' '}
                        <a href="https://console.cloud.google.com/apis/api/youtube.googleapis.com" target="_blank" rel="noreferrer"
                            className="text-cyan-400 hover:underline">Google Cloud Console</a>.
                    </p>
                </div>
            </div>
            <div className="flex gap-2">
                <input
                    type={visible ? 'text' : 'password'}
                    value={draft}
                    onChange={e => setDraft(e.target.value)}
                    placeholder="AIzaâ€¦"
                    className="flex-1 bg-black/30 border border-white/[0.08] rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-rose-500/40 placeholder-white/20 font-mono"
                />
                <button onClick={() => setVisible(v => !v)}
                    className="px-3 py-2 bg-white/[0.04] border border-white/[0.06] rounded-xl text-white/40 hover:text-white/70 text-xs transition-all">
                    {visible ? 'Hide' : 'Show'}
                </button>
                <button onClick={() => onSave(draft.trim())}
                    className="px-4 py-2 bg-gradient-to-r from-rose-500 to-orange-500 text-white text-sm font-semibold rounded-xl hover:opacity-90 transition-all">
                    Save
                </button>
            </div>
            {apiKey && (
                <p className="text-emerald-400 text-xs mt-2 flex items-center gap-1">
                    <CheckCircle size={12} /> API key saved â€” ready to fetch videos
                </p>
            )}
        </div>
    );
}

// ============================================================
// My Watched Videos Tab
// ============================================================
function MyVideosTab({
    apiKey,
    onVideoSelect,
    watchedVideos,
    completedQuizzes,
}: {
    apiKey: string;
    onVideoSelect: (video: YouTubeVideo) => void;
    watchedVideos: Set<string>;
    completedQuizzes: Map<string, { score: number; points: number }>;
}) {
    const [urlInput, setUrlInput] = useState('');
    const [myVideos, setMyVideos] = useState<YouTubeVideo[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [playlistMode, setPlaylistMode] = useState(false);

    // Load saved videos
    useEffect(() => {
        try {
            const saved = localStorage.getItem('vitgroww_my_videos');
            if (saved) setMyVideos(JSON.parse(saved));
        } catch { }
    }, []);

    // Persist
    useEffect(() => {
        localStorage.setItem('vitgroww_my_videos', JSON.stringify(myVideos));
    }, [myVideos]);

    const addVideo = async () => {
        if (!urlInput.trim()) return;
        if (!apiKey) { setError('Please save your YouTube API key first.'); return; }
        setError('');
        setLoading(true);

        try {
            if (playlistMode) {
                const pid = extractPlaylistId(urlInput) || urlInput.trim();
                const videos = await getPlaylistVideos(pid, 20, apiKey);
                if (!videos.length) { setError('Playlist not found or no videos returned.'); return; }
                setMyVideos(prev => {
                    const ids = new Set(prev.map(v => v.id));
                    return [...prev, ...videos.filter(v => !ids.has(v.id))];
                });
            } else {
                const video = await getVideoByUrl(urlInput.trim(), apiKey);
                if (!video) { setError('Video not found. Check the URL or your API key.'); return; }
                setMyVideos(prev => prev.find(v => v.id === video.id) ? prev : [video, ...prev]);
            }
            setUrlInput('');
        } catch (e: any) {
            setError(e.message || 'Failed to fetch video.');
        } finally {
            setLoading(false);
        }
    };

    const removeVideo = (id: string) => setMyVideos(prev => prev.filter(v => v.id !== id));

    return (
        <div className="flex-1 flex flex-col min-h-0">
            {/* Input row */}
            <div className="flex gap-2 mb-3 flex-shrink-0">
                <div className="flex-1 relative">
                    <Link size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                    <input
                        value={urlInput}
                        onChange={e => setUrlInput(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addVideo()}
                        placeholder={playlistMode ? 'Paste YouTube playlist URLâ€¦' : 'Paste YouTube video URLâ€¦'}
                        className="w-full pl-9 pr-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:border-cyan-500/50 transition-all"
                    />
                </div>
                <button onClick={() => setPlaylistMode(p => !p)}
                    title={playlistMode ? 'Switch to video mode' : 'Switch to playlist mode'}
                    className={`px-3 py-2.5 rounded-xl border text-xs font-medium transition-all ${playlistMode ? 'bg-violet-500/20 border-violet-500/40 text-violet-400' : 'bg-white/[0.03] border-white/[0.08] text-white/40 hover:text-white/70'}`}>
                    {playlistMode ? <ListVideo size={16} /> : <Play size={16} />}
                </button>
                <button onClick={addVideo} disabled={loading || !urlInput.trim()}
                    className="px-4 py-2.5 bg-cyan-500 text-black rounded-xl font-bold text-sm hover:bg-cyan-400 disabled:opacity-50 flex items-center gap-1.5 transition-all">
                    {loading ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                    Add
                </button>
            </div>

            {error && (
                <div className="flex items-center gap-2 mb-3 px-3 py-2 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs flex-shrink-0">
                    <AlertCircle size={13} /> {error}
                </div>
            )}

            {myVideos.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <div className="w-16 h-16 rounded-2xl bg-white/[0.03] flex items-center justify-center mx-auto mb-4">
                            <Play size={32} className="text-white/20" />
                        </div>
                        <h3 className="text-white/50 font-medium mb-2">No videos added yet</h3>
                        <p className="text-white/25 text-sm max-w-xs mx-auto">
                            Paste a YouTube video URL above to fetch it and take an AI-generated quiz on it.
                        </p>
                    </div>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 pb-4 content-start">
                    {myVideos.map(video => {
                        const quizId = `quiz-${video.id}`;
                        const quizDone = completedQuizzes.has(quizId);
                        const videoWatched = watchedVideos.has(video.id);
                        return (
                            <div key={video.id} className="group relative bg-white/[0.03] border border-white/[0.06] hover:border-cyan-500/30 rounded-xl overflow-hidden transition-all cursor-pointer"
                                onClick={() => onVideoSelect(video)}>
                                <div className="relative aspect-video">
                                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="w-10 h-10 rounded-full bg-cyan-500/90 flex items-center justify-center">
                                            <Play size={16} className="text-white ml-0.5" fill="white" />
                                        </div>
                                    </div>
                                    <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/80 text-[9px] text-white">
                                        {parseDuration(video.duration)}
                                    </div>
                                    {videoWatched && (
                                        <div className="absolute top-1 left-1 w-5 h-5 rounded bg-emerald-500/90 flex items-center justify-center">
                                            <CheckCircle size={11} className="text-white" />
                                        </div>
                                    )}
                                    {quizDone && (
                                        <div className="absolute top-1 right-1 w-5 h-5 rounded bg-violet-500/90 flex items-center justify-center">
                                            <Award size={11} className="text-white" />
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 flex flex-col gap-1">
                                    <h4 className="text-xs font-medium text-white/80 line-clamp-2 group-hover:text-cyan-400 transition-colors">{video.title}</h4>
                                    <p className="text-[10px] text-white/40">{video.channelTitle}</p>
                                    <div className="flex items-center justify-between mt-1">
                                        <span className="text-[9px] text-white/25">{formatViewCount(video.viewCount)} views</span>
                                        {quizDone
                                            ? <span className="text-[9px] text-violet-400 flex items-center gap-0.5"><Award size={9} /> Quiz done</span>
                                            : <span className="text-[9px] text-cyan-400 flex items-center gap-0.5"><Brain size={9} /> Take quiz</span>
                                        }
                                    </div>
                                </div>
                                <button onClick={e => { e.stopPropagation(); removeVideo(video.id); }}
                                    className="absolute top-1 left-1 w-6 h-6 rounded bg-black/60 flex items-center justify-center text-white/0 group-hover:text-white/50 hover:!text-red-400 transition-all">
                                    <Trash2 size={12} />
                                </button>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

// ============================================================
// Main Learning Hub Component
// ============================================================
export default function LearningHub() {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<YouTubeVideo[]>([]);
    const [recommendedVideos, setRecommendedVideos] = useState<YouTubeVideo[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
    const [watchedVideos, setWatchedVideos] = useState<Set<string>>(new Set());
    const [completedQuizzes, setCompletedQuizzes] = useState<Map<string, { score: number; points: number }>>(new Map());
    const [totalPoints, setTotalPoints] = useState(1250);
    const [streak, setStreak] = useState(7);
    const [searchHistory, setSearchHistory] = useState<string[]>(['React tutorial', 'Python basics', 'Machine learning']);
    const [leaderboard, setLeaderboard] = useState(mockLeaderboard);
    // New state for YouTube key + tabs
    const [youtubeApiKey, setYoutubeApiKey] = useState('AIzaSyDwrXOb_52JLUDn8GC3ygKoO5als-eIcmA');
    const [activeTab, setActiveTab] = useState<'discover' | 'my-videos'>('discover');
    const [showKeyPanel, setShowKeyPanel] = useState(false);

    // Load API key from localStorage
    useEffect(() => {
        try {
            const savedKey = localStorage.getItem('vitgroww_yt_api_key');
            if (savedKey) setYoutubeApiKey(savedKey);
            else {
                // Pre-save the built-in key so users see green immediately
                const defaultKey = 'AIzaSyDwrXOb_52JLUDn8GC3ygKoO5als-eIcmA';
                localStorage.setItem('vitgroww_yt_api_key', defaultKey);
            }
        } catch { }
    }, []);

    const saveApiKey = (key: string) => {
        setYoutubeApiKey(key);
        localStorage.setItem('vitgroww_yt_api_key', key);
        setShowKeyPanel(false);
    };


    // Load recommended videos on mount
    useEffect(() => {
        const loadRecommended = async () => {
            setIsLoading(true);
            try {
                const results = await searchYouTubeVideos('programming tutorial', 20);
                setRecommendedVideos(results);
            } catch (error) {
                console.error('Error loading recommended:', error);
            } finally {
                setIsLoading(false);
            }
        };
        loadRecommended();
    }, []);

    const handleSearch = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        setSearchHistory(prev => [searchQuery, ...prev.filter(q => q !== searchQuery).slice(0, 4)]);

        try {
            const results = await searchYouTubeVideos(searchQuery, 50);
            setSearchResults(results);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setIsSearching(false);
        }
    }, [searchQuery]);

    const handleVideoComplete = useCallback((videoId: string) => {
        setWatchedVideos(prev => new Set([...prev, videoId]));
        setTotalPoints(prev => prev + 10);
    }, []);

    const handleQuizComplete = useCallback((quizId: string, score: number, pointsEarned: number) => {
        setCompletedQuizzes(prev => new Map([...prev, [quizId, { score, points: pointsEarned }]]));
        setTotalPoints(prev => prev + pointsEarned);
        setLeaderboard(prev => {
            const updated = [...prev];
            const idx = updated.findIndex(e => e.userId === 'user-3');
            if (idx !== -1) {
                updated[idx] = { ...updated[idx], totalPoints: updated[idx].totalPoints + pointsEarned, quizzesCompleted: updated[idx].quizzesCompleted + 1 };
            }
            updated.sort((a, b) => b.totalPoints - a.totalPoints);
            return updated.map((entry, index) => ({ ...entry, rank: index + 1 }));
        });
    }, []);

    const videos = searchResults.length > 0 ? searchResults : recommendedVideos;

    return (
        <div className="relative h-screen overflow-hidden">
            {/* Animated Background */}
            <div className="fixed inset-0 z-0">
                <Squares direction="diagonal" speed={0.3} borderColor="#1e3a5f" squareSize={50} hoverFillColor="#0ea5e9" />
            </div>

            {/* Content */}
            <div className="relative z-10 h-full flex p-3 md:p-4 gap-3">
                {/* Main Content Area */}
                <div className="flex-1 flex flex-col min-w-0">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3 flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center">
                                <BookOpen size={16} className="text-white" />
                            </div>
                            <h1 className="text-base font-bold text-white flex items-center gap-1.5">
                                Learning Hub <Sparkles size={12} className="text-cyan-400 animate-pulse" />
                            </h1>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="px-2 py-1 rounded-lg bg-cyan-500/20 border border-cyan-500/30 flex items-center gap-1">
                                <Zap size={12} className="text-cyan-400" />
                                <span className="text-xs font-bold text-cyan-400">{totalPoints.toLocaleString()}</span>
                            </div>
                            <div className="px-2 py-1 rounded-lg bg-orange-500/20 border border-orange-500/30 flex items-center gap-1">
                                <Flame size={12} className="text-orange-400" />
                                <span className="text-xs font-bold text-orange-400">{streak}</span>
                            </div>
                            {/* API Key Button */}
                            <button onClick={() => setShowKeyPanel(p => !p)}
                                className={`px-2 py-1 rounded-lg border flex items-center gap-1 text-xs font-medium transition-all ${youtubeApiKey
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse'
                                    }`}>
                                <Key size={11} />
                                {youtubeApiKey ? 'API âœ“' : 'Set API Key'}
                            </button>
                        </div>
                    </div>

                    {/* API Key Panel */}
                    {showKeyPanel && (
                        <YouTubeKeyPanel apiKey={youtubeApiKey} onSave={saveApiKey} />
                    )}

                    {/* Tab Switcher */}
                    <div className="flex items-center gap-1 mb-3 flex-shrink-0 bg-white/[0.03] border border-white/[0.06] rounded-xl p-1 w-fit">
                        <button onClick={() => setActiveTab('discover')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${activeTab === 'discover'
                                ? 'bg-cyan-500/20 text-cyan-400'
                                : 'text-white/30 hover:text-white/60'
                                }`}>
                            <TrendingUp size={12} /> Discover
                        </button>
                        <button onClick={() => setActiveTab('my-videos')}
                            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${activeTab === 'my-videos'
                                ? 'bg-violet-500/20 text-violet-400'
                                : 'text-white/30 hover:text-white/60'
                                }`}>
                            <ListVideo size={12} /> My Videos Quiz
                        </button>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 overflow-hidden flex flex-col min-h-0">

                        {/* Discover Tab */}
                        {activeTab === 'discover' ? (
                            <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                                {isLoading && !searchResults.length ? (
                                    <div className="flex-1 flex items-center justify-center">
                                        <Loader2 size={32} className="text-cyan-400 animate-spin" />
                                    </div>
                                ) : (
                                    <div className="flex-1 flex flex-col min-h-0 gap-3">
                                        {/* Featured Section */}
                                        {videos.length > 0 && (
                                            <div className="flex-shrink-0 grid grid-cols-1 lg:grid-cols-4 gap-3" style={{ maxHeight: '220px' }}>
                                                <div className="lg:col-span-3 relative group cursor-pointer h-full" onClick={() => setSelectedVideo(videos[0])}>
                                                    <div className="relative h-full min-h-[150px] rounded-xl overflow-hidden bg-white/[0.02] border border-white/[0.08]">
                                                        <img src={videos[0].thumbnail} alt={videos[0].title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <div className="w-14 h-14 rounded-full bg-cyan-500/90 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                                                                <Play size={24} className="text-white ml-1" fill="white" />
                                                            </div>
                                                        </div>
                                                        <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] text-white font-medium">{parseDuration(videos[0].duration)}</div>
                                                        {watchedVideos.has(videos[0].id) && (
                                                            <div className="absolute top-2 left-2 w-5 h-5 rounded bg-emerald-500/90 flex items-center justify-center"><CheckCircle size={12} className="text-white" /></div>
                                                        )}
                                                        <div className="absolute bottom-0 left-0 right-0 p-3">
                                                            <h3 className="text-sm font-bold text-white mb-0.5 line-clamp-1">{videos[0].title}</h3>
                                                            <div className="flex items-center gap-2 text-[10px] text-white/60">
                                                                <span>{videos[0].channelTitle}</span><span>â€¢</span>
                                                                <span className="flex items-center gap-0.5"><Eye size={10} /> {formatViewCount(videos[0].viewCount)}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="hidden lg:flex flex-col gap-2 h-full">
                                                    {videos.slice(1, 3).map((video) => (
                                                        <div key={video.id} className="relative group cursor-pointer flex-1" onClick={() => setSelectedVideo(video)}>
                                                            <div className="h-full flex gap-2 p-1.5 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-cyan-500/20 transition-all">
                                                                <div className="relative w-24 h-full min-h-[60px] rounded overflow-hidden flex-shrink-0">
                                                                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                                                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"><Play size={14} className="text-white" fill="white" /></div>
                                                                    <div className="absolute bottom-0.5 right-0.5 px-1 py-0.5 rounded bg-black/80 text-[8px] text-white">{parseDuration(video.duration)}</div>
                                                                </div>
                                                                <div className="flex-1 min-w-0 py-0.5 flex flex-col justify-center">
                                                                    <h4 className="text-[10px] font-medium text-white line-clamp-2 group-hover:text-cyan-400 transition-colors">{video.title}</h4>
                                                                    <p className="text-[8px] text-white/40 mt-0.5">{video.channelTitle}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Video Grid */}
                                        <div className="flex-1 min-h-0 overflow-y-auto">
                                            <div className="flex items-center gap-2 mb-2 sticky top-0 bg-[#02040a]/80 backdrop-blur-sm py-1 z-10">
                                                <TrendingUp size={14} className="text-cyan-400" />
                                                <h3 className="text-xs font-semibold text-white/60">
                                                    {searchResults.length > 0 ? `Results for "${searchQuery}"` : 'Recommended for you'}
                                                </h3>
                                                <span className="text-[10px] text-white/30">({videos.length} videos)</span>
                                            </div>
                                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2">
                                                {videos.slice(searchResults.length > 0 ? 1 : 0).map((video) => (
                                                    <div key={video.id} className="group cursor-pointer" onClick={() => setSelectedVideo(video)}>
                                                        <div className="relative aspect-video rounded-lg overflow-hidden bg-white/[0.02] border border-white/[0.06] group-hover:border-cyan-500/30 transition-all">
                                                            <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <div className="w-8 h-8 rounded-full bg-cyan-500/90 flex items-center justify-center"><Play size={14} className="text-white ml-0.5" fill="white" /></div>
                                                            </div>
                                                            <div className="absolute bottom-0.5 right-0.5 px-1 py-0.5 rounded bg-black/80 text-[8px] text-white">{parseDuration(video.duration)}</div>
                                                            {watchedVideos.has(video.id) && (
                                                                <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded bg-emerald-500/90 flex items-center justify-center"><CheckCircle size={8} className="text-white" /></div>
                                                            )}
                                                            {completedQuizzes.has(`quiz-${video.id}`) && (
                                                                <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded bg-violet-500/90 flex items-center justify-center"><Award size={8} className="text-white" /></div>
                                                            )}
                                                        </div>
                                                        <h4 className="text-[10px] font-medium text-white/80 line-clamp-2 mt-1 group-hover:text-cyan-400 transition-colors">{video.title}</h4>
                                                        <p className="text-[8px] text-white/40 mt-0.5">{video.channelTitle}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* My Videos Tab */
                            <MyVideosTab
                                apiKey={youtubeApiKey}
                                onVideoSelect={setSelectedVideo}
                                watchedVideos={watchedVideos}
                                completedQuizzes={completedQuizzes}
                            />
                        )}
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="hidden xl:flex flex-col w-64 flex-shrink-0 gap-3 overflow-y-auto">
                    <StatsPanel totalPoints={totalPoints} streak={streak} videosWatched={watchedVideos.size} quizzesCompleted={completedQuizzes.size} />
                    <LeaderboardPanel leaderboard={leaderboard} userPoints={totalPoints} />
                    <SkillsHoneycombPanel completedQuizzes={completedQuizzes} watchedVideos={watchedVideos} />
                </div>
            </div>

            {/* Video Player Modal */}
            {selectedVideo && (
                <VideoPlayerModal
                    video={selectedVideo}
                    isOpen={!!selectedVideo}
                    onClose={() => setSelectedVideo(null)}
                    onVideoComplete={handleVideoComplete}
                    onQuizComplete={handleQuizComplete}
                    watched={watchedVideos.has(selectedVideo.id)}
                    completedQuizId={completedQuizzes.has(`quiz-${selectedVideo.id}`) ? `quiz-${selectedVideo.id}` : undefined}
                />
            )}
        </div>
    );
}
