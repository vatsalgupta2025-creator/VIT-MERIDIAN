'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    GraduationCap, Briefcase, Eye, EyeOff, ArrowLeft,
    Lock, User, Shield, ChevronRight, AlertCircle
} from 'lucide-react';
import { useAuth, AuthUser } from '@/context/AuthContext';

// Mock credential store — replace with real API in production
const MOCK_STUDENTS: Record<string, { name: string; password: string; department: string }> = {
    '25bce1440': { name: 'Ayush Upadhyay', password: 'student123', department: 'BTech CSE AIML' },
    '24bce1001': { name: 'Priya Sharma', password: 'student123', department: 'BTech CSE' },
    '25bme2005': { name: 'Rahul Kumar', password: 'student123', department: 'BTech ME' },
    '26bcs3001': { name: 'Sneha Nair', password: 'student123', department: 'BTech CS' },
};

const MOCK_EMPLOYEES: Record<string, { name: string; password: string; department: string }> = {
    'EMP001': { name: 'Dr. Ramesh Iyer', password: 'faculty123', department: 'CSE Department' },
    'EMP002': { name: 'Prof. Meera Nair', password: 'faculty123', department: 'Mathematics' },
    'ADMIN01': { name: 'Mr. Suresh Admin', password: 'admin123', department: 'Administration' },
};

const VALID_STUDENT_REGEX = /^(22|23|24|25|26)[a-z]{3}\d{4}$/;
const MAX_EMPLOYEE_ID_LENGTH = 5;

function validateStudentRegNo(value: string): string | null {
    const trimmed = value.trim();
    if (!trimmed) return 'Registration number is required.';
    if (trimmed.length !== 9) return 'Registration number must be exactly 9 characters.';
    if (!VALID_STUDENT_REGEX.test(trimmed)) return 'Invalid format. Use year (22-26) + 3 lowercase letters + 4 digits (e.g. 25bce1440).';
    return null;
}

function validateEmployeeId(value: string): string | null {
    const trimmed = value.trim();
    if (!trimmed) return 'Employee ID is required.';
    if (trimmed.length > MAX_EMPLOYEE_ID_LENGTH) return `Employee ID must not exceed ${MAX_EMPLOYEE_ID_LENGTH} characters.`;
    return null;
}

interface LoginPageProps {
    role: 'student' | 'employee';
    onBack: () => void;
}

export default function LoginPage({ role, onBack }: LoginPageProps) {
    const { login } = useAuth();
    const [idValue, setIdValue] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const isStudent = role === 'student';
    const accentColor = isStudent ? '#6366f1' : '#0ea5e9';
    const accentMuted = isStudent ? 'rgba(99,102,241,0.15)' : 'rgba(14,165,233,0.15)';
    const accentBorder = isStudent ? 'rgba(99,102,241,0.4)' : 'rgba(14,165,233,0.4)';

    const handleLogin = async () => {
        setError('');
        if (!idValue.trim() || !password.trim()) {
            setError('Please fill in all fields.');
            return;
        }

        if (isStudent) {
            const regError = validateStudentRegNo(idValue);
            if (regError) {
                setError(regError);
                return;
            }
        } else {
            const empError = validateEmployeeId(idValue);
            if (empError) {
                setError(empError);
                return;
            }
        }

        setLoading(true);
        await new Promise(r => setTimeout(r, 800)); // Simulate network

        const store = isStudent ? MOCK_STUDENTS : MOCK_EMPLOYEES;
        const record = store[idValue.trim().toUpperCase()] ?? store[idValue.trim()];

        if (!record) {
            setError(isStudent ? 'Registration number not found.' : 'Employee ID not found.');
            setLoading(false);
            return;
        }
        if (record.password !== password) {
            setError('Incorrect password. Please try again.');
            setLoading(false);
            return;
        }

        const authUser: AuthUser = {
            name: record.name,
            id: idValue.trim().toUpperCase(),
            email: `${idValue.trim().toLowerCase()}@vit.ac.in`,
            role,
            department: record.department,
        };
        login(authUser);
    };

    return (
        <div
            className="min-h-screen w-full flex items-center justify-center relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0a0e1a 0%, #0d1528 40%, #0a1220 100%)' }}
        >
            {/* Ambient glow */}
            <div
                className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full blur-[140px] opacity-10"
                style={{ background: `radial-gradient(circle, ${accentColor}, transparent)` }}
            />

            {/* Star field */}
            {Array.from({ length: 30 }).map((_, i) => (
                <div key={i} className="absolute rounded-full bg-white"
                    style={{
                        width: Math.random() * 2 + 0.5 + 'px',
                        height: Math.random() * 2 + 0.5 + 'px',
                        top: Math.random() * 100 + '%',
                        left: Math.random() * 100 + '%',
                        opacity: Math.random() * 0.4 + 0.05,
                    }}
                />
            ))}

            {/* Back button */}
            <button
                onClick={onBack}
                className="absolute top-6 left-6 flex items-center gap-2 text-sm transition-colors"
                style={{ color: 'rgba(255,255,255,0.4)' }}
                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.8)')}
                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.4)')}
            >
                <ArrowLeft size={16} />
                <span>Change Role</span>
            </button>

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="w-full max-w-md px-6"
            >
                {/* Card */}
                <div
                    className="rounded-3xl p-8"
                    style={{
                        background: 'rgba(255,255,255,0.03)',
                        border: `1.5px solid ${accentBorder}`,
                        backdropFilter: 'blur(20px)',
                        boxShadow: `0 0 60px ${accentColor}18`,
                    }}
                >
                    {/* Header */}
                    <div className="flex flex-col items-center mb-8">
                        <div
                            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                            style={{
                                background: `linear-gradient(135deg, ${accentColor}cc, ${accentColor}88)`,
                                boxShadow: `0 0 30px ${accentColor}44`,
                            }}
                        >
                            {isStudent
                                ? <GraduationCap size={30} color="#fff" />
                                : <Briefcase size={30} color="#fff" />}
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-1">
                            {isStudent ? 'Student Login' : 'Employee Login'}
                        </h1>
                        <p className="text-sm text-center" style={{ color: 'rgba(255,255,255,0.4)' }}>
                            {isStudent
                                ? 'Sign in with your VIT registration number'
                                : 'Sign in with your Employee ID'}
                        </p>
                    </div>

                    {/* Fields */}
                    <div className="space-y-4">
                        {/* ID field */}
                        <div>
                            <label className="block text-xs font-semibold mb-2 uppercase tracking-wider"
                                style={{ color: 'rgba(255,255,255,0.5)' }}>
                                {isStudent ? 'Registration Number' : 'Employee ID'}
                            </label>
                            <div className="relative">
                                <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2"
                                    style={{ color: 'rgba(255,255,255,0.3)' }} />
                                <input
                                    type="text"
                                    value={idValue}
                                    onChange={e => { setIdValue(e.target.value); setError(''); }}
                                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                                    placeholder={isStudent ? 'e.g. 25bce1440' : 'e.g. EMP001'}
                                    className="w-full rounded-xl py-3 pl-11 pr-4 text-sm text-white outline-none transition-all duration-200"
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        border: `1px solid rgba(255,255,255,0.1)`,
                                        caretColor: accentColor,
                                    }}
                                    onFocus={e => (e.target.style.border = `1px solid ${accentColor}88`)}
                                    onBlur={e => (e.target.style.border = '1px solid rgba(255,255,255,0.1)')}
                                />
                            </div>
                        </div>

                        {/* Password field */}
                        <div>
                            <label className="block text-xs font-semibold mb-2 uppercase tracking-wider"
                                style={{ color: 'rgba(255,255,255,0.5)' }}>
                                Password
                            </label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2"
                                    style={{ color: 'rgba(255,255,255,0.3)' }} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => { setPassword(e.target.value); setError(''); }}
                                    onKeyDown={e => e.key === 'Enter' && handleLogin()}
                                    placeholder="Enter your password"
                                    className="w-full rounded-xl py-3 pl-11 pr-12 text-sm text-white outline-none transition-all duration-200"
                                    style={{
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        caretColor: accentColor,
                                    }}
                                    onFocus={e => (e.target.style.border = `1px solid ${accentColor}88`)}
                                    onBlur={e => (e.target.style.border = '1px solid rgba(255,255,255,0.1)')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(s => !s)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 transition-colors"
                                    style={{ color: 'rgba(255,255,255,0.3)' }}
                                    onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.7)')}
                                    onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -8 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="flex items-center gap-2 rounded-xl px-4 py-3 text-sm"
                                    style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}
                                >
                                    <AlertCircle size={15} />
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Login Button */}
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleLogin}
                            disabled={loading}
                            className="w-full rounded-xl py-3.5 font-semibold text-white text-sm flex items-center justify-center gap-2 transition-all duration-200 mt-2"
                            style={{
                                background: loading
                                    ? 'rgba(255,255,255,0.1)'
                                    : `linear-gradient(135deg, ${accentColor}, ${accentColor}bb)`,
                                boxShadow: loading ? 'none' : `0 0 24px ${accentColor}44`,
                                cursor: loading ? 'not-allowed' : 'pointer',
                            }}
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Shield size={16} />
                                    <span>Sign In</span>
                                    <ChevronRight size={16} />
                                </>
                            )}
                        </motion.button>
                    </div>

                    {/* Demo hint */}
                    <div className="mt-6 rounded-xl px-4 py-3" style={{ background: accentMuted, border: `1px solid ${accentBorder}` }}>
                        <p className="text-xs font-semibold mb-1" style={{ color: accentColor }}>Demo Credentials</p>
                            {isStudent ? (
                                <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                                    Reg No: <span className="font-mono text-white/70">25bce1440</span> · Password: <span className="font-mono text-white/70">student123</span>
                                </p>
                            ) : (
                            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                                ID: <span className="font-mono text-white/70">EMP001</span> · Password: <span className="font-mono text-white/70">faculty123</span>
                            </p>
                        )}
                    </div>
                </div>

                <p className="text-center text-xs mt-6" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    VIT Chennai · VIT-MERIDIAN Platform
                </p>
            </motion.div>
        </div>
    );
}
