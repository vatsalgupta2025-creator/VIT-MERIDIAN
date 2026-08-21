'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, User, Sparkles, Loader2, X, Minimize2, Maximize2 } from 'lucide-react';

// TODO: Add your friend's AI Assistant implementation here
// This component should include:
// - Chat interface with AI
// - Context-aware responses about VIT
// - Integration with campus data
// - Voice input support (optional)
// - Quick action buttons

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
            content: 'Hello! I\'m your VIT campus assistant. How can I help you today?',
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        // TODO: Implement actual AI response
        setTimeout(() => {
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'This is a placeholder response. Please implement the actual AI integration from your friend\'s code.',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, assistantMessage]);
            setIsLoading(false);
        }, 1000);
    };

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
                        className="fixed bottom-24 right-6 w-96 h-[500px] bg-[#0c0f17] rounded-2xl border border-white/[0.08] shadow-2xl z-50 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-white/[0.06]">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                                    <Sparkles size={18} className="text-white" />
                                </div>
                                <div>
                                    <h3 className="text-white font-semibold">VIT Assistant</h3>
                                    <p className="text-white/40 text-xs">AI-powered campus helper</p>
                                </div>
                            </div>
                            <div className="flex gap-1">
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 text-white/40 hover:text-white/60 rounded-lg hover:bg-white/[0.05]"
                                >
                                    <X size={18} />
                                </button>
                            </div>
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
                                    <div className={`max-w-[75%] p-3 rounded-2xl text-sm ${
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
                                    <div className="bg-white/[0.05] p-3 rounded-2xl rounded-bl-md">
                                        <Loader2 size={16} className="text-white/40 animate-spin" />
                                    </div>
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
                                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Ask about VIT..."
                                    className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-xl px-4 py-2.5 text-sm text-white/90 placeholder:text-white/30 outline-none focus:border-violet-500/40"
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
