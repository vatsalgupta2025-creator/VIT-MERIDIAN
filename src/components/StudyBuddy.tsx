'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    BookOpenCheck, Sparkles, Loader2, Trash2, Save, RefreshCw, Plus,
    Brain, Lightbulb, CheckCircle2, XCircle, ChevronLeft, ChevronRight,
    Layers, RotateCcw, Zap, Target, Award, FileText, Copy, BookOpen
} from 'lucide-react';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'AIzaSyD2Q4_VL9jOzpgcDBXW3m0dfwoNec-T0LI';

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

interface Flashcard {
    id: string;
    front: string;
    back: string;
    reviewed: boolean;
    correct: boolean | null;
}

interface Deck {
    id: string;
    name: string;
    topic: string;
    cards: Flashcard[];
    createdAt: Date;
}

interface QuizQuestion {
    question: string;
    options: string[];
    correct: number;
    explanation: string;
}

export default function StudyBuddy() {
    const [activeTab, setActiveTab] = useState<'flashcards' | 'summary' | 'quiz'>('flashcards');
    const [inputText, setInputText] = useState('');
    const [generating, setGenerating] = useState(false);

    // Flashcard state
    const [cards, setCards] = useState<Flashcard[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [flipped, setFlipped] = useState(false);
    const [savedDecks, setSavedDecks] = useState<Deck[]>([]);

    // Summary state
    const [summary, setSummary] = useState<{ title: string; points: string[]; keywords: string[] } | null>(null);

    // Quiz state
    const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
    const [quizIndex, setQuizIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
    const [quizScore, setQuizScore] = useState(0);
    const [quizComplete, setQuizComplete] = useState(false);

    // Load saved decks
    useEffect(() => {
        const saved = localStorage.getItem('vitgroww_flashcard_decks');
        if (saved) {
            try {
                setSavedDecks(JSON.parse(saved).map((d: any) => ({ ...d, createdAt: new Date(d.createdAt) })));
            } catch { }
        }
    }, []);

    const generateFlashcards = async () => {
        if (!inputText.trim()) return;
        setGenerating(true);
        try {
            const prompt = `Create 8 study flashcards from these notes/topic: "${inputText}". 
            Return ONLY valid JSON array: [{"front": "Question or concept", "back": "Clear answer or explanation"}]. No markdown.`;

            const res = await fetch(GEMINI_URL, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const data = await res.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) throw new Error('No response');

            const parsed = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
            const newCards = parsed.map((c: any, i: number) => ({
                id: `card-${Date.now()}-${i}`,
                front: c.front,
                back: c.back,
                reviewed: false,
                correct: null
            }));
            setCards(newCards);
            setCurrentIndex(0);
            setFlipped(false);
        } catch {
            alert('Failed to generate flashcards.');
        } finally {
            setGenerating(false);
        }
    };

    const generateSummary = async () => {
        if (!inputText.trim()) return;
        setGenerating(true);
        try {
            const prompt = `Summarize these notes/topic concisely: "${inputText}".
            Return ONLY valid JSON: {"title": "Topic Title", "points": ["Key point 1", "Key point 2", ...], "keywords": ["keyword1", "keyword2", ...]}. No markdown.`;

            const res = await fetch(GEMINI_URL, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const data = await res.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            const parsed = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
            setSummary(parsed);
        } catch {
            alert('Failed to generate summary.');
        } finally {
            setGenerating(false);
        }
    };

    const generateQuiz = async () => {
        if (!inputText.trim()) return;
        setGenerating(true);
        try {
            const prompt = `Create 5 MCQ quiz questions from: "${inputText}".
            Return ONLY valid JSON array: [{"question": "...", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "brief reason"}]. No markdown.`;

            const res = await fetch(GEMINI_URL, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const data = await res.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            const parsed = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
            setQuizQuestions(parsed);
            setQuizIndex(0);
            setQuizScore(0);
            setQuizComplete(false);
            setSelectedAnswer(null);
        } catch {
            alert('Failed to generate quiz.');
        } finally {
            setGenerating(false);
        }
    };

    const saveDeck = () => {
        if (cards.length === 0) return;
        const deck: Deck = {
            id: `deck-${Date.now()}`,
            name: inputText.substring(0, 40),
            topic: inputText.substring(0, 100),
            cards,
            createdAt: new Date()
        };
        const updated = [deck, ...savedDecks];
        setSavedDecks(updated);
        localStorage.setItem('vitgroww_flashcard_decks', JSON.stringify(updated));
    };

    const loadDeck = (deck: Deck) => {
        setCards(deck.cards);
        setCurrentIndex(0);
        setFlipped(false);
    };

    const deleteDeck = (id: string) => {
        const updated = savedDecks.filter(d => d.id !== id);
        setSavedDecks(updated);
        localStorage.setItem('vitgroww_flashcard_decks', JSON.stringify(updated));
    };

    const markCard = (correct: boolean) => {
        const updated = [...cards];
        updated[currentIndex] = { ...updated[currentIndex], reviewed: true, correct };
        setCards(updated);
        setFlipped(false);
        if (currentIndex < cards.length - 1) {
            setTimeout(() => setCurrentIndex(currentIndex + 1), 300);
        }
    };

    const handleQuizAnswer = (idx: number) => {
        if (selectedAnswer !== null) return;
        setSelectedAnswer(idx);
        if (idx === quizQuestions[quizIndex].correct) {
            setQuizScore(quizScore + 1);
        }
    };

    const nextQuizQuestion = () => {
        if (quizIndex < quizQuestions.length - 1) {
            setQuizIndex(quizIndex + 1);
            setSelectedAnswer(null);
        } else {
            setQuizComplete(true);
        }
    };

    const reviewed = cards.filter(c => c.reviewed).length;
    const correctCount = cards.filter(c => c.correct === true).length;

    const tabs = [
        { id: 'flashcards' as const, label: 'Flashcards', icon: Layers, color: 'cyan' },
        { id: 'summary' as const, label: 'Summary', icon: FileText, color: 'emerald' },
        { id: 'quiz' as const, label: 'Quiz', icon: Target, color: 'violet' },
    ];

    return (
        <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-4 flex-shrink-0">
                <motion.div
                    whileHover={{ rotate: 360, scale: 1.1 }}
                    transition={{ duration: 0.5 }}
                    className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30 border border-white/10"
                >
                    <BookOpenCheck size={28} className="text-white" />
                </motion.div>
                <div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">AI Study Buddy</h2>
                    <p className="text-white/40 text-sm">Generate flashcards, summaries & quizzes from your notes</p>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1.5 bg-white/[0.02] backdrop-blur-md rounded-2xl w-fit flex-shrink-0 border border-white/[0.05]">
                {tabs.map(tab => (
                    <motion.button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${activeTab === tab.id
                            ? `bg-${tab.color}-500/20 text-${tab.color}-400 border border-${tab.color}-500/30`
                            : 'text-white/40 hover:text-white/80 border border-transparent'}`}
                    >
                        <tab.icon size={16} /> {tab.label}
                    </motion.button>
                ))}
            </div>

            {/* Input Area */}
            <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5 flex-shrink-0">
                <textarea
                    value={inputText}
                    onChange={e => setInputText(e.target.value)}
                    placeholder="Paste your notes, topic name, or syllabus content here..."
                    className="w-full bg-black/30 border border-white/[0.08] rounded-xl p-4 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-cyan-500/40 resize-none transition-all"
                    rows={3}
                />
                <div className="flex gap-3 mt-3">
                    <button
                        onClick={activeTab === 'flashcards' ? generateFlashcards : activeTab === 'summary' ? generateSummary : generateQuiz}
                        disabled={!inputText.trim() || generating}
                        className="flex-1 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-30 transition-all shadow-lg shadow-cyan-500/20"
                    >
                        {generating ? <><Loader2 size={18} className="animate-spin" /> Generating...</> : <><Sparkles size={18} /> Generate {activeTab === 'flashcards' ? 'Flashcards' : activeTab === 'summary' ? 'Summary' : 'Quiz'}</>}
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-6">
                <AnimatePresence mode="wait">
                    {/* FLASHCARDS TAB */}
                    {activeTab === 'flashcards' && (
                        <motion.div key="fc" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-6">
                                {cards.length === 0 ? (
                                    <div className="bg-white/[0.03] rounded-2xl border border-dashed border-white/[0.08] p-16 text-center">
                                        <Brain size={48} className="text-white/10 mx-auto mb-4" />
                                        <p className="text-white/30 text-sm">Paste your notes above and generate flashcards to start studying</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Progress */}
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                                                <motion.div
                                                    animate={{ width: `${(reviewed / cards.length) * 100}%` }}
                                                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                                                />
                                            </div>
                                            <span className="text-white/50 text-xs">{reviewed}/{cards.length}</span>
                                            <span className="text-emerald-400 text-xs font-bold">{correctCount} ✓</span>
                                        </div>

                                        {/* Card */}
                                        <div className="perspective-1000">
                                            <motion.div
                                                onClick={() => setFlipped(!flipped)}
                                                animate={{ rotateY: flipped ? 180 : 0 }}
                                                transition={{ duration: 0.6, type: 'spring' }}
                                                style={{ transformStyle: 'preserve-3d' }}
                                                className="relative w-full h-[280px] cursor-pointer"
                                            >
                                                {/* Front */}
                                                <div
                                                    className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 backdrop-blur-xl border border-cyan-500/20 rounded-3xl p-8 flex flex-col items-center justify-center text-center"
                                                    style={{ backfaceVisibility: 'hidden' }}
                                                >
                                                    <span className="px-3 py-1 bg-cyan-500/20 text-cyan-400 text-[10px] font-bold rounded-full mb-4">QUESTION · Card {currentIndex + 1}/{cards.length}</span>
                                                    <p className="text-white/90 text-lg font-medium leading-relaxed">{cards[currentIndex]?.front}</p>
                                                    <p className="text-white/20 text-xs mt-4">Click to flip</p>
                                                </div>
                                                {/* Back */}
                                                <div
                                                    className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/5 backdrop-blur-xl border border-emerald-500/20 rounded-3xl p-8 flex flex-col items-center justify-center text-center"
                                                    style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                                                >
                                                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded-full mb-4">ANSWER</span>
                                                    <p className="text-white/90 text-base leading-relaxed">{cards[currentIndex]?.back}</p>
                                                </div>
                                            </motion.div>
                                        </div>

                                        {/* Controls */}
                                        <div className="flex items-center justify-center gap-4">
                                            <button onClick={() => { setCurrentIndex(Math.max(0, currentIndex - 1)); setFlipped(false); }} disabled={currentIndex === 0}
                                                className="p-3 bg-white/[0.05] rounded-xl hover:bg-white/[0.08] disabled:opacity-20 transition-all">
                                                <ChevronLeft size={20} className="text-white/60" />
                                            </button>
                                            <button onClick={() => markCard(false)}
                                                className="px-5 py-3 bg-rose-500/15 text-rose-400 rounded-xl hover:bg-rose-500/25 transition-all flex items-center gap-2">
                                                <XCircle size={18} /> Need Review
                                            </button>
                                            <button onClick={() => markCard(true)}
                                                className="px-5 py-3 bg-emerald-500/15 text-emerald-400 rounded-xl hover:bg-emerald-500/25 transition-all flex items-center gap-2">
                                                <CheckCircle2 size={18} /> Got It
                                            </button>
                                            <button onClick={() => { setCurrentIndex(Math.min(cards.length - 1, currentIndex + 1)); setFlipped(false); }} disabled={currentIndex === cards.length - 1}
                                                className="p-3 bg-white/[0.05] rounded-xl hover:bg-white/[0.08] disabled:opacity-20 transition-all">
                                                <ChevronRight size={20} className="text-white/60" />
                                            </button>
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Sidebar: Saved Decks */}
                            <div className="space-y-4">
                                {cards.length > 0 && (
                                    <button onClick={saveDeck} className="w-full py-3 bg-white/[0.05] text-white/70 rounded-xl hover:bg-white/[0.08] transition-all flex items-center justify-center gap-2 border border-white/[0.06]">
                                        <Save size={16} /> Save Deck
                                    </button>
                                )}
                                <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-5">
                                    <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-4">Saved Decks ({savedDecks.length})</h3>
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                                        {savedDecks.length === 0 ? (
                                            <p className="text-white/20 text-xs text-center py-4">No saved decks</p>
                                        ) : savedDecks.map(deck => (
                                            <div key={deck.id} className="p-3 bg-white/[0.03] rounded-xl border border-white/[0.05] group">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-white/70 text-xs font-medium truncate">{deck.name}</p>
                                                        <p className="text-white/30 text-[10px]">{deck.cards.length} cards</p>
                                                    </div>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => loadDeck(deck)} className="p-1.5 text-white/40 hover:text-cyan-400"><RefreshCw size={12} /></button>
                                                        <button onClick={() => deleteDeck(deck.id)} className="p-1.5 text-white/40 hover:text-red-400"><Trash2 size={12} /></button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* SUMMARY TAB */}
                    {activeTab === 'summary' && (
                        <motion.div key="sum" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-3xl mx-auto space-y-6">
                            {!summary ? (
                                <div className="bg-white/[0.03] rounded-2xl border border-dashed border-white/[0.08] p-16 text-center">
                                    <Lightbulb size={48} className="text-white/10 mx-auto mb-4" />
                                    <p className="text-white/30 text-sm">Generate a smart summary of your notes</p>
                                </div>
                            ) : (
                                <>
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 backdrop-blur-xl border border-emerald-500/20 rounded-2xl p-6">
                                        <h3 className="text-xl font-bold text-white mb-1">{summary.title}</h3>
                                        <div className="flex gap-2 mt-3 flex-wrap">
                                            {summary.keywords.map((kw, i) => (
                                                <span key={i} className="px-2.5 py-1 bg-emerald-500/15 text-emerald-400 text-[10px] rounded-full font-medium">{kw}</span>
                                            ))}
                                        </div>
                                    </motion.div>
                                    <div className="space-y-3">
                                        {summary.points.map((point, i) => (
                                            <motion.div key={i} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                                                className="flex items-start gap-3 p-4 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                                                <div className="w-7 h-7 bg-emerald-500/15 text-emerald-400 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</div>
                                                <p className="text-white/80 text-sm leading-relaxed">{point}</p>
                                            </motion.div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )}

                    {/* QUIZ TAB */}
                    {activeTab === 'quiz' && (
                        <motion.div key="quiz" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="max-w-2xl mx-auto space-y-6">
                            {quizQuestions.length === 0 ? (
                                <div className="bg-white/[0.03] rounded-2xl border border-dashed border-white/[0.08] p-16 text-center">
                                    <Target size={48} className="text-white/10 mx-auto mb-4" />
                                    <p className="text-white/30 text-sm">Generate a quiz from your notes to test yourself</p>
                                </div>
                            ) : quizComplete ? (
                                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-gradient-to-br from-violet-500/10 to-fuchsia-500/5 backdrop-blur-xl border border-violet-500/20 rounded-3xl p-10 text-center">
                                    <Award size={64} className="text-violet-400 mx-auto mb-4" />
                                    <h3 className="text-3xl font-bold text-white mb-2">Quiz Complete!</h3>
                                    <p className="text-5xl font-black bg-gradient-to-r from-cyan-400 to-violet-400 bg-clip-text text-transparent my-4">{quizScore}/{quizQuestions.length}</p>
                                    <p className="text-white/50 mb-6">{quizScore === quizQuestions.length ? 'Perfect score! 🎉' : quizScore >= quizQuestions.length * 0.7 ? 'Great job! 🌟' : 'Keep practicing! 💪'}</p>
                                    <button onClick={() => { setQuizIndex(0); setQuizScore(0); setQuizComplete(false); setSelectedAnswer(null); }}
                                        className="px-6 py-3 bg-violet-500/20 text-violet-400 rounded-xl hover:bg-violet-500/30 transition-all flex items-center gap-2 mx-auto">
                                        <RotateCcw size={16} /> Retry Quiz
                                    </button>
                                </motion.div>
                            ) : (
                                <>
                                    {/* Progress */}
                                    <div className="flex items-center gap-3">
                                        {quizQuestions.map((_, i) => (
                                            <div key={i} className={`flex-1 h-1.5 rounded-full ${i < quizIndex ? 'bg-violet-500' : i === quizIndex ? 'bg-violet-400/50' : 'bg-white/[0.06]'}`} />
                                        ))}
                                    </div>

                                    {/* Question */}
                                    <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-6">
                                        <span className="text-violet-400 text-xs font-bold">Question {quizIndex + 1} of {quizQuestions.length}</span>
                                        <p className="text-white/90 text-lg font-medium mt-3 mb-6">{quizQuestions[quizIndex].question}</p>
                                        <div className="space-y-3">
                                            {quizQuestions[quizIndex].options.map((opt, i) => (
                                                <motion.button key={i} whileHover={selectedAnswer === null ? { scale: 1.01 } : {}} whileTap={selectedAnswer === null ? { scale: 0.99 } : {}}
                                                    onClick={() => handleQuizAnswer(i)}
                                                    className={`w-full p-4 rounded-xl text-left text-sm transition-all flex items-center gap-3 ${selectedAnswer === null
                                                        ? 'bg-white/[0.03] border border-white/[0.06] hover:border-violet-500/30 text-white/80'
                                                        : i === quizQuestions[quizIndex].correct
                                                            ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-400'
                                                            : i === selectedAnswer
                                                                ? 'bg-rose-500/15 border border-rose-500/30 text-rose-400'
                                                                : 'bg-white/[0.02] border border-white/[0.04] text-white/30'
                                                        }`}>
                                                    <span className="w-7 h-7 rounded-lg bg-white/[0.06] flex items-center justify-center text-xs font-bold flex-shrink-0">
                                                        {String.fromCharCode(65 + i)}
                                                    </span>
                                                    {opt}
                                                </motion.button>
                                            ))}
                                        </div>

                                        {selectedAnswer !== null && (
                                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-4 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                                                <p className="text-white/50 text-xs">{quizQuestions[quizIndex].explanation}</p>
                                                <button onClick={nextQuizQuestion} className="mt-3 px-5 py-2 bg-violet-500/20 text-violet-400 rounded-lg hover:bg-violet-500/30 text-sm transition-all">
                                                    {quizIndex < quizQuestions.length - 1 ? 'Next Question →' : 'See Results'}
                                                </button>
                                            </motion.div>
                                        )}
                                    </div>
                                </>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
