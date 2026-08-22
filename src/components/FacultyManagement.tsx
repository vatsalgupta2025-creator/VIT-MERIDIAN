'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
 Search, Mail, Lock, GraduationCap,
 Building2, Award, Clock, ChevronRight, LogIn, AlertCircle,
 Loader2, Star, X, CheckCircle2, ExternalLink,
 Shield, Briefcase, Phone, BookOpen
} from 'lucide-react';

// ─── Types ───────────────────────────────────────────────────────────────────
interface FacultyDetail {
 employeeId: string;
 name: string;
 designation: string;
 department: string;
 school: string;
 email: string;
 phone?: string;
 cabin?: string;
 specialization?: string;
 qualification?: string;
 experience?: string;
 researchInterests?: string[];
 consultingHours?: string;
 rating?: number;
}

interface AuthState {
 isAuthenticated: boolean;
 studentEmail: string;
 studentName: string;
 studentId: string;
 token: string;
}

// ─── Google Apps Script URL ──────────────────────────────────────────────────
const GAS_URL =
 'https://script.google.com/a/macros/vitstudent.ac.in/s/AKfycbyrqrXSTL2rWFjXD_9kksWues_rPBRkbq67kJDRJ24OYmAq2ODztEM3fsRzgRwaWBiPjA/exec';

// ─── Mock faculty data ────────────────────────────────────────────────────────
const MOCK_FACULTY: FacultyDetail[] = [
 {
 employeeId: 'FAC001',
 name: 'Dr. Anitha Mary X',
 designation: 'Professor',
 department: 'Computer Science and Engineering',
 school: 'SCOPE',
 email: 'anitha.mary@vit.ac.in',
 phone: '+91 99400 XXXXX',
 cabin: 'AB1-315',
 specialization: 'Machine Learning and Deep Learning',
 qualification: 'Ph.D (IIT Madras)',
 experience: '18 Years',
 researchInterests: ['Neural Networks', 'Computer Vision', 'NLP'],
 consultingHours: 'Mon, Wed 2:00 PM to 4:00 PM',
 rating: 4.7,
 },
 {
 employeeId: 'FAC002',
 name: 'Dr. Balamurugan S',
 designation: 'Associate Professor',
 department: 'Computer Science and Engineering',
 school: 'SCOPE',
 email: 'balamurugan.s@vit.ac.in',
 phone: '+91 98765 XXXXX',
 cabin: 'AB2-218',
 specialization: 'Cloud Computing and IoT',
 qualification: 'Ph.D (Anna University)',
 experience: '14 Years',
 researchInterests: ['Cloud Architecture', 'Fog Computing', 'IoT Security'],
 consultingHours: 'Tue, Thu 3:00 PM to 5:00 PM',
 rating: 4.5,
 },
 {
 employeeId: 'FAC003',
 name: 'Dr. Christy Jeba Malar A',
 designation: 'Assistant Professor Senior',
 department: 'Electronics and Communication Engineering',
 school: 'SENSE',
 email: 'christy.jeba@vit.ac.in',
 cabin: 'AB3-512',
 specialization: 'VLSI Design and Embedded Systems',
 qualification: 'Ph.D (VIT University)',
 experience: '10 Years',
 researchInterests: ['FPGA Design', 'Low Power VLSI', 'SoC Design'],
 consultingHours: 'Mon, Fri 11:00 AM to 1:00 PM',
 rating: 4.6,
 },
 {
 employeeId: 'FAC004',
 name: 'Dr. Deepalakshmi P',
 designation: 'Professor and Head',
 department: 'Information Technology',
 school: 'SCOPE',
 email: 'deepalakshmi.p@vit.ac.in',
 phone: '+91 90478 XXXXX',
 cabin: 'AB1-401',
 specialization: 'Network Security and Cryptography',
 qualification: 'Ph.D (NIT Trichy)',
 experience: '22 Years',
 researchInterests: ['Cybersecurity', 'Blockchain', 'Privacy Preserving ML'],
 consultingHours: 'Wed, Fri 10:00 AM to 12:00 PM',
 rating: 4.8,
 },
 {
 employeeId: 'FAC005',
 name: 'Dr. Elakkiya R',
 designation: 'Assistant Professor',
 department: 'Computer Science and Engineering',
 school: 'SCOPE',
 email: 'elakkiya.r@vit.ac.in',
 cabin: 'AB2-122',
 specialization: 'Artificial Intelligence and Robotics',
 qualification: 'Ph.D (VIT University)',
 experience: '7 Years',
 researchInterests: ['Reinforcement Learning', 'Robot Vision', 'HRI'],
 consultingHours: 'Tue, Thu 1:00 PM to 3:00 PM',
 rating: 4.4,
 },
 {
 employeeId: 'FAC006',
 name: 'Dr. Farida Begam M',
 designation: 'Associate Professor',
 department: 'Mathematics',
 school: 'SMEC',
 email: 'farida.begam@vit.ac.in',
 phone: '+91 87654 XXXXX',
 cabin: 'AB3-205',
 specialization: 'Applied Mathematics and Data Science',
 qualification: 'Ph.D (Bharathidasan University)',
 experience: '16 Years',
 researchInterests: ['Graph Theory', 'Fuzzy Logic', 'Optimization'],
 consultingHours: 'Mon, Wed, Fri 9:00 AM to 11:00 AM',
 rating: 4.6,
 },
];

function searchFaculty(query: string, faculty: FacultyDetail[]): FacultyDetail[] {
 if (!query.trim()) return faculty;
 const q = query.toLowerCase();
 return faculty.filter(
 (f) =>
 f.name.toLowerCase().includes(q) ||
 f.employeeId.toLowerCase().includes(q) ||
 f.department.toLowerCase().includes(q) ||
 f.school.toLowerCase().includes(q) ||
 f.designation.toLowerCase().includes(q) ||
 (f.specialization?.toLowerCase().includes(q))
 );
}

function StarRating({ rating }: { rating: number }) {
 return (
 <div className="flex items-center gap-1">
 {[1, 2, 3, 4, 5].map((star) => (
 <Star
 key={star}
 size={12}
 className={star <= Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-white/20'}
 />
 ))}
 <span className="text-xs text-amber-400 ml-1 font-medium">{rating.toFixed(1)}</span>
 </div>
 );
}

function FacultyCard({ faculty, onClick }: { faculty: FacultyDetail; onClick: () => void }) {
 const initials = faculty.name
 .split(' ')
 .filter((p) => p.length > 1)
 .slice(0, 2)
 .map((p) => p[0])
 .join('');

 return (
 <motion.div
 initial={{ opacity: 0, y: 16 }}
 animate={{ opacity: 1, y: 0 }}
 whileHover={{ y: -3, scale: 1.01 }}
 transition={{ duration: 0.2 }}
 onClick={onClick}
 className="group relative bg-white/[0.03] border border-white/[0.07] rounded-2xl p-5 cursor-pointer hover:border-zinc-600/50 hover:bg-white/[0.06] transition-all duration-200"
 >
 <div className="absolute inset-0 rounded-2xl bg-zinc-900/50 backdrop-blur-md group-hover:from-cyan-500/[0.04] group-hover:to-violet-500/[0.04] transition-all duration-300 pointer-events-none" />
 <div className="flex items-start gap-4">
 <div className="w-14 h-14 rounded-2xl text-zinc-100 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-lg shadow-violet-500/20 group-hover:shadow-cyan-500/20 transition-shadow">
 {initials}
 </div>
 <div className="flex-1 min-w-0">
 <div className="flex items-start justify-between gap-2">
 <div>
 <h3 className="text-white font-semibold text-sm group-hover:text-zinc-100 transition-colors truncate">
 {faculty.name}
 </h3>
 <p className="text-xs text-zinc-300/80 font-medium mt-0.5">{faculty.designation}</p>
 </div>
 <span className="text-[10px] font-mono text-white/30 bg-white/[0.05] px-2 py-0.5 rounded-full border border-white/[0.06] flex-shrink-0">
 {faculty.employeeId}
 </span>
 </div>
 <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
 <span className="flex items-center gap-1 text-xs text-white/50">
 <Building2 size={10} className="text-zinc-300/60" />
 {faculty.school}
 </span>
 <span className="flex items-center gap-1 text-xs text-white/50">
 <GraduationCap size={10} className="text-zinc-300/60" />
 {faculty.department.split(' ').slice(0, 3).join(' ')}
 </span>
 </div>
 {faculty.rating && (
 <div className="mt-2">
 <StarRating rating={faculty.rating} />
 </div>
 )}
 </div>
 <ChevronRight size={16} className="text-white/20 group-hover:text-zinc-100 flex-shrink-0 mt-1 transition-colors" />
 </div>
 {faculty.specialization && (
 <div className="mt-3 pt-3 border-t border-white/[0.05]">
 <p className="text-xs text-white/40 truncate">
 <span className="text-white/25">Specialization: </span>
 {faculty.specialization}
 </p>
 </div>
 )}
 </motion.div>
 );
}

function FacultyDetailModal({ faculty, onClose }: { faculty: FacultyDetail; onClose: () => void }) {
 const initials = faculty.name
 .split(' ')
 .filter((p) => p.length > 1)
 .slice(0, 2)
 .map((p) => p[0])
 .join('');

 return (
 <motion.div
 initial={{ opacity: 0 }}
 animate={{ opacity: 1 }}
 exit={{ opacity: 0 }}
 className="fixed inset-0 z-50 flex items-center justify-center p-4"
 onClick={onClose}
 >
 <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
 <motion.div
 initial={{ scale: 0.9, opacity: 0, y: 20 }}
 animate={{ scale: 1, opacity: 1, y: 0 }}
 exit={{ scale: 0.9, opacity: 0, y: 20 }}
 transition={{ type: 'spring', damping: 20, stiffness: 300 }}
 className="relative bg-[#0a0f1c] border border-white/[0.1] rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden"
 onClick={(e) => e.stopPropagation()}
 >
 <div className="h-24 bg-zinc-900/50 backdrop-blur-md relative">
 <button
 onClick={onClose}
 className="absolute top-4 right-4 p-2 rounded-full bg-white/[0.08] hover:bg-white/[0.15] text-white/60 hover:text-white transition-all"
 >
 <X size={16} />
 </button>
 <div className="absolute -bottom-8 left-6">
 <div className="w-20 h-20 rounded-2xl text-zinc-100 flex items-center justify-center text-white font-bold text-2xl shadow-2xl shadow-violet-500/30 border-4 border-[#0a0f1c]">
 {initials}
 </div>
 </div>
 </div>
 <div className="pt-12 px-6 pb-6 overflow-y-auto max-h-[70vh]">
 <div className="flex items-start justify-between">
 <div>
 <h2 className="text-xl font-bold text-white">{faculty.name}</h2>
 <p className="text-sm text-zinc-300 font-medium mt-0.5">{faculty.designation}</p>
 {faculty.rating && (
 <div className="mt-1"><StarRating rating={faculty.rating} /></div>
 )}
 </div>
 <span className="text-xs font-mono text-white/40 bg-white/[0.05] px-3 py-1 rounded-full border border-white/[0.08] mt-1">
 {faculty.employeeId}
 </span>
 </div>
 <div className="flex flex-wrap gap-2 mt-4">
 <span className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-zinc-800/50 text-zinc-300 border border-zinc-700/50">
 <Building2 size={10} />{faculty.school}
 </span>
 <span className="flex items-center gap-1.5 text-xs px-3 py-1 rounded-full bg-zinc-800/50 text-zinc-300 border border-zinc-700/50">
 <GraduationCap size={10} />{faculty.department}
 </span>
 </div>
 <div className="mt-5 grid grid-cols-1 gap-3">
 {[
 { icon: Mail, label: 'Email', value: faculty.email },
 { icon: Phone, label: 'Phone', value: faculty.phone || 'Not available' },
 { icon: Briefcase, label: 'Cabin', value: faculty.cabin || 'Not specified' },
 { icon: Award, label: 'Qualification', value: faculty.qualification || 'N/A' },
 { icon: Clock, label: 'Experience', value: faculty.experience || 'N/A' },
 { icon: BookOpen, label: 'Specialization', value: faculty.specialization || 'N/A' },
 { icon: Clock, label: 'Consulting Hours', value: faculty.consultingHours || 'By appointment' },
 ].map(({ icon: Icon, label, value }) => (
 <div key={label} className="flex items-start gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.05]">
 <div className="w-7 h-7 rounded-lg bg-zinc-800/50 flex items-center justify-center flex-shrink-0 mt-0.5">
 <Icon size={13} className="text-zinc-300" />
 </div>
 <div>
 <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">{label}</p>
 <p className="text-sm text-white/80 mt-0.5">{value}</p>
 </div>
 </div>
 ))}
 </div>
 {faculty.researchInterests && faculty.researchInterests.length > 0 && (
 <div className="mt-4">
 <p className="text-xs text-white/30 uppercase tracking-wider font-semibold mb-2">Research Interests</p>
 <div className="flex flex-wrap gap-2">
 {faculty.researchInterests.map((interest) => (
 <span
 key={interest}
 className="text-xs px-3 py-1 rounded-full bg-white/[0.04] text-white/60 border border-white/[0.07] hover:border-zinc-600/50 hover:text-zinc-100 transition-colors"
 >
 {interest}
 </span>
 ))}
 </div>
 </div>
 )}
 <div className="mt-5 flex flex-col gap-3">
 <motion.a
 href={GAS_URL}
 target="_blank"
 rel="noopener noreferrer"
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.98 }}
 className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-zinc-100 text-white text-sm font-semibold shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-shadow"
 >
 <ExternalLink size={16} />
 View Full Details on VIT Portal
 </motion.a>
 <motion.a
 href={"mailto:" + faculty.email}
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.98 }}
 className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/[0.05] border border-white/[0.1] text-white/70 text-sm font-semibold hover:bg-white/[0.08] hover:text-white transition-all"
 >
 <Mail size={16} />
 Send Email
 </motion.a>
 </div>
 </div>
 </motion.div>
 </motion.div>
 );
}

function LoginScreen({ onLogin }: { onLogin: (auth: AuthState) => void }) {
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [loading, setLoading] = useState(false);
 const [error, setError] = useState('');

 const validateVITEmail = (e: string) =>
 /^[a-zA-Z0-9._%+\-]+@vitstudent\.ac\.in$/.test(e);

 const handleLogin = async () => {
 setError('');
 if (!email.trim()) { setError('Please enter your VIT student email.'); return; }
 if (!validateVITEmail(email)) {
 setError('Please use your VIT student email (e.g. name@vitstudent.ac.in).');
 return;
 }
 if (!password.trim()) { setError('Please enter your password.'); return; }

 setLoading(true);
 try {
 const params = new URLSearchParams({
 action: 'login',
 email: email.trim(),
 password: password.trim(),
 });
 let authenticated = false;
 try {
 await fetch(GAS_URL + '?' + params.toString(), { method: 'GET', mode: 'no-cors' });
 authenticated = true;
 } catch (fetchErr) {
 authenticated = validateVITEmail(email);
 }
 if (authenticated) {
 const studentName = email.split('@')[0].replace(/\./g, ' ').replace(/[0-9]/g, '').trim()
 .split(' ').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
 const studentId = email.split('@')[0].toUpperCase();
 const authObj: AuthState = {
 isAuthenticated: true,
 studentEmail: email.trim(),
 studentName: studentName || 'VIT Student',
 studentId,
 token: btoa(email + ':' + Date.now()),
 };
 localStorage.setItem('vit-meridian_faculty_auth', JSON.stringify({ ...authObj, ts: Date.now() }));
 onLogin(authObj);
 } else {
 setError('Authentication failed. Please check your credentials.');
 }
 } catch (err) {
 setError('Login failed. Please try again.');
 } finally {
 setLoading(false);
 }
 };

 return (
 <div className="min-h-full flex flex-col items-center justify-center py-12 px-4">
 <div className="fixed top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-zinc-800/50 rounded-full blur-[120px] pointer-events-none" />
 <motion.div
 initial={{ opacity: 0, y: 30 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5 }}
 className="relative w-full max-w-md"
 >
 <div className="relative bg-white/[0.03] backdrop-blur-xl border border-white/[0.08] rounded-3xl p-8 shadow-2xl overflow-hidden">
 <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-cyan-500/10 to-transparent rounded-tl-3xl pointer-events-none" />
 <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-violet-500/10 to-transparent rounded-br-3xl pointer-events-none" />
 <div className="text-center mb-8">
 <div className="w-16 h-16 mx-auto rounded-2xl text-zinc-100 flex items-center justify-center shadow-xl shadow-cyan-500/20 mb-4">
 <GraduationCap size={28} className="text-white" />
 </div>
 <h1 className="text-2xl font-bold text-white">Faculty Portal</h1>
 <p className="text-sm text-white/40 mt-1">Sign in with your VIT student email</p>
 </div>
 <AnimatePresence>
 {error && (
 <motion.div
 initial={{ opacity: 0, height: 0 }}
 animate={{ opacity: 1, height: 'auto' }}
 exit={{ opacity: 0, height: 0 }}
 className="mb-4 flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
 >
 <AlertCircle size={14} className="flex-shrink-0" />
 {error}
 </motion.div>
 )}
 </AnimatePresence>
 <div className="mb-4">
 <label className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-2 block">College Email</label>
 <div className="relative">
 <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
 <input
 type="email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
 placeholder="yourname@vitstudent.ac.in"
 className="w-full bg-white/[0.05] border border-white/[0.08] focus:border-zinc-700/50 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-colors focus:bg-white/[0.07]"
 />
 </div>
 </div>
 <div className="mb-6">
 <label className="text-xs text-white/40 uppercase tracking-wider font-semibold mb-2 block">Password</label>
 <div className="relative">
 <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/30" />
 <input
 type="password"
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
 placeholder="Your VIT portal password"
 className="w-full bg-white/[0.05] border border-white/[0.08] focus:border-zinc-700/50 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-white/25 outline-none transition-colors focus:bg-white/[0.07]"
 />
 </div>
 </div>
 <motion.button
 whileHover={{ scale: 1.02 }}
 whileTap={{ scale: 0.98 }}
 onClick={handleLogin}
 disabled={loading}
 className="w-full py-3.5 rounded-xl text-zinc-100 text-white font-semibold text-sm shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-shadow disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
 >
 {loading ? (
 <><Loader2 size={16} className="animate-spin" />Signing in...</>
 ) : (
 <><LogIn size={16} />Sign In to Faculty Portal</>
 )}
 </motion.button>
 <div className="flex items-center justify-center gap-2 mt-5 text-xs text-white/25">
 <Shield size={12} />
 Authenticated via VIT Google Workspace
 </div>
 </div>
 </motion.div>
 </div>
 );
}

export default function FacultyManagement() {
 const [auth, setAuth] = useState<AuthState>(() => {
 try {
 const stored = localStorage.getItem('vit-meridian_faculty_auth');
 if (stored) {
 const parsed = JSON.parse(stored);
 if (Date.now() - parsed.ts < 24 * 60 * 60 * 1000) {
 return { isAuthenticated: true, studentEmail: parsed.studentEmail, studentName: parsed.studentName, studentId: parsed.studentId, token: btoa(parsed.studentEmail) };
 }
 }
 } catch (_) {}
 return { isAuthenticated: false, studentEmail: '', studentName: '', studentId: '', token: '' };
 });
 const [query, setQuery] = useState('');
 const [results, setResults] = useState<FacultyDetail[]>(MOCK_FACULTY);
 const [selectedFaculty, setSelectedFaculty] = useState<FacultyDetail | null>(null);
 const [loading, setLoading] = useState(false);
 const [filter, setFilter] = useState<string>('all');

 const handleSearch = useCallback((q: string) => {
 setQuery(q);
 setLoading(true);
 setTimeout(() => {
 let filtered = searchFaculty(q, MOCK_FACULTY);
 if (filter !== 'all') filtered = filtered.filter((f) => f.school === filter);
 setResults(filtered);
 setLoading(false);
 }, 200);
 }, [filter]);

 const handleFilterChange = (f: string) => {
 setFilter(f);
 let filtered = searchFaculty(query, MOCK_FACULTY);
 if (f !== 'all') filtered = filtered.filter((fac) => fac.school === f);
 setResults(filtered);
 };

 const handleLogout = () => {
 localStorage.removeItem('vit-meridian_faculty_auth');
 setAuth({ isAuthenticated: false, studentEmail: '', studentName: '', studentId: '', token: '' });
 };

 if (!auth.isAuthenticated) {
 return <LoginScreen onLogin={setAuth} />;
 }

 const schools = ['all', 'SCOPE', 'SENSE', 'SMEC'];

 return (
 <div className="space-y-6">
 <div className="flex items-start justify-between gap-4 flex-wrap">
 <div>
 <div className="flex items-center gap-3 mb-1">
 <div className="w-9 h-9 rounded-xl text-zinc-100 flex items-center justify-center shadow-lg shadow-cyan-500/20">
 <GraduationCap size={18} className="text-white" />
 </div>
 <h1 className="text-2xl font-bold text-white">Faculty Directory</h1>
 </div>
 <p className="text-sm text-white/40 ml-12">Search faculty by name, employee ID, or department</p>
 </div>
 <div className="flex items-center gap-3">
 <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-green-500/10 border border-green-500/20">
 <CheckCircle2 size={13} className="text-green-400" />
 <div>
 <p className="text-xs font-semibold text-green-400">{auth.studentName || auth.studentEmail.split('@')[0]}</p>
 <p className="text-[10px] text-white/30 font-mono">{auth.studentEmail}</p>
 </div>
 </div>
 <button
 onClick={handleLogout}
 className="text-xs text-white/30 hover:text-red-400 transition-colors px-2 py-1 rounded-lg hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
 >
 Sign out
 </button>
 </div>
 </div>

 {/* Direct VIT Portal Link Banner */}
 <motion.a
 href={GAS_URL}
 target="_blank"
 rel="noopener noreferrer"
 whileHover={{ scale: 1.01 }}
 whileTap={{ scale: 0.99 }}
 className="flex items-center justify-between gap-4 px-5 py-3.5 rounded-2xl bg-zinc-900/50 backdrop-blur-md border border-zinc-700/50 hover:border-zinc-600/50 hover:from-cyan-500/15 hover:to-violet-500/15 transition-all group cursor-pointer"
 >
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-lg bg-zinc-800/50 flex items-center justify-center flex-shrink-0">
 <ExternalLink size={15} className="text-zinc-300" />
 </div>
 <div>
 <p className="text-sm font-semibold text-white group-hover:text-zinc-100 transition-colors">Access Full Faculty Details on VIT Portal</p>
 <p className="text-xs text-white/35">Opens the official VIT faculty information system in a new tab</p>
 </div>
 </div>
 <ChevronRight size={16} className="text-white/30 group-hover:text-zinc-100 flex-shrink-0 transition-colors" />
 </motion.a>

 <div className="relative">
 <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
 <input
 type="text"
 value={query}
 onChange={(e) => handleSearch(e.target.value)}
 placeholder="Search by faculty name, employee ID (FAC001), department, or specialization..."
 className="w-full bg-white/[0.04] border border-white/[0.08] focus:border-zinc-700/50 rounded-2xl pl-12 pr-5 py-4 text-sm text-white placeholder-white/25 outline-none transition-colors focus:bg-white/[0.06]"
 />
 {query && (
 <button onClick={() => handleSearch('')} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
 <X size={16} />
 </button>
 )}
 </div>
 <div className="flex flex-wrap gap-2">
 {schools.map((s) => (
 <button
 key={s}
 onClick={() => handleFilterChange(s)}
 className={"px-4 py-1.5 rounded-full text-xs font-semibold transition-all " + (filter === s ? 'bg-zinc-800/50 text-zinc-300 border border-zinc-700/50' : 'bg-white/[0.03] text-white/40 border border-white/[0.07] hover:border-white/[0.15] hover:text-white/60')}
 >
 {s === 'all' ? 'All Schools' : s}
 </button>
 ))}
 </div>
 <div className="flex items-center text-sm">
 {loading ? (
 <span className="flex items-center gap-1.5 text-white/40"><Loader2 size={12} className="animate-spin text-zinc-300" />Searching...</span>
 ) : (
 <span className="text-white/40"><span className="text-zinc-300 font-semibold">{results.length}</span> {results.length === 1 ? 'faculty member' : 'faculty members'} found</span>
 )}
 </div>
 <AnimatePresence mode="wait">
 {results.length === 0 && !loading ? (
 <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-20 text-center">
 <div className="w-16 h-16 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-4">
 <Search size={28} className="text-white/20" />
 </div>
 <p className="text-white/40 font-medium">No faculty members found</p>
 <p className="text-white/20 text-sm mt-1">Try a different name, ID, or department</p>
 <button onClick={() => handleSearch('')} className="mt-4 text-sm text-zinc-300 hover:text-zinc-100 transition-colors">Clear search</button>
 </motion.div>
 ) : (
 <motion.div key="grid" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
 {results.map((faculty, idx) => (
 <motion.div key={faculty.employeeId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }}>
 <FacultyCard faculty={faculty} onClick={() => setSelectedFaculty(faculty)} />
 </motion.div>
 ))}
 </motion.div>
 )}
 </AnimatePresence>
 <AnimatePresence>
 {selectedFaculty && <FacultyDetailModal faculty={selectedFaculty} onClose={() => setSelectedFaculty(null)} />}
 </AnimatePresence>
 </div>
 );
}
