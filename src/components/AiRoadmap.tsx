'use client';

import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Sparkles, Map as MapIcon, Target, Clock, ArrowRight, CheckCircle2, ChevronRight, BookOpen, Layers, AlertCircle, Play } from 'lucide-react';
import { searchYouTubeVideos } from '@/lib/youtubeApi';
import { YouTubeVideo } from '@/types/learning';

interface RoadmapStep {
    id: string;
    title: string;
    description: string;
    duration: string;
    resources: string[];
    isCompleted?: boolean;
}

interface RoadmapData {
    topic: string;
    overview: string;
    estimatedTotalTime: string;
    difficulty: string;
    steps: RoadmapStep[];
}

export default function AiRoadmap() {
    const [topic, setTopic] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [roadmap, setRoadmap] = useState<RoadmapData | null>(null);
    const [stepVideos, setStepVideos] = useState<Record<string, YouTubeVideo[]>>({});
    const [error, setError] = useState<string | null>(null);

    const fetchVideosForRoadmap = async (data: RoadmapData) => {
        const newVideos: Record<string, YouTubeVideo[]> = {};

        // Fetch specific tutorials for each roadmap step contextually in parallel
        await Promise.all(data.steps.map(async (step) => {
            try {
                // Combine the overarching topic with the specific step title for accurate search
                const query = `${data.topic} ${step.title}`;
                const videos = await searchYouTubeVideos(query, 2);
                newVideos[step.id] = videos;
            } catch (e) {
                console.error("Failed to fetch related videos for step", step.id, e);
            }
        }));

        setStepVideos(newVideos);
    };

    const generateRoadmap = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!topic.trim()) return;

        const GEMINI_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY_HERE';

        setIsGenerating(true);
        setError(null);

        try {
            const genAI = new GoogleGenerativeAI(GEMINI_KEY);
            const model = genAI.getGenerativeModel({
                model: 'gemini-1.5-flash',
                generationConfig: {
                    responseMimeType: "application/json",
                }
            });

            const prompt = `You are an expert educational planner and curriculum designer. 
            The user wants to learn exactly this topic: "${topic}".
            
            Generate a highly detailed, chronological, and practical learning roadmap for them.
            It must be properly plannable and working.
            
            Respond STRICTLY in the following JSON format:
            {
                "topic": "The standardized name of the topic",
                "overview": "A 2-3 sentence engaging overview of what they will achieve",
                "estimatedTotalTime": "e.g., '3 Months', '4 Weeks', '100 Hours'",
                "difficulty": "Beginner, Intermediate, or Advanced",
                "steps": [
                    {
                        "id": "step1",
                        "title": "Clear, actionable title for the phase",
                        "description": "2-3 sentences explaining exactly what to study and build.",
                        "duration": "e.g., 'Week 1', '10 Hours'",
                        "resources": ["Specific Book Name", "Specific YouTube Channel or Course concept"]
                    }
                ]
            }
            Ensure the steps array has at least 4-6 highly detailed, sequential steps.`;

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();

            // Parse JSON response (cleaning up potential markdown wrap from Gemini)
            const cleanJson = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
            const parsedData = JSON.parse(cleanJson) as RoadmapData;

            // Initialize completion state internally
            parsedData.steps = parsedData.steps.map(step => ({ ...step, isCompleted: false }));

            setRoadmap(parsedData);
            setTopic('');

            // Trigger parallel YouTube fetching immediately without blocking
            fetchVideosForRoadmap(parsedData);

        } catch (err: any) {
            console.error(err);
            setError("Failed to generate the roadmap. Please try again or rephrase the topic.");
        } finally {
            setIsGenerating(false);
        }
    };

    const toggleStepCompletion = (stepId: string) => {
        if (!roadmap) return;
        setRoadmap({
            ...roadmap,
            steps: roadmap.steps.map(step =>
                step.id === stepId ? { ...step, isCompleted: !step.isCompleted } : step
            )
        });
    };

    const calculateProgress = () => {
        if (!roadmap || roadmap.steps.length === 0) return 0;
        const completed = roadmap.steps.filter(s => s.isCompleted).length;
        return Math.round((completed / roadmap.steps.length) * 100);
    };

    return (
        <div className="space-y-6 animate-in">
            {/* Header & Input Section */}
            <div className="bg-[#0A0D15] rounded-3xl p-8 border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="relative z-10 max-w-2xl">
                    <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-emerald-400 mb-2 flex items-center gap-3">
                        <MapIcon className="text-cyan-400" size={32} />
                        AI Learning Roadmap
                    </h2>
                    <p className="text-white/60 mb-8 text-lg">
                        Tell us what you want to learn. Our AI will generate a structured, chronological curriculum tailored just for you.
                    </p>

                    <form onSubmit={generateRoadmap} className="flex gap-4">
                        <div className="flex-1 relative">
                            <Layers className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
                            <input
                                type="text"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="E.g., Full Stack Web Development, Python for Data Science..."
                                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 focus:bg-white/10 transition-all font-medium"
                                disabled={isGenerating}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isGenerating || !topic.trim()}
                            className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-emerald-500 text-white rounded-2xl font-bold hover:shadow-[0_0_30px_rgba(34,211,238,0.3)] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2 shrink-0 group"
                        >
                            {isGenerating ? (
                                <>
                                    <Sparkles className="animate-pulse" size={20} />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    Generate Plan
                                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-4 p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-2 text-sm">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}
                </div>
            </div>

            {/* AI Generation Loader */}
            {isGenerating && !roadmap && (
                <div className="bg-[#0A0D15] rounded-3xl p-12 border border-white/10 text-center relative overflow-hidden">
                    <div className="w-16 h-16 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto mb-6" />
                    <h3 className="text-xl font-bold text-white mb-2">Architecting your path...</h3>
                    <p className="text-white/40">Analyzing prerequisites and compiling best resources for {topic}</p>
                </div>
            )}

            {/* Generated Roadmap Display */}
            {!isGenerating && roadmap && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Left Column: Flowchart Timeline */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-bold text-white">Your Path to Mastery</h3>
                            <div className="text-sm font-medium text-cyan-400 bg-cyan-500/10 px-4 py-2 rounded-xl">
                                {calculateProgress()}% Completed
                            </div>
                        </div>

                        <div className="relative border-l-2 border-white/10 ml-6 space-y-8 pb-4">
                            {roadmap.steps.map((step, index) => (
                                <div key={step.id} className="relative pl-8">
                                    {/* Timeline Node */}
                                    <button
                                        onClick={() => toggleStepCompletion(step.id)}
                                        className={`absolute -left-[17px] top-1 w-8 h-8 rounded-full border-4 border-[#040812] flex items-center justify-center transition-all duration-300 ${step.isCompleted ? 'bg-emerald-500 text-white' : 'bg-white/10 text-transparent hover:bg-white/20'
                                            }`}
                                    >
                                        <CheckCircle2 size={16} />
                                    </button>

                                    {/* Content Card */}
                                    <div className={`bg-white/[0.02] border border-white/[0.05] rounded-2xl p-6 transition-all duration-300 ${step.isCompleted ? 'opacity-50 grayscale' : 'hover:bg-white/[0.04]'
                                        }`}>
                                        <div className="flex items-start justify-between gap-4 mb-4">
                                            <div>
                                                <div className="text-cyan-400 text-sm font-semibold mb-1 uppercase tracking-wider flex items-center gap-2">
                                                    Phase {index + 1}
                                                    <span className="w-1 h-1 rounded-full bg-white/20" />
                                                    {step.duration}
                                                </div>
                                                <h4 className={`text-xl font-bold ${step.isCompleted ? 'text-white/60 line-through' : 'text-white'}`}>
                                                    {step.title}
                                                </h4>
                                            </div>
                                        </div>

                                        <p className="text-white/60 text-sm leading-relaxed mb-6">
                                            {step.description}
                                        </p>

                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <h5 className="text-xs font-semibold text-white/40 uppercase tracking-wider flex items-center gap-1">
                                                    <BookOpen size={12} />
                                                    Suggested Concepts
                                                </h5>
                                                <div className="flex flex-wrap gap-2">
                                                    {step.resources.map((res, i) => (
                                                        <span key={i} className="px-3 py-1.5 bg-black/40 border border-white/10 rounded-lg text-xs text-white/70">
                                                            {res}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* YouTube Videos Integration */}
                                            {stepVideos[step.id] && stepVideos[step.id].length > 0 && (
                                                <div className="space-y-2 pt-2 border-t border-white/5">
                                                    <h5 className="text-xs font-semibold text-white/40 uppercase tracking-wider flex items-center gap-1 mb-3">
                                                        <Play size={12} />
                                                        Recommended Tutorials
                                                    </h5>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                        {stepVideos[step.id].map(video => (
                                                            <a
                                                                key={video.id}
                                                                href={`https://www.youtube.com/watch?v=${video.id}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="flex items-center gap-3 p-2 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.05] hover:border-cyan-500/30 transition-all group"
                                                            >
                                                                <div className="relative w-24 aspect-video rounded-lg overflow-hidden shrink-0">
                                                                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover" />
                                                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                                        <Play size={14} className="text-white" fill="white" />
                                                                    </div>
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <h6 className="text-xs font-medium text-white/90 line-clamp-2 group-hover:text-cyan-400 transition-colors">{video.title}</h6>
                                                                    <p className="text-[10px] text-white/40 mt-1 line-clamp-1">{video.channelTitle}</p>
                                                                </div>
                                                            </a>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column: Overview Card */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-gradient-to-b from-cyan-500/10 to-emerald-500/10 border border-cyan-500/20 rounded-3xl p-6 sticky top-6">
                            <h3 className="text-xl font-bold text-white mb-6 text-center">Roadmap Overview</h3>

                            <div className="space-y-6">
                                <div>
                                    <h4 className="text-sm font-medium text-white/40 mb-1">Target Skill</h4>
                                    <p className="text-lg font-bold text-cyan-400">{roadmap.topic}</p>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-white/40 mb-2">Mission Brief</h4>
                                    <p className="text-sm text-white/70 leading-relaxed bg-black/20 p-4 rounded-xl border border-white/5">
                                        {roadmap.overview}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                                        <Clock className="text-emerald-400 mb-2" size={20} />
                                        <h4 className="text-xs font-medium text-white/40 mb-1">Timeline</h4>
                                        <p className="font-bold text-white">{roadmap.estimatedTotalTime}</p>
                                    </div>
                                    <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                                        <Target className="text-rose-400 mb-2" size={20} />
                                        <h4 className="text-xs font-medium text-white/40 mb-1">Difficulty</h4>
                                        <p className="font-bold text-white">{roadmap.difficulty}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}


