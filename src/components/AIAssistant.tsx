'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, User, Sparkles, Loader2, X } from 'lucide-react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(GEMINI_KEY);

const SYSTEM_PROMPT = `You are VIT Assistant, an intelligent campus helper for VIT (Vellore Institute of Technology) students.
You help students with:
- Academic queries (courses, grades, CGPA, attendance)
- Campus life (clubs, events, hostels, food)
- Career guidance (internships, placements, skills)
- Study tips and resources
- Schedules and timetables
- General VIT information

Be concise, friendly, and helpful. Keep responses under 150 words unless more detail is truly needed.`;

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export default function AIAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            role: 'assistant',
            content: "Hello! I'm your VIT campus assistant powered by Gemini AI. How can I help you today? 🎓",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatRef = useRef<ReturnType<typeof genAI.getGenerativeModel> | null>(null);
    const chatSessionRef = useRef<ReturnType<Awaited<ReturnType<typeof genAI.getGenerativeModel>>['startChat']> | null>(null);

    useEffect(() => {
        // Initialize chat model with history
        const model = genAI.getGenerativeModel({
            model: 'gemini-1.5-flash',
            systemInstruction: SYSTEM_PROMPT,
        });
        chatRef.current = model;
        chatSessionRef.current = model.startChat({
            history: [],
            generationConfig: {
                maxOutputTokens: 512,
                temperature: 0.7,
            },
        });
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        const userInput = input;
        setInput('');
        setIsLoading(true);

        try {
            if (!chatSessionRef.current) {
                throw new Error('Chat not initialized');
            }
            const result = await chatSessionRef.current.sendMessage(userInput);
            const text = result.response.text();

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: text,
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (err) {
            console.error('Gemini error:', err);
            const errMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: '⚠️ Sorry, I encountered an error. Please try again.',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const quickActions = [
        'What clubs can I join?',
        'How to improve CGPA?',
        'Upcoming campus events?',
        'Tips for placements?',
    ];

    return (
        <>
            {/* Floating Button */}
            <motion.button
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center shadow-lg shadow-violet-500/30 z-50"
            >
                <Bot size={24} className="text-white" />
            </motion.button>

            {/* Chat Window */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="fixed bottom-24 right-6 w-96 h-[520px] bg-[#0c0f17] rounded-2xl border border-white/[0.08] shadow-2xl z-50 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/[0.06] bg-gradient-to-r from-violet-500/10 to-fuchsia-500/10">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                                    <Sparkles size={18} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold">VIT Assistant</h3>
                                    <p className="text-emerald-400 text-xs flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                                        Gemini AI • Online
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-2 text-white/40 hover:text-white/60 rounded-lg hover:bg-white/[0.05]"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={`flex gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                        message.role === 'user'
                                            ? 'bg-white/[0.1] text-white'
                                            : 'bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white'
                                    }`}>
                                        {message.role === 'user' ? <User size={14} /> : <Bot size={14} />}
                                    </div>
                                    <div className={`max-w-[78%] p-3 rounded-2xl text-sm whitespace-pre-wrap ${
                                        message.role === 'user'
                                            ? 'bg-violet-500/20 text-white/90 rounded-br-md'
                                            : 'bg-white/[0.05] text-white/80 rounded-bl-md'
                                    }`}>
                                        {message.content}
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                                        <Bot size={14} className="text-white" />
                                    </div>
                                    <div className="bg-white/[0.05] p-3 rounded-2xl rounded-bl-md flex items-center gap-2">
                                        <Loader2 size={14} className="text-violet-400 animate-spin" />
                                        <span className="text-white/40 text-xs">Thinking...</span>
                                    </div>
                                </div>
                            )}

                            {/* Quick actions shown only at start */}
                            {messages.length === 1 && !isLoading && (
                                <div className="grid grid-cols-2 gap-2 mt-2">
                                    {quickActions.map((action) => (
                                        <button
                                            key={action}
                                            onClick={() => { setInput(action); }}
                                            className="text-left text-xs p-2 rounded-xl border border-white/[0.06] text-white/50 hover:text-white/80 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all"
                                        >
                                            {action}
                                        </button>
                                    ))}
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        <div className="p-4 border-t border-white/[0.06]">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                                    placeholder="Ask about VIT..."
                                    className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/90 placeholder:text-white/30 outline-none focus:border-violet-500/40 transition-colors"
                                />
                                <button
                                    onClick={handleSend}
                                    disabled={!input.trim() || isLoading}
                                    className="p-2.5 bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white rounded-xl hover:opacity-90 disabled:opacity-30 transition-opacity"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
