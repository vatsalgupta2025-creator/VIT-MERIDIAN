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
} from 'lucide-react';
import { YouTubeVideo, Quiz } from '@/types/learning';
import { mockLeaderboard, parseDuration, formatViewCount, mockSkills } from '@/data/learningData';
import { searchYouTubeVideos } from '@/lib/youtubeApi';
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

    const handleGenerateQuiz = async () => {
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

                        {!isCompleted ? (
                            <div className="text-center py-8">
                                <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mx-auto mb-3">
                                    <Lock size={24} className="text-white/20" />
                                </div>
                                <p className="text-white/40 text-xs">Complete video to unlock</p>
                            </div>
                        ) : completedQuizId ? (
                            <div className="text-center py-8">
                                <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                                    <CheckCircle size={24} className="text-emerald-400" />
                                </div>
                                <h5 className="text-base font-bold text-white mb-1">Done!</h5>
                            </div>
                        ) : !quiz ? (
                            <div className="text-center py-6">
                                {isGeneratingQuiz ? (
                                    <>
                                        <Loader2 size={28} className="text-cyan-400 animate-spin mx-auto mb-3" />
                                        <p className="text-white/60 text-xs">Generating quiz...</p>
                                    </>
                                ) : (
                                    <>
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-3">
                                            <Target size={24} className="text-violet-400" />
                                        </div>
                                        <h5 className="text-sm font-bold text-white mb-1">Ready?</h5>
                                        <p className="text-white/40 text-xs mb-3">5 questions • Earn XP</p>
                                        <button onClick={handleGenerateQuiz} className="px-4 py-2 bg-gradient-to-r from-violet-500 to-cyan-500 text-white rounded-lg font-medium text-sm">
                                            Start Quiz
                                        </button>
                                    </>
                                )}
                            </div>
                        ) : !quizStarted ? (
                            <div className="space-y-3">
                                <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                    <h5 className="font-bold text-white mb-1 text-xs">{quiz.title}</h5>
                                    <p className="text-[10px] text-white/60">📝 {quiz.questions.length} questions • ⏱️ {quiz.timeLimit} min</p>
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
                    {/* Header - Compact */}
                    <div className="flex items-center justify-between mb-3 flex-shrink-0">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-violet-600 flex items-center justify-center">
                                <BookOpen size={16} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-base font-bold text-white flex items-center gap-1.5">
                                    Learning Hub
                                    <Sparkles size={12} className="text-cyan-400 animate-pulse" />
                                </h1>
                            </div>
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
                        </div>
                    </div>

                    {/* Search Bar - Compact */}
                    <form onSubmit={handleSearch} className="flex gap-2 mb-3 flex-shrink-0">
                        <div className="flex-1 relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search video lectures..."
                                className="w-full pl-9 pr-3 py-2.5 bg-white/[0.03] border border-white/[0.08] rounded-xl text-white text-sm placeholder-white/30 focus:outline-none focus:border-cyan-500/50 transition-all"
                            />
                        </div>
                        <button type="submit" disabled={isSearching} className="px-4 py-2.5 bg-cyan-500 text-black rounded-xl font-bold text-sm hover:bg-cyan-400 disabled:opacity-50 flex items-center gap-1.5">
                            {isSearching ? <Loader2 size={14} className="animate-spin" /> : <Search size={14} />}
                        </button>
                    </form>

                    {/* Search History - Compact */}
                    {searchHistory.length > 0 && (
                        <div className="flex items-center gap-2 mb-3 flex-shrink-0 overflow-x-auto pb-1">
                            <History size={12} className="text-white/30 flex-shrink-0" />
                            {searchHistory.map((query, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => { setSearchQuery(query); }}
                                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-white/[0.03] border border-white/[0.06] text-[10px] text-white/40 hover:text-cyan-400 hover:border-cyan-500/30 transition-all whitespace-nowrap"
                                >
                                    {query}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Main Content - Fill remaining space */}
                    <div className="flex-1 overflow-hidden flex flex-col min-h-0">
                        {isLoading && !searchResults.length ? (
                            <div className="flex-1 flex items-center justify-center">
                                <Loader2 size={32} className="text-cyan-400 animate-spin" />
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col min-h-0 gap-3">
                                {/* Featured Section - Fixed height */}
                                {videos.length > 0 && (
                                    <div className="flex-shrink-0 grid grid-cols-1 lg:grid-cols-4 gap-3" style={{ maxHeight: '220px' }}>
                                        {/* Main Featured Video */}
                                        <div
                                            className="lg:col-span-3 relative group cursor-pointer h-full"
                                            onClick={() => setSelectedVideo(videos[0])}
                                        >
                                            <div className="relative h-full min-h-[150px] rounded-xl overflow-hidden bg-white/[0.02] border border-white/[0.08]">
                                                <img
                                                    src={videos[0].thumbnail}
                                                    alt={videos[0].title}
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div className="w-14 h-14 rounded-full bg-cyan-500/90 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                                                        <Play size={24} className="text-white ml-1" fill="white" />
                                                    </div>
                                                </div>

                                                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/80 text-[10px] text-white font-medium">
                                                    {parseDuration(videos[0].duration)}
                                                </div>

                                                {watchedVideos.has(videos[0].id) && (
                                                    <div className="absolute top-2 left-2 w-5 h-5 rounded bg-emerald-500/90 flex items-center justify-center">
                                                        <CheckCircle size={12} className="text-white" />
                                                    </div>
                                                )}

                                                <div className="absolute bottom-0 left-0 right-0 p-3">
                                                    <h3 className="text-sm font-bold text-white mb-0.5 line-clamp-1">{videos[0].title}</h3>
                                                    <div className="flex items-center gap-2 text-[10px] text-white/60">
                                                        <span>{videos[0].channelTitle}</span>
                                                        <span>•</span>
                                                        <span className="flex items-center gap-0.5"><Eye size={10} /> {formatViewCount(videos[0].viewCount)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Side Videos */}
                                        <div className="hidden lg:flex flex-col gap-2 h-full">
                                            {videos.slice(1, 3).map((video) => (
                                                <div
                                                    key={video.id}
                                                    className="relative group cursor-pointer flex-1"
                                                    onClick={() => setSelectedVideo(video)}
                                                >
                                                    <div className="h-full flex gap-2 p-1.5 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:bg-white/[0.04] hover:border-cyan-500/20 transition-all">
                                                        <div className="relative w-24 h-full min-h-[60px] rounded overflow-hidden flex-shrink-0">
                                                            <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                <Play size={14} className="text-white" fill="white" />
                                                            </div>
                                                            <div className="absolute bottom-0.5 right-0.5 px-1 py-0.5 rounded bg-black/80 text-[8px] text-white">
                                                                {parseDuration(video.duration)}
                                                            </div>
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

                                {/* Video Grid - Scrollable */}
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
                                            <div
                                                key={video.id}
                                                className="group cursor-pointer"
                                                onClick={() => setSelectedVideo(video)}
                                            >
                                                <div className="relative aspect-video rounded-lg overflow-hidden bg-white/[0.02] border border-white/[0.06] group-hover:border-cyan-500/30 transition-all">
                                                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <div className="w-8 h-8 rounded-full bg-cyan-500/90 flex items-center justify-center">
                                                            <Play size={14} className="text-white ml-0.5" fill="white" />
                                                        </div>
                                                    </div>
                                                    <div className="absolute bottom-0.5 right-0.5 px-1 py-0.5 rounded bg-black/80 text-[8px] text-white">
                                                        {parseDuration(video.duration)}
                                                    </div>
                                                    {watchedVideos.has(video.id) && (
                                                        <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded bg-emerald-500/90 flex items-center justify-center">
                                                            <CheckCircle size={8} className="text-white" />
                                                        </div>
                                                    )}
                                                    {completedQuizzes.has(`quiz-${video.id}`) && (
                                                        <div className="absolute top-0.5 right-0.5 w-4 h-4 rounded bg-violet-500/90 flex items-center justify-center">
                                                            <Award size={8} className="text-white" />
                                                        </div>
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
                </div>

                {/* Right Sidebar - Leaderboard & Skills */}
                <div className="hidden xl:flex flex-col w-64 flex-shrink-0 gap-3 overflow-y-auto">
                    {/* Stats Panel */}
                    <StatsPanel
                        totalPoints={totalPoints}
                        streak={streak}
                        videosWatched={watchedVideos.size}
                        quizzesCompleted={completedQuizzes.size}
                    />

                    {/* Leaderboard */}
                    <LeaderboardPanel
                        leaderboard={leaderboard}
                        userPoints={totalPoints}
                    />

                    {/* Skills Honeycomb */}
                    <SkillsHoneycombPanel
                        completedQuizzes={completedQuizzes}
                        watchedVideos={watchedVideos}
                    />
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
