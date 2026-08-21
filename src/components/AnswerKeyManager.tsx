'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText, Sparkles, Plus, Trash2, Printer, Camera, Upload, Download,
    Loader2, Award, BookMarked, BrainCircuit, Save, Copy, CheckCircle2,
    X, ChevronRight, BarChart3, Users, Clock, Star, Lightbulb, Target,
    FileSearch, History, Settings, Share2, MoreVertical, LayoutTemplate,
    GraduationCap, BookOpen, ClipboardCheck, TrendingUp, AlertCircle,
    Zap, Filter, Search, SortAsc, Eye, FileDown, RefreshCw, CheckSquare,
    MessageSquare, PenLine, Calculator
} from 'lucide-react';
import Tesseract from 'tesseract.js';
import confetti from 'canvas-confetti';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY_HERE';

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// â”€â”€ Types â”€â”€
interface PaperQuestion {
    id: string;
    partLabel: string;
    questionText: string;
    marks: number;
    keywords: { word: string; weight: number }[];
    sampleAnswer?: string;
    difficulty: 'easy' | 'medium' | 'hard';
    topic: string;
}

interface GradedAnswer {
    questionId: string;
    studentName: string;
    extractedText: string;
    score: number;
    maxMarks: number;
    feedback: string;
    timestamp: Date;
    confidence: number;
}

interface ExamTemplate {
    id: string;
    name: string;
    title: string;
    course: string;
    maxMarks: number;
    time: string;
    questionCount: number;
    difficulty: string;
}

interface StudyPlan {
    subject: string;
    examType: string;
    daysLeft: number;
    dailyGoals: { day: number; topics: string[]; hours: number; completed: boolean }[];
}

// â”€â”€ Templates â”€â”€
const EXAM_TEMPLATES: ExamTemplate[] = [
    { id: 'cat1', name: 'CAT-1 Standard', title: 'Continuous Assessment Test - I', course: '', maxMarks: 50, time: '1.5 Hours', questionCount: 10, difficulty: 'Mixed' },
    { id: 'cat2', name: 'CAT-2 Standard', title: 'Continuous Assessment Test - II', course: '', maxMarks: 50, time: '1.5 Hours', questionCount: 10, difficulty: 'Mixed' },
    { id: 'fat', name: 'FAT Comprehensive', title: 'Final Assessment Test', course: '', maxMarks: 100, time: '3 Hours', questionCount: 20, difficulty: 'Mixed' },
    { id: 'quiz', name: 'Quick Quiz', title: 'Quiz Assessment', course: '', maxMarks: 20, time: '30 Minutes', questionCount: 10, difficulty: 'Easy-Medium' },
    { id: 'lab', name: 'Lab Exam', title: 'Laboratory Assessment', course: '', maxMarks: 40, time: '2 Hours', questionCount: 8, difficulty: 'Practical' },
];

// â”€â”€ Glass Card Component â”€â”€
function GlassCard({ children, className = '', delay = 0, hover = true, gradient = false }: { children: React.ReactNode; className?: string; delay?: number; hover?: boolean; gradient?: boolean }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.5, type: 'spring', stiffness: 100 }}
            whileHover={hover ? { y: -2, scale: 1.01 } : undefined}
            className={`${gradient ? 'bg-gradient-to-br from-white/[0.08] to-white/[0.02]' : 'bg-white/[0.03]'} backdrop-blur-xl border border-white/[0.06] rounded-2xl overflow-hidden ${className}`}
        >
            {children}
        </motion.div>
    );
}

// â”€â”€ Animated Counter â”€â”€
function AnimatedCounter({ value, duration = 1.5 }: { value: number; duration?: number }) {
    const [count, setCount] = useState(0);
    useEffect(() => {
        let startTime: number;
        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / (duration * 1000), 1);
            setCount(Math.floor(progress * value));
            if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    }, [value, duration]);
    return <span>{count}</span>;
}

// â”€â”€ Confetti Effect â”€â”€
function triggerConfetti() {
    confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b']
    });
}

export default function AnswerKeyManager() {
    const [activeTab, setActiveTab] = useState<'generator' | 'evaluator' | 'prep' | 'analytics'>('generator');
    const [aiGenerating, setAiGenerating] = useState(false);
    const [showWelcome, setShowWelcome] = useState(true);

    // â”€â”€ Tab 1: AI Question Paper Generator â”€â”€
    const [paperTopic, setPaperTopic] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState<ExamTemplate>(EXAM_TEMPLATES[0]);
    const [paperConfig, setPaperConfig] = useState({ title: 'Final Assessment Test (FAT)', course: 'CSE301', maxMarks: 100, time: '3 Hours' });
    const [questions, setQuestions] = useState<PaperQuestion[]>([]);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [savedPapers, setSavedPapers] = useState<{ id: string; name: string; questions: PaperQuestion[]; date: Date }[]>([]);
    const printRef = useRef<HTMLDivElement>(null);

    // Load saved papers on mount
    useEffect(() => {
        const saved = localStorage.getItem('vit-meridian_saved_papers');
        if (saved) {
            try {
                setSavedPapers(JSON.parse(saved).map((p: any) => ({ ...p, date: new Date(p.date) })));
            } catch { }
        }
    }, []);

    const generateQuestions = async () => {
        if (!paperTopic.trim()) return;
        setAiGenerating(true);
        try {
            const prompt = `Generate ${selectedTemplate.questionCount} high-quality ${selectedTemplate.difficulty} difficulty university-level exam questions about: "${paperTopic}". 
            Return ONLY a valid JSON array of objects with structure: [{"partLabel": "PART A", "questionText": "...", "marks": ${selectedTemplate.maxMarks / selectedTemplate.questionCount}, "difficulty": "easy|medium|hard", "topic": "specific topic"}, ...]. 
            Include a mix of MCQs, short answer, and descriptive questions. Do NOT wrap in markdown.`;

            const res = await fetch(GEMINI_URL, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const data = await res.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            if (!text) throw new Error("No response");

            const parsed = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
            const newQs = parsed.map((q: any, i: number) => ({
                id: `q${Date.now()}${i}`,
                partLabel: q.partLabel || 'PART A',
                questionText: q.questionText,
                marks: q.marks || Math.round(selectedTemplate.maxMarks / selectedTemplate.questionCount),
                keywords: [],
                difficulty: q.difficulty || 'medium',
                topic: q.topic || paperTopic
            }));

            setQuestions([...questions, ...newQs]);
            triggerConfetti();
        } catch (e) {
            alert('Failed to generate questions. Check topic or API limit.');
        } finally {
            setAiGenerating(false);
        }
    };

    const savePaper = () => {
        if (questions.length === 0) return;
        const newPaper = {
            id: `paper-${Date.now()}`,
            name: `${paperConfig.course} - ${paperConfig.title}`,
            questions,
            date: new Date()
        };
        const updated = [newPaper, ...savedPapers];
        setSavedPapers(updated);
        localStorage.setItem('vit-meridian_saved_papers', JSON.stringify(updated));
        triggerConfetti();
    };

    const loadPaper = (paper: typeof savedPapers[0]) => {
        setQuestions(paper.questions);
    };

    const deletePaper = (id: string) => {
        const updated = savedPapers.filter(p => p.id !== id);
        setSavedPapers(updated);
        localStorage.setItem('vit-meridian_saved_papers', JSON.stringify(updated));
    };

    const exportPaper = (format: 'pdf' | 'json' | 'docx') => {
        if (questions.length === 0) return;

        if (format === 'json') {
            const dataStr = JSON.stringify({ ...paperConfig, questions }, null, 2);
            const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
            const exportFileDefaultName = `${paperConfig.course}_paper.json`;
            const linkElement = document.createElement('a');
            linkElement.setAttribute('href', dataUri);
            linkElement.setAttribute('download', exportFileDefaultName);
            linkElement.click();
        } else if (format === 'pdf') {
            handlePrint();
        }
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        if (!printWindow || !printRef.current) return;
        printWindow.document.write(`
            <html><head><title>${paperConfig.title}</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
                body { font-family: 'Inter', sans-serif; padding: 40px; color: #1a1a1a; background: #fff; }
                .header { text-align: center; margin-bottom: 30px; padding-bottom: 20px; border-bottom: 3px solid #2563eb; }
                .header h1 { font-size: 24px; font-weight: 700; margin-bottom: 8px; color: #1e3a5f; }
                .header h2 { font-size: 18px; font-weight: 600; color: #4b5563; }
                .meta { display: flex; justify-content: space-between; padding: 15px 0; margin-bottom: 30px; background: #f8fafc; border-radius: 8px; padding: 15px 20px; }
                .meta-item { text-align: center; }
                .meta-label { font-size: 11px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.5px; }
                .meta-value { font-size: 14px; font-weight: 600; color: #1e3a5f; margin-top: 4px; }
                .section { margin-bottom: 30px; }
                .section-title { font-size: 14px; font-weight: 700; color: #2563eb; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 1px; }
                .q-row { display: flex; align-items: flex-start; margin-bottom: 20px; padding: 15px; background: #f8fafc; border-radius: 8px; border-left: 4px solid #2563eb; }
                .q-number { font-weight: 700; color: #2563eb; margin-right: 12px; min-width: 30px; }
                .q-content { flex: 1; }
                .q-text { font-size: 13px; line-height: 1.6; color: #374151; margin-bottom: 8px; }
                .q-meta { display: flex; gap: 15px; font-size: 11px; color: #6b7280; }
                .marks { background: #dbeafe; color: #1e40af; padding: 2px 10px; border-radius: 12px; font-weight: 600; }
                .difficulty { text-transform: capitalize; }
                .difficulty.easy { color: #059669; }
                .difficulty.medium { color: #d97706; }
                .difficulty.hard { color: #dc2626; }
                .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; font-size: 11px; color: #9ca3af; }
                @media print { body { padding: 20px; } }
            </style></head><body>
            <div class="header">
                <h1>VIT University</h1>
                <h2>${paperConfig.title}</h2>
            </div>
            <div class="meta">
                <div class="meta-item"><div class="meta-label">Course</div><div class="meta-value">${paperConfig.course}</div></div>
                <div class="meta-item"><div class="meta-label">Duration</div><div class="meta-value">${paperConfig.time}</div></div>
                <div class="meta-item"><div class="meta-label">Max Marks</div><div class="meta-value">${paperConfig.maxMarks}</div></div>
                <div class="meta-item"><div class="meta-label">Total Questions</div><div class="meta-value">${questions.length}</div></div>
            </div>
            <div class="section">
                <div class="section-title">Questions</div>
                ${questions.map((q, i) => `
                    <div class="q-row">
                        <div class="q-number">Q${i + 1}</div>
                        <div class="q-content">
                            <div class="q-text">${q.questionText}</div>
                            <div class="q-meta">
                                <span class="marks">${q.marks} Marks</span>
                                <span class="difficulty ${q.difficulty}">${q.difficulty}</span>
                                <span>${q.topic}</span>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
            <div class="footer">Best of luck! Â· Generated with VIT-MERIDIAN Academic Toolkit</div>
            <script>window.print();</script></body></html>
        `);
        printWindow.document.close();
    };

    // â”€â”€ Tab 2: AI Grading Evaluator â”€â”€
    const [gradingQuestionId, setGradingQuestionId] = useState<string>('');
    const [studentName, setStudentName] = useState('');
    const [extractedText, setExtractedText] = useState('');
    const [ocrProgress, setOcrProgress] = useState(0);
    const [gradedResults, setGradedResults] = useState<GradedAnswer[]>([]);
    const [batchMode, setBatchMode] = useState(false);
    const [batchFiles, setBatchFiles] = useState<File[]>([]);
    const fileRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = async (file: File) => {
        setOcrProgress(1);
        try {
            const result = await Tesseract.recognize(file, 'eng', {
                logger: m => { if (m.status === 'recognizing text') setOcrProgress(Math.round(m.progress * 100)); }
            });
            setExtractedText(result.data.text.trim());
        } catch {
            setExtractedText('OCR Failed. Please type manually.');
        } finally {
            setOcrProgress(0);
        }
    };

    const evaluateAnswer = async () => {
        const q = questions.find(q => q.id === gradingQuestionId);
        if (!q || !extractedText.trim() || !studentName.trim()) return alert('Select question, enter student name, and provide answer text.');

        setAiGenerating(true);
        try {
            const prompt = `Act as a strict university professor. Evaluate the following student answer.
            Question: "${q.questionText}" (Max Marks: ${q.marks})
            Model Answer / Keywords context: "${q.sampleAnswer || q.keywords.map(k => k.word).join(', ') || 'N/A'}"
            Student Answer: "${extractedText}"
            
            Return ONLY valid JSON: {"score": <number between 0 and ${q.marks}>, "feedback": "<detailed feedback>", "confidence": <0-100>}
            No markdown wrap.`;

            const res = await fetch(GEMINI_URL, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const data = await res.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            const parsed = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());

            const result: GradedAnswer = {
                questionId: q.id,
                studentName,
                extractedText,
                score: parsed.score,
                maxMarks: q.marks,
                feedback: parsed.feedback,
                timestamp: new Date(),
                confidence: parsed.confidence || 85
            };

            setGradedResults(prev => [result, ...prev]);
            setExtractedText('');
            setStudentName('');
            triggerConfetti();
        } catch (e) {
            alert('AI evaluation failed.');
        } finally {
            setAiGenerating(false);
        }
    };

    const classAvg = gradedResults.length > 0
        ? Math.round((gradedResults.reduce((s, r) => s + (r.score / r.maxMarks) * 100, 0)) / gradedResults.length)
        : 0;

    const exportGrades = () => {
        if (gradedResults.length === 0) return;
        const csv = [
            ['Student', 'Question', 'Score', 'Max Marks', 'Percentage', 'Feedback', 'Date'].join(','),
            ...gradedResults.map(r => [
                r.studentName,
                questions.find(q => q.id === r.questionId)?.questionText.substring(0, 50) || 'Unknown',
                r.score,
                r.maxMarks,
                ((r.score / r.maxMarks) * 100).toFixed(1),
                `"${r.feedback.replace(/"/g, '""')}"`,
                r.timestamp.toLocaleDateString()
            ].join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `grades_${paperConfig.course}_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
    };

    // â”€â”€ Tab 3: Smart Exam Prep â”€â”€
    const [prepCourse, setPrepCourse] = useState('');
    const [prepType, setPrepType] = useState('CAT1');
    const [prepData, setPrepData] = useState<{ topics: string[], questions: { q: string, a: string }[] } | null>(null);
    const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
    const [daysLeft, setDaysLeft] = useState(7);

    const generatePrep = async () => {
        if (!prepCourse.trim()) return;
        setAiGenerating(true);
        try {
            const prompt = `Act as an exam prep AI. I am preparing for ${prepType} in ${prepCourse}.
            Return ONLY valid JSON: {"topics": ["topic 1", "topic 2", "topic 3", "topic 4", "topic 5"], "questions": [{"q": "Question 1", "a": "Short answer 1"}, {"q": "Question 2", "a": "Short answer 2"}, {"q": "Question 3", "a": "Short answer 3"}]}
            No markdown wrap.`;

            const res = await fetch(GEMINI_URL, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
            });
            const data = await res.json();
            const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
            const parsed = JSON.parse(text.replace(/```json/g, '').replace(/```/g, '').trim());
            setPrepData(parsed);

            // Generate study plan
            const dailyGoals = Array.from({ length: daysLeft }, (_, i) => ({
                day: i + 1,
                topics: parsed.topics.slice(i % parsed.topics.length, (i % parsed.topics.length) + 2),
                hours: 3 + Math.floor(Math.random() * 3),
                completed: false
            }));
            setStudyPlan({ subject: prepCourse, examType: prepType, daysLeft, dailyGoals });
        } catch (e) {
            alert('Failed to generate prep materials.');
        } finally {
            setAiGenerating(false);
        }
    };

    // â”€â”€ Tab 4: Analytics â”€â”€
    const stats = useMemo(() => {
        const totalQuestions = questions.length;
        const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
        const avgDifficulty = questions.length > 0 ? questions.filter(q => q.difficulty === 'medium').length / questions.length : 0;
        const byTopic = questions.reduce((acc, q) => {
            acc[q.topic] = (acc[q.topic] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return { totalQuestions, totalMarks, avgDifficulty, byTopic };
    }, [questions]);

    // â”€â”€ Tabs Config â”€â”€
    const tabs = [
        { id: 'generator' as const, label: 'Generator', icon: FileText, color: 'emerald', desc: 'Create question papers' },
        { id: 'evaluator' as const, label: 'Grading', icon: Award, color: 'blue', desc: 'AI-powered evaluation' },
        { id: 'prep' as const, label: 'Prep & Plan', icon: BookMarked, color: 'violet', desc: 'Study strategy' },
        { id: 'analytics' as const, label: 'Analytics', icon: BarChart3, color: 'amber', desc: 'Performance insights' },
    ];

    return (
        <div className="space-y-6 h-[calc(100vh-140px)] flex flex-col overflow-hidden">
            {/* Welcome Modal */}
            <AnimatePresence>
                {showWelcome && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowWelcome(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-[#0c0f17] rounded-3xl p-8 max-w-lg w-full mx-4 border border-white/[0.08] shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="text-center">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-violet-500/30">
                                    <BrainCircuit size={40} className="text-white" />
                                </div>
                                <h2 className="text-2xl font-bold text-white mb-2">Welcome to Academic Toolkit</h2>
                                <p className="text-white/50 mb-6">Your AI-powered companion for creating papers, grading answers, and exam preparation.</p>
                                <div className="grid grid-cols-3 gap-3 mb-6">
                                    {[
                                        { icon: FileText, label: 'Generate', desc: 'AI questions' },
                                        { icon: Award, label: 'Grade', desc: 'Auto-evaluation' },
                                        { icon: BookMarked, label: 'Prepare', desc: 'Smart study' },
                                    ].map((item, i) => (
                                        <div key={i} className="p-3 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                                            <item.icon size={20} className="text-cyan-400 mx-auto mb-2" />
                                            <p className="text-white/70 text-xs font-medium">{item.label}</p>
                                            <p className="text-white/30 text-[10px]">{item.desc}</p>
                                        </div>
                                    ))}
                                </div>
                                <button
                                    onClick={() => setShowWelcome(false)}
                                    className="w-full py-3 bg-gradient-to-r from-cyan-500 to-violet-500 text-white font-semibold rounded-xl hover:opacity-90 transition-opacity"
                                >
                                    Get Started
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <motion.div
                        whileHover={{ rotate: 360, scale: 1.1 }}
                        transition={{ duration: 0.5 }}
                        className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center shadow-lg shadow-violet-500/30 border border-white/10"
                    >
                        <BrainCircuit size={28} className="text-white" />
                    </motion.div>
                    <div>
                        <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">Academic Toolkit</h2>
                        <p className="text-white/40 text-sm">AI Question Generation â€¢ Smart Grading â€¢ Exam Prep</p>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="flex gap-4">
                    <div className="px-4 py-2 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                        <p className="text-white/30 text-[10px] uppercase tracking-wider">Questions</p>
                        <p className="text-xl font-bold text-emerald-400"><AnimatedCounter value={stats.totalQuestions} /></p>
                    </div>
                    <div className="px-4 py-2 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                        <p className="text-white/30 text-[10px] uppercase tracking-wider">Graded</p>
                        <p className="text-xl font-bold text-blue-400"><AnimatedCounter value={gradedResults.length} /></p>
                    </div>
                    <div className="px-4 py-2 bg-white/[0.03] rounded-xl border border-white/[0.06]">
                        <p className="text-white/30 text-[10px] uppercase tracking-wider">Saved</p>
                        <p className="text-xl font-bold text-violet-400"><AnimatedCounter value={savedPapers.length} /></p>
                    </div>
                </div>
            </div>

            {/* Enhanced Tabs */}
            <div className="flex gap-2 p-1.5 bg-white/[0.02] backdrop-blur-md rounded-2xl w-fit flex-shrink-0 border border-white/[0.05]">
                {tabs.map((tab, i) => (
                    <motion.button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`relative px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id
                            ? `bg-gradient-to-r from-${tab.color}-500/20 to-${tab.color}-500/10 text-${tab.color}-400 border border-${tab.color}-500/30`
                            : 'text-white/40 hover:text-white/80 hover:bg-white/[0.04] border border-transparent'
                            }`}
                    >
                        <tab.icon size={16} />
                        <span>{tab.label}</span>
                        {activeTab === tab.id && (
                            <motion.div
                                layoutId="activeTab"
                                className={`absolute inset-0 bg-${tab.color}-500/10 rounded-xl -z-10`}
                            />
                        )}
                    </motion.button>
                ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pb-6">
                <AnimatePresence mode="wait">
                    {/* TAB 1: GENERATOR */}
                    {activeTab === 'generator' && (
                        <motion.div
                            key="gen"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                        >
                            {/* Left: Main Content */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* AI Generate Panel */}
                                <GlassCard className="p-6" gradient>
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                            <Sparkles size={20} className="text-emerald-400" />
                                            AI Question Generator
                                        </h3>
                                        <button
                                            onClick={() => setShowTemplateModal(true)}
                                            className="px-3 py-1.5 bg-white/[0.05] text-white/60 text-xs rounded-lg hover:bg-white/[0.08] transition-colors flex items-center gap-1"
                                        >
                                            <LayoutTemplate size={12} />
                                            {selectedTemplate.name}
                                        </button>
                                    </div>

                                    {/* Template Info */}
                                    <div className="grid grid-cols-4 gap-3 mb-4">
                                        {[
                                            { label: 'Questions', value: selectedTemplate.questionCount, icon: FileText },
                                            { label: 'Marks', value: selectedTemplate.maxMarks, icon: Target },
                                            { label: 'Time', value: selectedTemplate.time, icon: Clock },
                                            { label: 'Level', value: selectedTemplate.difficulty, icon: Star },
                                        ].map((stat, i) => (
                                            <div key={i} className="p-3 bg-white/[0.03] rounded-xl border border-white/[0.05]">
                                                <stat.icon size={14} className="text-emerald-400/60 mb-1" />
                                                <p className="text-lg font-bold text-white">{stat.value}</p>
                                                <p className="text-[10px] text-white/30">{stat.label}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <textarea
                                        value={paperTopic}
                                        onChange={(e) => setPaperTopic(e.target.value)}
                                        placeholder="Describe your subject, syllabus topics, or paste curriculum content..."
                                        className="w-full bg-black/30 border border-white/[0.08] rounded-xl p-4 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-emerald-500/40 resize-none transition-all mb-4"
                                        rows={4}
                                    />

                                    <div className="flex gap-3">
                                        <button
                                            onClick={generateQuestions}
                                            disabled={!paperTopic.trim() || aiGenerating}
                                            className="flex-1 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-30 transition-all shadow-lg shadow-emerald-500/20"
                                        >
                                            {aiGenerating ? <><Loader2 size={18} className="animate-spin" /> Generating...</> : <><Sparkles size={18} /> Generate Questions</>}
                                        </button>
                                        {questions.length > 0 && (
                                            <button
                                                onClick={savePaper}
                                                className="px-4 py-3.5 bg-white/[0.05] text-white/70 rounded-xl hover:bg-white/[0.08] transition-colors"
                                                title="Save Paper"
                                            >
                                                <Save size={18} />
                                            </button>
                                        )}
                                    </div>
                                </GlassCard>

                                {/* Questions List */}
                                {questions.length > 0 && (
                                    <GlassCard className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="text-base font-bold text-white">Generated Questions ({questions.length})</h3>
                                            <div className="flex gap-2">
                                                <button onClick={() => exportPaper('json')} className="px-3 py-1.5 text-xs bg-white/[0.05] text-white/60 rounded-lg hover:bg-white/[0.08]">
                                                    <Download size={12} className="inline mr-1" /> JSON
                                                </button>
                                                <button onClick={() => exportPaper('pdf')} className="px-3 py-1.5 text-xs bg-white/[0.05] text-white/60 rounded-lg hover:bg-white/[0.08]">
                                                    <Printer size={12} className="inline mr-1" /> PDF
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-3 max-h-[400px] overflow-y-auto custom-scrollbar">
                                            {questions.map((q, i) => (
                                                <motion.div
                                                    initial={{ opacity: 0, x: -20 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    key={q.id}
                                                    className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.06] relative group hover:border-emerald-500/30 transition-colors"
                                                >
                                                    <div className="flex gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold flex-shrink-0">
                                                            {i + 1}
                                                        </div>
                                                        <div className="flex-1">
                                                            <p className="text-white/80 text-sm mb-2">{q.questionText}</p>
                                                            <div className="flex items-center gap-3 text-[11px]">
                                                                <span className="px-2 py-0.5 bg-emerald-500/15 text-emerald-400 rounded">{q.marks} Marks</span>
                                                                <span className={`px-2 py-0.5 rounded ${q.difficulty === 'easy' ? 'bg-green-500/15 text-green-400' : q.difficulty === 'medium' ? 'bg-amber-500/15 text-amber-400' : 'bg-rose-500/15 text-rose-400'}`}>
                                                                    {q.difficulty}
                                                                </span>
                                                                <span className="text-white/30">{q.topic}</span>
                                                            </div>
                                                        </div>
                                                        <button
                                                            onClick={() => setQuestions(qs => qs.filter(x => x.id !== q.id))}
                                                            className="opacity-0 group-hover:opacity-100 p-2 text-white/20 hover:text-red-400 transition-all"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </GlassCard>
                                )}
                            </div>

                            {/* Right: Sidebar */}
                            <div className="space-y-6">
                                {/* Paper Settings */}
                                <GlassCard className="p-5">
                                    <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-4">Paper Settings</h3>
                                    <div className="space-y-3">
                                        {[
                                            { k: 'title', l: 'Exam Title', icon: FileText },
                                            { k: 'course', l: 'Course Code', icon: BookOpen },
                                            { k: 'time', l: 'Duration', icon: Clock },
                                            { k: 'maxMarks', l: 'Max Marks', icon: Target },
                                        ].map(f => (
                                            <div key={f.k}>
                                                <label className="text-white/30 text-[10px] uppercase tracking-wider block mb-1">{f.l}</label>
                                                <input
                                                    value={(paperConfig as any)[f.k]}
                                                    onChange={e => setPaperConfig({ ...paperConfig, [f.k]: e.target.value })}
                                                    className="w-full bg-black/30 border border-white/[0.06] rounded-lg px-3 py-2 text-sm text-white/90 outline-none focus:border-emerald-500/40 transition-colors"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </GlassCard>

                                {/* Saved Papers */}
                                <GlassCard className="p-5">
                                    <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-4">Saved Papers ({savedPapers.length})</h3>
                                    <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar">
                                        {savedPapers.length === 0 ? (
                                            <p className="text-white/20 text-xs text-center py-4">No saved papers yet</p>
                                        ) : (
                                            savedPapers.map(paper => (
                                                <div key={paper.id} className="p-3 bg-white/[0.03] rounded-lg border border-white/[0.05] flex items-center justify-between group">
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-white/70 text-xs font-medium truncate">{paper.name}</p>
                                                        <p className="text-white/30 text-[10px]">{paper.questions.length} questions Â· {paper.date.toLocaleDateString()}</p>
                                                    </div>
                                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button onClick={() => loadPaper(paper)} className="p-1.5 text-white/40 hover:text-emerald-400"><Upload size={12} /></button>
                                                        <button onClick={() => deletePaper(paper.id)} className="p-1.5 text-white/40 hover:text-red-400"><Trash2 size={12} /></button>
                                                    </div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </GlassCard>
                            </div>
                        </motion.div>
                    )}

                    {/* TAB 2: EVALUATOR */}
                    {activeTab === 'evaluator' && (
                        <motion.div
                            key="eval"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="grid grid-cols-1 lg:grid-cols-2 gap-6"
                        >
                            {/* Left: Grading Form */}
                            <div className="space-y-6">
                                <GlassCard className="p-6" gradient>
                                    <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                                        <Camera size={20} className="text-blue-400" />
                                        Submit Answer
                                    </h3>

                                    <select
                                        value={gradingQuestionId}
                                        onChange={e => setGradingQuestionId(e.target.value)}
                                        className="w-full bg-black/30 border border-white/[0.06] rounded-xl p-3 mb-3 text-sm text-white outline-none focus:border-blue-500/40"
                                    >
                                        <option value="">Select Question to Grade</option>
                                        {questions.map((q, i) => (
                                            <option key={q.id} value={q.id}>Q{i + 1}: {q.questionText.substring(0, 50)}...</option>
                                        ))}
                                    </select>

                                    <input
                                        value={studentName}
                                        onChange={e => setStudentName(e.target.value)}
                                        placeholder="Student Name"
                                        className="w-full bg-black/30 border border-white/[0.06] rounded-xl p-3 mb-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-blue-500/40"
                                    />

                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        ref={fileRef}
                                        onChange={e => { if (e.target.files?.[0]) handleImageUpload(e.target.files[0]); }}
                                    />

                                    <button
                                        onClick={() => fileRef.current?.click()}
                                        className="w-full p-6 border-2 border-dashed border-white/[0.08] rounded-xl hover:border-blue-500/30 hover:bg-blue-500/5 transition-all text-center group mb-3"
                                    >
                                        <Upload size={24} className="text-white/20 group-hover:text-blue-400 mx-auto mb-2 transition-colors" />
                                        <span className="text-sm text-white/40">Upload handwritten answer</span>
                                    </button>

                                    {ocrProgress > 0 && (
                                        <div className="mb-3">
                                            <div className="flex justify-between text-xs text-white/40 mb-1">
                                                <span>OCR Processing</span>
                                                <span>{ocrProgress}%</span>
                                            </div>
                                            <div className="h-1 bg-white/[0.06] rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${ocrProgress}%` }}
                                                    className="h-full bg-blue-500 rounded-full"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    <textarea
                                        value={extractedText}
                                        onChange={e => setExtractedText(e.target.value)}
                                        placeholder="Extracted text will appear here..."
                                        className="w-full bg-black/30 border border-white/[0.06] rounded-xl p-4 min-h-[100px] text-sm text-white/80 focus:border-blue-500/40 outline-none resize-none mb-3"
                                    />

                                    <button
                                        onClick={evaluateAnswer}
                                        disabled={aiGenerating || !extractedText || !studentName || !gradingQuestionId}
                                        className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-30 transition-all shadow-lg shadow-blue-500/20"
                                    >
                                        {aiGenerating ? <><Loader2 size={18} className="animate-spin" /> Evaluating...</> : <><Award size={18} /> Grade Answer</>}
                                    </button>
                                </GlassCard>
                            </div>

                            {/* Right: Results */}
                            <div className="space-y-6">
                                {/* Class Stats */}
                                <GlassCard className="p-6" gradient>
                                    <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider mb-4">Class Performance</h3>
                                    <div className="flex items-center gap-4">
                                        <div className="relative w-20 h-20">
                                            <svg className="w-20 h-20 -rotate-90">
                                                <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                                                <motion.circle
                                                    cx="40" cy="40" r="36" fill="none"
                                                    stroke="#3b82f6" strokeWidth="6" strokeLinecap="round"
                                                    initial={{ strokeDasharray: "0 226" }}
                                                    animate={{ strokeDasharray: `${classAvg * 2.26} 226` }}
                                                    transition={{ duration: 1 }}
                                                />
                                            </svg>
                                            <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white">{classAvg}%</span>
                                        </div>
                                        <div>
                                            <p className="text-white/70 font-medium">Class Average</p>
                                            <p className="text-white/30 text-xs">{gradedResults.length} evaluations</p>
                                        </div>
                                    </div>
                                </GlassCard>

                                {/* Results List */}
                                <GlassCard className="p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-sm font-bold text-white/50 uppercase tracking-wider">Recent Evaluations</h3>
                                        {gradedResults.length > 0 && (
                                            <button onClick={exportGrades} className="text-xs text-blue-400 hover:text-blue-300">
                                                <Download size={12} className="inline mr-1" /> Export
                                            </button>
                                        )}
                                    </div>
                                    <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar">
                                        {gradedResults.length === 0 ? (
                                            <div className="text-center py-8">
                                                <Award size={32} className="text-white/10 mx-auto mb-2" />
                                                <p className="text-white/30 text-xs">No evaluations yet</p>
                                            </div>
                                        ) : (
                                            gradedResults.map((r, i) => (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.05 }}
                                                    key={i}
                                                    className="p-3 bg-white/[0.03] rounded-xl border border-white/[0.05]"
                                                >
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <p className="text-white/80 text-sm font-medium">{r.studentName}</p>
                                                            <p className="text-white/30 text-[10px]">{r.timestamp.toLocaleString()}</p>
                                                        </div>
                                                        <span className={`text-lg font-bold ${r.score / r.maxMarks >= 0.7 ? 'text-emerald-400' : r.score / r.maxMarks >= 0.5 ? 'text-amber-400' : 'text-rose-400'}`}>
                                                            {r.score}/{r.maxMarks}
                                                        </span>
                                                    </div>
                                                    <p className="text-white/40 text-xs leading-relaxed">{r.feedback}</p>
                                                    {r.confidence && (
                                                        <div className="mt-2 flex items-center gap-2">
                                                            <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden">
                                                                <div className="h-full bg-blue-500 rounded-full" style={{ width: `${r.confidence}%` }} />
                                                            </div>
                                                            <span className="text-[10px] text-white/30">{r.confidence}% conf</span>
                                                        </div>
                                                    )}
                                                </motion.div>
                                            ))
                                        )}
                                    </div>
                                </GlassCard>
                            </div>
                        </motion.div>
                    )}

                    {/* TAB 3: PREP & PLAN */}
                    {activeTab === 'prep' && (
                        <motion.div
                            key="prep"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="max-w-4xl mx-auto space-y-6"
                        >
                            {/* Generate Section */}
                            <GlassCard className="p-8" gradient>
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-violet-500/20">
                                        <BookMarked size={32} className="text-white" />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2">Smart Exam Preparation</h3>
                                    <p className="text-white/40 text-sm">AI will analyze your course and predict important topics</p>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mb-6">
                                    <select
                                        value={prepType}
                                        onChange={e => setPrepType(e.target.value)}
                                        className="bg-black/30 border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-violet-500/40"
                                    >
                                        <option value="CAT1">CAT-1</option>
                                        <option value="CAT2">CAT-2</option>
                                        <option value="FAT">FAT</option>
                                    </select>
                                    <input
                                        type="number"
                                        value={daysLeft}
                                        onChange={e => setDaysLeft(parseInt(e.target.value) || 7)}
                                        placeholder="Days left"
                                        className="bg-black/30 border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-violet-500/40"
                                    />
                                    <input
                                        value={prepCourse}
                                        onChange={e => setPrepCourse(e.target.value)}
                                        placeholder="Course name"
                                        className="bg-black/30 border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-violet-500/40"
                                    />
                                </div>

                                <button
                                    onClick={generatePrep}
                                    disabled={aiGenerating || !prepCourse}
                                    className="w-full py-3.5 bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white font-semibold rounded-xl flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-30 transition-all shadow-lg shadow-violet-500/20"
                                >
                                    {aiGenerating ? <><Loader2 size={18} className="animate-spin" /> Analyzing...</> : <><Sparkles size={18} /> Generate Study Plan</>}
                                </button>
                            </GlassCard>

                            {/* Results */}
                            {prepData && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                >
                                    {/* Topics */}
                                    <GlassCard className="p-6">
                                        <h4 className="text-sm font-bold text-violet-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <Target size={16} /> Predicted Topics
                                        </h4>
                                        <div className="space-y-2">
                                            {prepData.topics.map((t, i) => (
                                                <motion.div
                                                    initial={{ opacity: 0, x: -10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: i * 0.1 }}
                                                    key={i}
                                                    className="flex items-center gap-3 p-3 bg-white/[0.03] rounded-xl border border-white/[0.05]"
                                                >
                                                    <div className="w-7 h-7 rounded-lg bg-violet-500/15 text-violet-400 flex items-center justify-center text-xs font-bold">
                                                        {i + 1}
                                                    </div>
                                                    <span className="text-white/80 text-sm">{t}</span>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </GlassCard>

                                    {/* Expected Questions */}
                                    <GlassCard className="p-6">
                                        <h4 className="text-sm font-bold text-fuchsia-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                            <Lightbulb size={16} /> Expected Questions
                                        </h4>
                                        <div className="space-y-3">
                                            {prepData.questions.map((q, i) => (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    transition={{ delay: i * 0.1 }}
                                                    key={i}
                                                    className="p-4 bg-white/[0.03] rounded-xl border border-white/[0.05]"
                                                >
                                                    <p className="text-white/80 text-sm font-medium mb-2">{q.q}</p>
                                                    <p className="text-white/40 text-xs leading-relaxed border-l-2 border-fuchsia-500/30 pl-3">{q.a}</p>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </GlassCard>

                                    {/* Study Plan */}
                                    {studyPlan && (
                                        <GlassCard className="p-6 md:col-span-2">
                                            <h4 className="text-sm font-bold text-cyan-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                                                <Clock size={16} /> {daysLeft}-Day Study Schedule
                                            </h4>
                                            <div className="grid grid-cols-7 gap-2">
                                                {studyPlan.dailyGoals.map((day, i) => (
                                                    <motion.div
                                                        initial={{ opacity: 0, scale: 0.9 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        transition={{ delay: i * 0.05 }}
                                                        key={i}
                                                        className={`p-3 rounded-xl border text-center cursor-pointer transition-colors ${day.completed
                                                            ? 'bg-emerald-500/15 border-emerald-500/30'
                                                            : 'bg-white/[0.03] border-white/[0.06] hover:border-cyan-500/30'
                                                            }`}
                                                        onClick={() => {
                                                            const updated = { ...studyPlan };
                                                            updated.dailyGoals[i].completed = !updated.dailyGoals[i].completed;
                                                            setStudyPlan(updated);
                                                        }}
                                                    >
                                                        <p className="text-white/40 text-[10px] mb-1">Day {day.day}</p>
                                                        <p className="text-white/70 text-[11px] font-medium mb-1">{day.hours}h</p>
                                                        {day.completed && <CheckCircle2 size={12} className="text-emerald-400 mx-auto" />}
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </GlassCard>
                                    )}
                                </motion.div>
                            )}
                        </motion.div>
                    )}

                    {/* TAB 4: ANALYTICS */}
                    {activeTab === 'analytics' && (
                        <motion.div
                            key="analytics"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="space-y-6"
                        >
                            {/* Stats Grid */}
                            <div className="grid grid-cols-4 gap-4">
                                {[
                                    { label: 'Total Questions', value: stats.totalQuestions, icon: FileText, color: 'emerald' },
                                    { label: 'Total Marks', value: stats.totalMarks, icon: Target, color: 'blue' },
                                    { label: 'Graded Papers', value: gradedResults.length, icon: Award, color: 'violet' },
                                    { label: 'Avg Score', value: classAvg, suffix: '%', icon: TrendingUp, color: 'amber' },
                                ].map((stat, i) => (
                                    <GlassCard key={i} className="p-5">
                                        <stat.icon size={20} className={`text-${stat.color}-400 mb-3`} />
                                        <p className="text-2xl font-bold text-white">
                                            <AnimatedCounter value={stat.value} />
                                            {stat.suffix}
                                        </p>
                                        <p className="text-white/30 text-xs">{stat.label}</p>
                                    </GlassCard>
                                ))}
                            </div>

                            {/* Topic Distribution */}
                            {Object.keys(stats.byTopic).length > 0 && (
                                <GlassCard className="p-6">
                                    <h3 className="text-base font-bold text-white mb-4">Topic Distribution</h3>
                                    <div className="space-y-3">
                                        {Object.entries(stats.byTopic).map(([topic, count], i) => (
                                            <div key={i} className="flex items-center gap-4">
                                                <span className="text-white/60 text-sm w-32 truncate">{topic}</span>
                                                <div className="flex-1 h-2 bg-white/[0.06] rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${(count / stats.totalQuestions) * 100}%` }}
                                                        transition={{ delay: i * 0.1 }}
                                                        className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full"
                                                    />
                                                </div>
                                                <span className="text-white/40 text-xs w-8">{count}</span>
                                            </div>
                                        ))}
                                    </div>
                                </GlassCard>
                            )}

                            {/* Recent Activity */}
                            <GlassCard className="p-6">
                                <h3 className="text-base font-bold text-white mb-4">Recent Activity</h3>
                                <div className="space-y-3">
                                    {gradedResults.slice(0, 5).map((r, i) => (
                                        <div key={i} className="flex items-center gap-4 p-3 bg-white/[0.03] rounded-xl">
                                            <div className={`w-2 h-2 rounded-full ${r.score / r.maxMarks >= 0.7 ? 'bg-emerald-400' : r.score / r.maxMarks >= 0.5 ? 'bg-amber-400' : 'bg-rose-400'}`} />
                                            <div className="flex-1">
                                                <p className="text-white/70 text-sm">{r.studentName}</p>
                                                <p className="text-white/30 text-xs">{r.timestamp.toLocaleString()}</p>
                                            </div>
                                            <span className="text-white font-bold">{r.score}/{r.maxMarks}</span>
                                        </div>
                                    ))}
                                    {gradedResults.length === 0 && (
                                        <p className="text-white/20 text-sm text-center py-4">No activity yet</p>
                                    )}
                                </div>
                            </GlassCard>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Hidden Print Ref */}
            <div ref={printRef} className="hidden" />
        </div>
    );
}




