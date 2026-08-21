'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenerativeAI, ChatSession } from '@google/generative-ai';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

// Icons 
import { Bot, X, Send, Paperclip, Mic, Globe, Download, Loader2, ChevronDown, Check, Image as ImageIcon } from 'lucide-react';

// Languages configuration
const LANGUAGES = [
    { code: 'en-US', name: 'English', greeting: 'Hello! I am Mr. Vighelp, your AI assistant. How can I help you today?' },
    { code: 'hi-IN', name: 'Hindi', greeting: 'नमस्ते! मैं मिस्टर विगहेल्प हूँ, आपका AI सहायक। मैं आपकी कैसे मदद कर सकता हूँ?' },
    { code: 'es-ES', name: 'Spanish', greeting: '¡Hola! Soy el Sr. Vighelp, su asistente de IA. ¿Cómo puedo ayudarle hoy?' },
    { code: 'fr-FR', name: 'French', greeting: 'Bonjour! Je suis M. Vighelp, votre assistant IA. Comment puis-je vous aider aujourd\'hui?' }
];

type MessageType = 'user' | 'ai' | 'system';

interface Message {
    id: string;
    type: MessageType;
    text: string;
    image?: string;
    timestamp: Date;
}

export default function MrVighelp() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // Customization & Settings
    const [language, setLanguage] = useState(LANGUAGES[0]);
    const [showLangMenu, setShowLangMenu] = useState(false);
    const [isListening, setIsListening] = useState(false);

    // Refs
    const chatEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const chatSessionRef = useRef<ChatSession | null>(null);

    // Speech Recognition (Type 'any' used to bypass lack of global types for webkitSpeechRecognition)
    const recognitionRef = useRef<any>(null);

    // Initialize greeting on open and language change
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([{
                id: 'greet-1',
                type: 'ai',
                text: language.greeting,
                timestamp: new Date()
            }]);
        }
    }, [language]);

    // Scroll to bottom when messages change
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isTyping]);

    // Init Gemini
    const initGemini = useCallback(async () => {
        if (!process.env.NEXT_PUBLIC_GEMINI_API_KEY) {
            console.error('Gemini API key is missing');
            return;
        }

        try {
            // Mock User Data passed to AI for contextual learning
            const userContext = `
STUDENT PROFILE (ALEX SHARMA):
- Year: 3rd Year Computer Science (STU-2023-0847)
- GPA: 3.72
- XP Points: 1,250
- Current Courses: Database Normalization (InProgress), React Hooks (Completed), Machine Learning (Pending)
- Recent Quiz: Binary Trees (Score: 85%)
- Strengths: Frontend Architecture, Mathematics
`;

            const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);
            const model = genAI.getGenerativeModel({
                model: 'gemini-2.5-flash',
                systemInstruction: `You are a highly advanced AI assistant named Mr. Vighelp integrated into the SYNAPSE OS application.
        You are deeply context-aware and learn from the user's progress.
        Here is the current user's context: ${userContext}
        
        CRITICAL RULE: You MUST always respond in the language code: ${language.code} (${language.name}).
        Keep your responses concise, formatting them with markdown when appropriate.`
            });

            chatSessionRef.current = model.startChat({
                history: [],
            });
        } catch (e) {
            console.error("Failed to initialize Gemini", e);
        }
    }, [language]);

    // Re-init when language changes
    useEffect(() => {
        initGemini();
    }, [initGemini]);

    // Speech Recognition Setup
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognition) {
                recognitionRef.current = new SpeechRecognition();
                recognitionRef.current.continuous = false;
                recognitionRef.current.interimResults = true;

                recognitionRef.current.onresult = (event: any) => {
                    let interimTranscript = '';
                    let finalTranscript = '';

                    for (let i = event.resultIndex; i < event.results.length; ++i) {
                        if (event.results[i].isFinal) {
                            finalTranscript += event.results[i][0].transcript;
                        } else {
                            interimTranscript += event.results[i][0].transcript;
                        }
                    }

                    if (finalTranscript) {
                        setInput(prev => prev + finalTranscript + ' ');
                    }
                };

                recognitionRef.current.onend = () => {
                    setIsListening(false);
                };

                recognitionRef.current.onerror = (event: any) => {
                    console.error("Speech recognition error", event.error);
                    setIsListening(false);
                };
            }
        }
    }, []);

    // Update recognition language when UI language changes
    useEffect(() => {
        if (recognitionRef.current) {
            recognitionRef.current.lang = language.code;
        }
    }, [language]);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            try {
                recognitionRef.current?.start();
                setIsListening(true);
            } catch (e) {
                console.error("Could not start speech recognition", e);
            }
        }
    };

    const speakText = (text: string) => {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel(); // Stop any current speech
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = language.code;
            window.speechSynthesis.speak(utterance);
        }
    };

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();

        if (!input.trim() || !chatSessionRef.current) return;

        const userMessage = input.trim();
        setInput('');

        // Add User Message
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            type: 'user',
            text: userMessage,
            timestamp: new Date()
        }]);

        setIsTyping(true);

        try {
            // Send to Gemini
            const result = await chatSessionRef.current.sendMessage(userMessage);
            const responseText = result.response.text();

            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                type: 'ai',
                text: responseText,
                timestamp: new Date()
            }]);

            // Auto-speak response
            speakText(responseText);

        } catch (error) {
            console.error("Chat error:", error);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                type: 'system',
                text: "Sorry, I encountered an error communicating with the brain center. Please try again.",
                timestamp: new Date()
            }]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';

        const isImage = file.type.startsWith('image/');

        // Convert to base64 for display and API
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const base64Data = reader.result as string;
            const base64Content = base64Data.split(',')[1];

            // Add to UI immediately
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                type: 'user',
                text: `Uploaded: ${file.name}`,
                image: isImage ? base64Data : undefined,
                timestamp: new Date()
            }]);

            setIsTyping(true);

            try {
                // Using the requested model
                const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);
                const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

                const imageParts = [
                    {
                        inlineData: {
                            data: base64Content,
                            mimeType: file.type
                        }
                    }
                ];

                const result = await model.generateContent([
                    `Analyze this file uploaded by the user. Respond in ${language.name}.`,
                    ...imageParts
                ]);

                const responseText = result.response.text();

                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    type: 'ai',
                    text: responseText,
                    timestamp: new Date()
                }]);

                speakText(responseText);

            } catch (error) {
                console.error("Upload interpretation error:", error);
                setMessages(prev => [...prev, {
                    id: (Date.now() + 1).toString(),
                    type: 'system',
                    text: "I couldn't process that file. Please make sure it's a supported format.",
                    timestamp: new Date()
                }]);
            } finally {
                setIsTyping(false);
            }
        };
    };

    const downloadAsPDF = () => {
        if (messages.length === 0) return;

        try {
            const doc = new jsPDF();

            // Header
            doc.setFontSize(20);
            doc.setTextColor(6, 182, 212); // Cyan
            doc.text("Mr. Vighelp - Chat History", 14, 22);

            doc.setFontSize(10);
            doc.setTextColor(150);
            doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
            doc.text(`Language: ${language.name}`, 14, 35);

            // Format data for autoTable
            const tableData = messages.map(msg => [
                msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                msg.type === 'user' ? 'You' : msg.type === 'system' ? 'System' : 'Mr. Vighelp',
                // Strip markdown for clean PDF text
                msg.text.replace(/\*\*/g, '').replace(/\*/g, '').replace(/`/g, '')
            ]);

            autoTable(doc, {
                startY: 45,
                head: [['Time', 'Sender', 'Message']],
                body: tableData,
                theme: 'grid',
                headStyles: {
                    fillColor: [6, 182, 212],
                    textColor: 255,
                    fontStyle: 'bold'
                },
                columnStyles: {
                    0: { cellWidth: 25 },
                    1: { cellWidth: 30, fontStyle: 'bold' },
                    2: { cellWidth: 'auto' }
                },
                styles: {
                    fontSize: 10,
                    cellPadding: 5,
                    overflow: 'linebreak'
                },
                alternateRowStyles: {
                    fillColor: [245, 245, 245]
                }
            });

            doc.save(`Mr-Vighelp-Chat-${new Date().toISOString().split('T')[0]}.pdf`);
        } catch (e) {
            console.error("PDF generation failed", e);
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                type: 'system',
                text: "Failed to generate PDF document.",
                timestamp: new Date()
            }]);
        }
    };

    // If closed, return just the FAB
    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center shadow-lg shadow-cyan-500/20 hover:scale-105 transition-all duration-300 group"
            >
                <Bot size={26} className="text-white group-hover:animate-pulse" />
            </button>
        );
    }

    return (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-2rem)] bg-[#040812] border border-white/10 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">

            {/* Header */}
            <div className="p-4 border-b border-white/10 bg-white/[0.02] flex items-center justify-between relative">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-violet-500 flex items-center justify-center shadow-inner">
                        <Bot size={20} className="text-white" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-white/90">Mr. Vighelp</h2>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            <span className="text-xs text-white/50">Online • AI Assistant</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Settings / Lang Toggle */}
                    <div className="relative">
                        <button
                            onClick={() => setShowLangMenu(!showLangMenu)}
                            className="p-1.5 text-white/40 hover:text-white/80 hover:bg-white/5 rounded-lg transition-colors"
                            title="Change Language"
                        >
                            <Globe size={18} />
                        </button>

                        {showLangMenu && (
                            <div className="absolute right-0 top-full mt-2 w-40 bg-[#0f1420] border border-white/10 rounded-xl shadow-xl overflow-hidden py-1 z-50 animate-in slide-in-from-top-2">
                                {LANGUAGES.map(lang => (
                                    <button
                                        key={lang.code}
                                        onClick={() => {
                                            setLanguage(lang);
                                            setShowLangMenu(false);
                                        }}
                                        className="w-full text-left px-4 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-cyan-400 flex items-center justify-between"
                                    >
                                        {lang.name}
                                        {language.code === lang.code && <Check size={14} className="text-cyan-400" />}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <button
                        onClick={downloadAsPDF}
                        className="p-1.5 text-white/40 hover:text-cyan-400 hover:bg-white/5 rounded-lg transition-colors"
                        title="Download Chat as PDF"
                    >
                        <Download size={18} />
                    </button>

                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1.5 text-white/40 hover:text-red-400 hover:bg-white/5 rounded-lg transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
            </div>

            {/* Chat Area */}
            <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-transparent to-white/[0.01]"
            >
                <div className="text-center mb-6">
                    <p className="text-[10px] uppercase tracking-wider text-white/20 font-semibold">Today</p>
                </div>

                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} group`}
                    >
                        <div
                            className={`max-w-[85%] rounded-2xl p-3 text-sm ${msg.type === 'user'
                                ? 'bg-gradient-to-br from-cyan-600 to-blue-600 text-white rounded-br-none'
                                : msg.type === 'system'
                                    ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                    : 'bg-white/[0.05] border border-white/10 text-white/80 rounded-bl-none'
                                }`}
                        >
                            {msg.image && (
                                <div className="mb-2 relative rounded-lg overflow-hidden border border-white/10">
                                    <img src={msg.image} alt="Uploaded content" className="w-full h-auto object-cover max-h-40" />
                                </div>
                            )}
                            <div
                                className="whitespace-pre-wrap leading-relaxed"
                                dangerouslySetInnerHTML={{
                                    __html: msg.text
                                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                        .replace(/`(.*?)`/g, '<code class="bg-black/30 px-1 py-0.5 rounded text-cyan-300 font-mono text-xs">$1</code>')
                                }}
                            />
                            <p className={`text-[10px] mt-1.5 opacity-50 ${msg.type === 'user' ? 'text-right text-white/70' : 'text-left'}`}>
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className="flex justify-start">
                        <div className="bg-white/[0.05] border border-white/10 text-white/80 rounded-2xl rounded-bl-none p-4 flex items-center gap-1.5 w-max">
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-3 border-t border-white/10 bg-white/[0.02]">
                <form onSubmit={handleSend} className="relative flex items-end gap-2">

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept="image/*,.pdf,.txt,.doc,.docx"
                    />

                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-2.5 text-white/40 hover:text-cyan-400 hover:bg-white/5 rounded-xl transition-colors shrink-0"
                        title="Upload Image/File"
                    >
                        <Paperclip size={20} />
                    </button>

                    <div className="relative flex-1 bg-white/[0.03] border border-white/10 rounded-xl focus-within:border-cyan-500/50 focus-within:bg-white/[0.05] transition-all">
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder={`Ask Mr.Vighelp in ${language.name}...`}
                            className="w-full bg-transparent text-sm text-white/90 placeholder:text-white/30 px-4 py-3 outline-none"
                            disabled={isTyping}
                        />
                        {isListening && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                <span className="w-1 h-1 rounded-full bg-red-500 animate-ping"></span>
                                <span className="text-[10px] text-red-400 font-medium animate-pulse uppercase">Listening</span>
                            </div>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={toggleListening}
                        className={`p - 2.5 rounded - xl transition - all shrink - 0 ${isListening
                            ? 'bg-red-500/20 text-red-500 border border-red-500/30 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                            : 'text-white/40 bg-white/[0.03] border border-white/10 hover:text-white hover:bg-white/10'
                            }`}
                        title="Speech to Text"
                    >
                        <Mic size={20} className={isListening ? 'animate-pulse' : ''} />
                    </button>

                    <button
                        type="submit"
                        disabled={!input.trim() || isTyping}
                        className="p-2.5 bg-cyan-500 text-white rounded-xl shadow-lg shadow-cyan-500/20 hover:bg-cyan-400 disabled:opacity-50 disabled:hover:bg-cyan-500 transition-all shrink-0"
                    >
                        <Send size={20} />
                    </button>
                </form>
                <div className="text-center mt-2">
                    <p className="text-[9px] text-white/20">Mr. Vighelp learns context and can interpret images/files.</p>
                </div>
            </div>
        </div>
    );
}
