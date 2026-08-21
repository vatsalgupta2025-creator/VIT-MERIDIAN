'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Briefcase, Linkedin, FileText, Trophy, Sparkles, Plus, Trash2, Download,
    Printer, Copy, Check, Loader2, ExternalLink, Calendar, MapPin, Clock,
    Users, Star, ArrowUpRight, ChevronRight, GraduationCap, Globe, Code,
    Rocket, Building2, Zap, Award, Target, BookOpen, LayoutTemplate, Eye,
    FileDown, BarChart3, AlertCircle, CheckCircle2, Lightbulb, Palette,
    Type, AlignLeft, Monitor, Save, RefreshCw, ChevronDown, Maximize2,
    X, Award as AwardIcon, TrendingUp, FileCheck, Briefcase as BriefcaseIcon, Edit3
} from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'YOUR_GEMINI_API_KEY_HERE';

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`;

// â”€â”€ Types â”€â”€
type TemplateType = 'modern' | 'classic' | 'minimal' | 'creative';

interface ResumeData {
    fullName: string;
    email: string;
    phone: string;
    linkedin: string;
    github: string;
    portfolio: string;
    summary: string;
    education: { institution: string; degree: string; year: string; gpa: string }[];
    experience: { company: string; role: string; duration: string; description: string }[];
    projects: { name: string; tech: string; description: string; link: string }[];
    skills: { category: string; items: string }[];
    certifications: string[];
    achievements: string[];
}

interface ResumeScore {
    overall: number;
    sections: {
        personal: number;
        summary: number;
        education: number;
        experience: number;
        projects: number;
        skills: number;
        extras: number;
    };
    feedback: string[];
    suggestions: string[];
    atsTips: string[];
}

interface Internship {
    id: string;
    company: string;
    role: string;
    type: string;
    stipend: string;
    duration: string;
    link: string;
    tags: string[];
    color: string;
    platform: string;
    deadline?: string;
}

interface Hackathon {
    id: string;
    name: string;
    organizer: string;
    date: string;
    mode: string;
    prizes: string;
    link: string;
    tags: string[];
    color: string;
    status: 'upcoming' | 'live' | 'ended';
}

const tabs = [
    { id: 'linkedin' as const, label: 'LinkedIn Post', icon: Linkedin, color: 'blue' },
    { id: 'resume' as const, label: 'Resume Builder', icon: FileText, color: 'violet' },
    { id: 'internships' as const, label: 'Internships', icon: Briefcase, color: 'emerald' },
    { id: 'hackathons' as const, label: 'Hackathons', icon: Trophy, color: 'amber' }
];

// â”€â”€ Templates Configuration â”€â”€
const templates: { id: TemplateType; name: string; description: string; icon: React.ElementType; color: string }[] = [
    { id: 'modern', name: 'Modern', description: 'Clean with accent colors', icon: Monitor, color: 'cyan' },
    { id: 'classic', name: 'Classic', description: 'Traditional professional', icon: BriefcaseIcon, color: 'slate' },
    { id: 'minimal', name: 'Minimal', description: 'Simple and elegant', icon: Type, color: 'zinc' },
    { id: 'creative', name: 'Creative', description: 'Bold & eye-catching', icon: Palette, color: 'violet' },
];

// â”€â”€ Data â”€â”€
const internships: Internship[] = [
    { id: '1', company: 'Google', role: 'SWE Intern', type: 'Remote', stipend: 'â‚¹80K/mo', duration: '3 months', link: 'https://careers.google.com/students/', tags: ['SDE', 'DSA', 'System Design'], color: 'cyan', platform: 'Google Careers', deadline: 'Rolling' },
    { id: '2', company: 'Microsoft', role: 'SDE Intern', type: 'Hybrid', stipend: 'â‚¹60K/mo', duration: '2 months', link: 'https://careers.microsoft.com/students/', tags: ['Azure', 'C#', '.NET'], color: 'blue', platform: 'Microsoft Careers', deadline: 'March 2026' },
    { id: '3', company: 'Amazon', role: 'SDE Intern', type: 'On-site', stipend: 'â‚¹1L/mo', duration: '6 months', link: 'https://www.amazon.jobs/en/teams/internships-for-students', tags: ['AWS', 'Java', 'Distributed Systems'], color: 'amber', platform: 'Amazon Jobs', deadline: 'Rolling' },
    { id: '4', company: 'Flipkart', role: 'GRiD Intern', type: 'Hybrid', stipend: 'â‚¹50K/mo', duration: '2 months', link: 'https://www.flipkartcareers.com/', tags: ['Backend', 'React', 'Microservices'], color: 'blue', platform: 'Flipkart Careers', deadline: 'Sept 2026' },
    { id: '5', company: 'Goldman Sachs', role: 'Summer Analyst', type: 'On-site', stipend: 'â‚¹1.2L/mo', duration: '8 weeks', link: 'https://www.goldmansachs.com/careers/students/', tags: ['Finance', 'Java', 'Analytics'], color: 'amber', platform: 'GS Careers', deadline: 'Nov 2026' },
    { id: '6', company: 'Wellfound', role: 'Startup Jobs', type: 'Remote/Hybrid', stipend: 'Varies', duration: 'Varies', link: 'https://wellfound.com/', tags: ['Startups', 'SWE', 'Product'], color: 'violet', platform: 'Wellfound', deadline: 'Always Open' },
    { id: '7', company: 'Simplify.jobs', role: 'One-Click Apply', type: 'Remote', stipend: 'Varies', duration: 'Varies', link: 'https://simplify.jobs/', tags: ['Auto Apply', 'SWE', 'Aggregator'], color: 'cyan', platform: 'Simplify', deadline: 'Always Open' },
    { id: '8', company: 'TheHub.io', role: 'Tech & Startup', type: 'Remote/On-site', stipend: 'Varies', duration: 'Varies', link: 'https://thehub.io/', tags: ['European', 'Startup', 'Tech'], color: 'emerald', platform: 'TheHub', deadline: 'Always Open' },
    { id: '9', company: 'Riipen', role: 'Project-Based', type: 'Virtual', stipend: 'Academic Credit', duration: '4-8 weeks', link: 'https://www.riipen.com/', tags: ['Projects', 'Academic', 'Experiential'], color: 'blue', platform: 'Riipen', deadline: 'Always Open' },
    { id: '10', company: 'Outreachy', role: 'Open Source Intern', type: 'Remote', stipend: '$7,000 stipend', duration: '3 months', link: 'https://www.outreachy.org/', tags: ['Open Source', 'Diversity', 'Paid'], color: 'rose', platform: 'Outreachy', deadline: 'Cohort Based' },
    { id: '11', company: 'Internshala', role: 'Various Roles', type: 'Virtual', stipend: 'â‚¹5-25K/mo', duration: '1-6 months', link: 'https://internshala.com/', tags: ['Web Dev', 'ML', 'Marketing'], color: 'violet', platform: 'Internshala', deadline: 'Always Open' },
    { id: '12', company: 'AICTE', role: 'Virtual Intern (Govt)', type: 'Virtual', stipend: 'Free + Certificate', duration: '2-3 months', link: 'https://internship.aicte-india.org/', tags: ['AI', 'IoT', 'Cybersecurity'], color: 'rose', platform: 'AICTE Portal', deadline: 'Semester Based' },
    { id: '13', company: 'LetsGrowMore', role: 'Virtual Intern', type: 'Virtual', stipend: 'Free + Certificate', duration: '1 month', link: 'https://letsgrowmore.in/', tags: ['Web Dev', 'Data Science', 'Open Source'], color: 'emerald', platform: 'LetsGrowMore', deadline: 'Cohort Based' },
    { id: '14', company: 'WeMakeDevs', role: 'Community Intern', type: 'Virtual', stipend: 'Free + Network', duration: 'Flexible', link: 'http://wemakedevs.org/', tags: ['Community', 'Open Source', 'Learning'], color: 'cyan', platform: 'WeMakeDevs', deadline: 'Always Open' },
    { id: '15', company: 'IIT Madras', role: 'Summer Fellowship', type: 'On-site', stipend: 'Stipend + Cert', duration: '2 months', link: 'https://www.moneycontrol.com/education/iit-madras-summer-fellowship-programme-2026-check-eligibility-stipend-and-direct-link-to-apply-here-article-13807630.html', tags: ['Research', 'IIT', 'Summer'], color: 'amber', platform: 'IIT Madras', deadline: 'Feb-Mar 2026' },
    { id: '16', company: '2026 SWE Jobs', role: 'Curated GitHub List', type: 'Remote/On-site', stipend: 'Varies', duration: 'Varies', link: 'https://github.com/speedyapply/2026-SWE-College-Jobs', tags: ['GitHub List', 'SWE', '2026 Batch'], color: 'violet', platform: 'GitHub', deadline: 'Rolling' },
    { id: '17', company: 'Remote Internships', role: 'Paid Remote List', type: 'Remote', stipend: 'Paid', duration: 'Varies', link: 'https://www.notion.so/Remote-Paid-Internship-List-2f0a81523043801bae9cdd6369ef99a3', tags: ['Notion List', 'Remote', 'Paid'], color: 'emerald', platform: 'Notion', deadline: 'Rolling' },
    { id: '18', company: 'Job Guide Doc', role: 'Application Guide', type: 'Guide', stipend: 'Free', duration: 'Resource', link: 'https://docs.google.com/document/d/1G51cE4rz2e3t5HBjdZzlNSoduKq5aLhsSwRRxj603kg/edit', tags: ['Guide', 'How-To', 'Apply'], color: 'blue', platform: 'Google Doc', deadline: 'â€”' },
    { id: '19', company: 'Free AI Tools', role: 'AI Resources', type: 'Guide', stipend: 'Free', duration: 'Resource', link: 'https://reflective-index-19c.notion.site/Free-AI-Tools-2deba954f16780c987e6e275977252c8', tags: ['AI Tools', 'Free', 'Notion'], color: 'cyan', platform: 'Notion', deadline: 'â€”' },
];

const hackathons: Hackathon[] = [
    { id: '1', name: 'MLH Global Hack Week', organizer: 'Major League Hacking', date: 'Every Month', mode: 'Online', prizes: 'Swag + Certificates', link: 'https://mlh.io/', tags: ['Global', 'Beginner Friendly', 'Weekly'], color: 'emerald', status: 'live' },
    { id: '2', name: 'Devfolio Hackathons', organizer: 'Devfolio Platform', date: 'Ongoing', mode: 'Online', prizes: 'Varies', link: 'https://devfolio.co/hackathons', tags: ['Web3', 'Open Source', 'All Levels'], color: 'blue', status: 'live' },
    { id: '3', name: 'Unstop Hackathons', organizer: 'Unstop Platform', date: 'Ongoing', mode: 'Online', prizes: 'Varies', link: 'https://unstop.com/hackathons', tags: ['Corporate', 'Innovation', 'All Domains'], color: 'violet', status: 'live' },
    { id: '4', name: 'DevsHouse \'26 (DÂ³)', organizer: 'GDG On Campus Â· VIT Chennai', date: '27-29 March 2026', mode: 'Offline (VIT Chennai)', prizes: 'Cash + Swag', link: 'https://www.devshouse.in/', tags: ['VIT Chennai', '48hrs', 'GDG'], color: 'cyan', status: 'upcoming' },
    { id: '5', name: 'BlackRock HackIndia 2026', organizer: 'BlackRock x HackerRank', date: 'March 2026', mode: 'Online', prizes: 'Cash + PPO', link: 'https://www.hackerrank.com/event/blackrock-hackingindia2026', tags: ['Finance', 'HackerRank', 'PPO'], color: 'amber', status: 'upcoming' },
    { id: '6', name: 'Smart India Hackathon (SIH)', organizer: 'Govt. of India', date: 'Aug - Dec 2026', mode: 'Hybrid', prizes: 'â‚¹1L per problem', link: 'https://www.sih.gov.in/', tags: ['Government', 'Innovation', 'National'], color: 'cyan', status: 'upcoming' },
    { id: '7', name: 'HackVIT', organizer: 'VIT Vellore', date: 'March 2026', mode: 'Offline', prizes: 'â‚¹3L+ prizes', link: 'https://hackvit.in/', tags: ['VIT', 'Web3', 'AI/ML'], color: 'violet', status: 'upcoming' },
    { id: '8', name: 'Google Solution Challenge', organizer: 'Google', date: 'Jan - Mar 2026', mode: 'Online', prizes: '$3000 per team', link: 'https://developers.google.com/community/gdsc-solution-challenge', tags: ['UN SDGs', 'Google Tech', 'Global'], color: 'amber', status: 'upcoming' },
    { id: '9', name: 'HackWithInfy', organizer: 'Infosys', date: 'May - Aug 2026', mode: 'Online + Offline', prizes: 'PPO + â‚¹2L', link: 'https://www.infosys.com/careers/hackwithinfy.html', tags: ['PPO', 'DSA', 'Innovation'], color: 'rose', status: 'upcoming' },
    { id: '10', name: 'ETHIndia', organizer: 'Devfolio', date: 'Dec 2026', mode: 'Offline (Bangalore)', prizes: '$50K+ in bounties', link: 'https://ethindia.co/', tags: ['Web3', 'Ethereum', 'Blockchain'], color: 'cyan', status: 'upcoming' },
];

const defaultResume: ResumeData = {
    fullName: '', email: '', phone: '', linkedin: '', github: '', portfolio: '', summary: '',
    education: [{ institution: '', degree: '', year: '', gpa: '' }],
    experience: [{ company: '', role: '', duration: '', description: '' }],
    projects: [{ name: '', tech: '', description: '', link: '' }],
    skills: [{ category: 'Languages', items: '' }, { category: 'Frameworks', items: '' }, { category: 'Tools', items: '' }],
    certifications: [''],
    achievements: ['']
};

const containerV = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const itemV = { hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 300, damping: 24 } } };

// â”€â”€ Resume Preview Components â”€â”€
const ModernTemplate = ({ resume }: { resume: ResumeData }) => (
    <div className="bg-white text-slate-800 p-8 min-h-[800px] font-sans">
        <div className="border-l-4 border-cyan-500 pl-6 mb-6">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{resume.fullName || 'Your Name'}</h1>
            <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                {resume.email && <span>{resume.email}</span>}
                {resume.phone && <span>â€¢ {resume.phone}</span>}
                {resume.linkedin && <span>â€¢ LinkedIn</span>}
                {resume.github && <span>â€¢ GitHub</span>}
            </div>
        </div>
        {resume.summary && (
            <div className="mb-6">
                <h2 className="text-sm font-bold text-cyan-600 uppercase tracking-wider mb-2">Summary</h2>
                <p className="text-sm text-slate-700 leading-relaxed">{resume.summary}</p>
            </div>
        )}
        {resume.education.some(e => e.institution) && (
            <div className="mb-6">
                <h2 className="text-sm font-bold text-cyan-600 uppercase tracking-wider mb-3">Education</h2>
                {resume.education.filter(e => e.institution).map((edu, i) => (
                    <div key={i} className="mb-3">
                        <div className="flex justify-between items-baseline">
                            <h3 className="font-semibold text-slate-900">{edu.institution}</h3>
                            <span className="text-sm text-slate-500">{edu.year}</span>
                        </div>
                        <p className="text-sm text-slate-700">{edu.degree}{edu.gpa && <span className="text-slate-500"> â€¢ GPA: {edu.gpa}</span>}</p>
                    </div>
                ))}
            </div>
        )}
        {resume.experience.some(e => e.company) && (
            <div className="mb-6">
                <h2 className="text-sm font-bold text-cyan-600 uppercase tracking-wider mb-3">Experience</h2>
                {resume.experience.filter(e => e.company).map((exp, i) => (
                    <div key={i} className="mb-4">
                        <div className="flex justify-between items-baseline">
                            <h3 className="font-semibold text-slate-900">{exp.role} â€” {exp.company}</h3>
                            <span className="text-sm text-slate-500">{exp.duration}</span>
                        </div>
                        <p className="text-sm text-slate-700 mt-1">{exp.description}</p>
                    </div>
                ))}
            </div>
        )}
        {resume.projects.some(p => p.name) && (
            <div className="mb-6">
                <h2 className="text-sm font-bold text-cyan-600 uppercase tracking-wider mb-3">Projects</h2>
                {resume.projects.filter(p => p.name).map((proj, i) => (
                    <div key={i} className="mb-3">
                        <div className="flex justify-between items-baseline">
                            <h3 className="font-semibold text-slate-900">{proj.name}</h3>
                            <span className="text-sm text-slate-500">{proj.tech}</span>
                        </div>
                        <p className="text-sm text-slate-700 mt-1">{proj.description}</p>
                    </div>
                ))}
            </div>
        )}
        {resume.skills.some(s => s.items) && (
            <div className="mb-6">
                <h2 className="text-sm font-bold text-cyan-600 uppercase tracking-wider mb-3">Skills</h2>
                <div className="grid grid-cols-2 gap-2">
                    {resume.skills.filter(s => s.items).map((skill, i) => (
                        <div key={i} className="text-sm">
                            <span className="font-semibold text-slate-900">{skill.category}:</span>
                            <span className="text-slate-700"> {skill.items}</span>
                        </div>
                    ))}
                </div>
            </div>
        )}
    </div>
);

const ClassicTemplate = ({ resume }: { resume: ResumeData }) => (
    <div className="bg-white text-slate-800 p-8 min-h-[800px] font-serif">
        <div className="text-center border-b-2 border-slate-800 pb-4 mb-6">
            <h1 className="text-3xl font-bold text-slate-900 mb-2">{resume.fullName || 'Your Name'}</h1>
            <div className="text-sm text-slate-600">
                {[resume.email, resume.phone, resume.linkedin, resume.github].filter(Boolean).join(' | ')}
            </div>
        </div>
        {resume.summary && (
            <div className="mb-5">
                <h2 className="text-base font-bold text-slate-900 border-b border-slate-400 mb-2">Professional Summary</h2>
                <p className="text-sm text-slate-700 leading-relaxed">{resume.summary}</p>
            </div>
        )}
        {resume.education.some(e => e.institution) && (
            <div className="mb-5">
                <h2 className="text-base font-bold text-slate-900 border-b border-slate-400 mb-3">Education</h2>
                {resume.education.filter(e => e.institution).map((edu, i) => (
                    <div key={i} className="mb-2">
                        <div className="flex justify-between">
                            <span className="font-semibold">{edu.institution}</span>
                            <span className="text-sm">{edu.year}</span>
                        </div>
                        <div className="text-sm text-slate-700">{edu.degree}{edu.gpa && ` â€” GPA: ${edu.gpa}`}</div>
                    </div>
                ))}
            </div>
        )}
        {resume.experience.some(e => e.company) && (
            <div className="mb-5">
                <h2 className="text-base font-bold text-slate-900 border-b border-slate-400 mb-3">Work Experience</h2>
                {resume.experience.filter(e => e.company).map((exp, i) => (
                    <div key={i} className="mb-4">
                        <div className="flex justify-between">
                            <span className="font-semibold">{exp.role}, {exp.company}</span>
                            <span className="text-sm">{exp.duration}</span>
                        </div>
                        <p className="text-sm text-slate-700 mt-1">{exp.description}</p>
                    </div>
                ))}
            </div>
        )}
        {resume.projects.some(p => p.name) && (
            <div className="mb-5">
                <h2 className="text-base font-bold text-slate-900 border-b border-slate-400 mb-3">Projects</h2>
                {resume.projects.filter(p => p.name).map((proj, i) => (
                    <div key={i} className="mb-3">
                        <div className="flex justify-between">
                            <span className="font-semibold">{proj.name}</span>
                            <span className="text-sm italic">{proj.tech}</span>
                        </div>
                        <p className="text-sm text-slate-700">{proj.description}</p>
                    </div>
                ))}
            </div>
        )}
        {resume.skills.some(s => s.items) && (
            <div className="mb-5">
                <h2 className="text-base font-bold text-slate-900 border-b border-slate-400 mb-2">Skills</h2>
                {resume.skills.filter(s => s.items).map((skill, i) => (
                    <div key={i} className="text-sm mb-1">
                        <span className="font-semibold">{skill.category}:</span> {skill.items}
                    </div>
                ))}
            </div>
        )}
    </div>
);

const MinimalTemplate = ({ resume }: { resume: ResumeData }) => (
    <div className="bg-white text-slate-800 p-10 min-h-[800px] font-sans">
        <div className="mb-8">
            <h1 className="text-4xl font-light text-slate-900 mb-3">{resume.fullName || 'Your Name'}</h1>
            <div className="flex flex-wrap gap-4 text-xs text-slate-500 uppercase tracking-wider">
                {resume.email && <span>{resume.email}</span>}
                {resume.phone && <span>{resume.phone}</span>}
                {resume.linkedin && <span>LinkedIn</span>}
                {resume.github && <span>GitHub</span>}
            </div>
        </div>
        {resume.summary && (
            <div className="mb-6">
                <p className="text-sm text-slate-600 leading-relaxed">{resume.summary}</p>
            </div>
        )}
        {resume.experience.some(e => e.company) && (
            <div className="mb-6">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Experience</h2>
                {resume.experience.filter(e => e.company).map((exp, i) => (
                    <div key={i} className="mb-4">
                        <div className="flex justify-between items-baseline mb-1">
                            <h3 className="font-medium text-slate-900">{exp.role}</h3>
                            <span className="text-xs text-slate-400">{exp.duration}</span>
                        </div>
                        <p className="text-xs text-slate-500 mb-1">{exp.company}</p>
                        <p className="text-sm text-slate-600">{exp.description}</p>
                    </div>
                ))}
            </div>
        )}
        {resume.education.some(e => e.institution) && (
            <div className="mb-6">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Education</h2>
                {resume.education.filter(e => e.institution).map((edu, i) => (
                    <div key={i} className="mb-3">
                        <div className="flex justify-between items-baseline">
                            <h3 className="font-medium text-slate-900">{edu.institution}</h3>
                            <span className="text-xs text-slate-400">{edu.year}</span>
                        </div>
                        <p className="text-sm text-slate-600">{edu.degree}</p>
                    </div>
                ))}
            </div>
        )}
        {resume.projects.some(p => p.name) && (
            <div className="mb-6">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Projects</h2>
                {resume.projects.filter(p => p.name).map((proj, i) => (
                    <div key={i} className="mb-3">
                        <h3 className="font-medium text-slate-900">{proj.name}</h3>
                        <p className="text-xs text-slate-500">{proj.tech}</p>
                    </div>
                ))}
            </div>
        )}
        {resume.skills.some(s => s.items) && (
            <div>
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Skills</h2>
                <div className="flex flex-wrap gap-2">
                    {resume.skills.filter(s => s.items).map((skill, i) => (
                        <span key={i} className="text-xs text-slate-600 bg-slate-100 px-2 py-1 rounded">{skill.category}: {skill.items}</span>
                    ))}
                </div>
            </div>
        )}
    </div>
);

const CreativeTemplate = ({ resume }: { resume: ResumeData }) => (
    <div className="bg-gradient-to-br from-violet-50 to-cyan-50 text-slate-800 p-8 min-h-[800px] font-sans">
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
            <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold">
                    {(resume.fullName || 'Y').charAt(0).toUpperCase()}
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">{resume.fullName || 'Your Name'}</h1>
                    <div className="flex flex-wrap gap-2 text-xs text-slate-600 mt-1">
                        {resume.email && <span className="bg-slate-100 px-2 py-1 rounded-full">{resume.email}</span>}
                        {resume.phone && <span className="bg-slate-100 px-2 py-1 rounded-full">{resume.phone}</span>}
                    </div>
                </div>
            </div>
            {resume.summary && <p className="text-sm text-slate-600 leading-relaxed">{resume.summary}</p>}
        </div>
        <div className="grid grid-cols-2 gap-4">
            {resume.experience.some(e => e.company) && (
                <div className="bg-white rounded-xl shadow-md p-5">
                    <h2 className="text-sm font-bold text-violet-600 mb-3 flex items-center gap-2">
                        <BriefcaseIcon size={14} /> Experience
                    </h2>
                    {resume.experience.filter(e => e.company).slice(0, 2).map((exp, i) => (
                        <div key={i} className="mb-3">
                            <h3 className="font-semibold text-sm text-slate-900">{exp.role}</h3>
                            <p className="text-xs text-violet-500">{exp.company}</p>
                            <p className="text-xs text-slate-500">{exp.duration}</p>
                        </div>
                    ))}
                </div>
            )}
            {resume.education.some(e => e.institution) && (
                <div className="bg-white rounded-xl shadow-md p-5">
                    <h2 className="text-sm font-bold text-cyan-600 mb-3 flex items-center gap-2">
                        <GraduationCap size={14} /> Education
                    </h2>
                    {resume.education.filter(e => e.institution).map((edu, i) => (
                        <div key={i} className="mb-2">
                            <h3 className="font-semibold text-sm text-slate-900">{edu.institution}</h3>
                            <p className="text-xs text-slate-600">{edu.degree}</p>
                            <p className="text-xs text-slate-400">{edu.year}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
        {resume.projects.some(p => p.name) && (
            <div className="bg-white rounded-xl shadow-md p-5 mt-4">
                <h2 className="text-sm font-bold text-slate-800 mb-3">Projects</h2>
                <div className="flex flex-wrap gap-3">
                    {resume.projects.filter(p => p.name).map((proj, i) => (
                        <span key={i} className="bg-gradient-to-r from-violet-100 to-cyan-100 text-slate-700 px-3 py-1.5 rounded-full text-xs font-medium">
                            {proj.name}
                        </span>
                    ))}
                </div>
            </div>
        )}
        {resume.skills.some(s => s.items) && (
            <div className="bg-white rounded-xl shadow-md p-5 mt-4">
                <h2 className="text-sm font-bold text-slate-800 mb-3">Skills</h2>
                <div className="flex flex-wrap gap-2">
                    {resume.skills.filter(s => s.items).flatMap(s => s.items.split(',').map(item => item.trim())).filter(Boolean).map((skill, i) => (
                        <span key={i} className="bg-slate-800 text-white px-2 py-1 rounded text-xs">
                            {skill}
                        </span>
                    ))}
                </div>
            </div>
        )}
    </div>
);

export default function CareerHub() {
    const [activeTab, setActiveTab] = useState<'linkedin' | 'resume' | 'internships' | 'hackathons'>('linkedin');

    // LinkedIn
    const [postTopic, setPostTopic] = useState('');
    const [postTone, setPostTone] = useState('professional');
    const [postType, setPostType] = useState('achievement');
    const [generatedPost, setGeneratedPost] = useState('');
    const [generating, setGenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    // Resume
    const [resume, setResume] = useState<ResumeData>(defaultResume);
    const [activeResumeSection, setActiveResumeSection] = useState('personal');
    const [selectedTemplate, setSelectedTemplate] = useState<TemplateType>('modern');
    const [showPreview, setShowPreview] = useState(false);
    const [showScorePanel, setShowScorePanel] = useState(false);
    const [resumeScore, setResumeScore] = useState<ResumeScore | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [downloading, setDownloading] = useState(false);
    const resumeRef = useRef<HTMLDivElement>(null);

    // Load saved resume from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('vit-meridian_resume');
        if (saved) {
            try {
                setResume(JSON.parse(saved));
            } catch { }
        }
    }, []);

    // Auto-save resume
    useEffect(() => {
        const timer = setTimeout(() => {
            localStorage.setItem('vit-meridian_resume', JSON.stringify(resume));
        }, 1000);
        return () => clearTimeout(timer);
    }, [resume]);

    const generateLinkedInPost = async () => {
        if (!postTopic.trim()) return;
        setGenerating(true);
        setGeneratedPost('');
        try {
            const prompt = `Generate a compelling LinkedIn post about: "${postTopic}". 
Tone: ${postTone}. Type: ${postType}.
Rules:
- Start with a hook/attention-grabbing first line
- Use short paragraphs
- Include relevant emojis (not too many)
- Add 3-5 relevant hashtags at the end
- Keep it between 150-300 words
- Make it engaging and shareable
- Include a call-to-action at the end
- If it's an achievement post, show gratitude
- If it's a learning post, share key takeaways
- If it's a project post, highlight the impact
Output ONLY the post text, nothing else.`;

            const res = await fetch(GEMINI_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    generationConfig: { temperature: 0.8, maxOutputTokens: 1024 }
                })
            });
            const data = await res.json();
            setGeneratedPost(data.candidates?.[0]?.content?.parts?.[0]?.text || 'Failed to generate. Try again.');
        } catch {
            setGeneratedPost('Error generating post. Please try again.');
        } finally {
            setGenerating(false);
        }
    };

    const copyPost = () => {
        navigator.clipboard.writeText(generatedPost);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const updateResume = (field: string, value: any) => setResume(prev => ({ ...prev, [field]: value }));

    const analyzeResume = async () => {
        setAnalyzing(true);
        try {
            // Calculate base scores
            const sections = {
                personal: resume.fullName && resume.email ? 100 : resume.fullName ? 60 : 0,
                summary: resume.summary.length > 100 ? 100 : resume.summary.length > 50 ? 70 : resume.summary.length > 0 ? 40 : 0,
                education: resume.education.some(e => e.institution && e.degree) ? 100 : resume.education.some(e => e.institution) ? 60 : 0,
                experience: resume.experience.some(e => e.company && e.description.length > 50) ? 100 : resume.experience.some(e => e.company) ? 60 : 0,
                projects: resume.projects.some(p => p.name && p.description) ? 100 : resume.projects.some(p => p.name) ? 60 : 0,
                skills: resume.skills.some(s => s.items) ? 100 : 0,
                extras: resume.certifications.some(c => c) || resume.achievements.some(a => a) ? 100 : 40,
            };

            const overall = Math.round(Object.values(sections).reduce((a, b) => a + b, 0) / Object.keys(sections).length);

            // Generate AI feedback
            const prompt = `Analyze this resume and provide 3 specific improvements for ATS optimization and content quality:
Name: ${resume.fullName || 'N/A'}
Summary: ${resume.summary || 'N/A'}
Education: ${resume.education.map(e => e.institution).join(', ')}
Experience: ${resume.experience.map(e => `${e.role} at ${e.company}`).join(', ')}
Skills: ${resume.skills.map(s => s.items).join(', ')}

Return ONLY a JSON object like: {"feedback": ["tip1", "tip2", "tip3"], "suggestions": ["suggestion1", "suggestion2"], "atsTips": ["ats1", "ats2"]}`;

            let aiFeedback: Partial<ResumeScore> = {
                feedback: [
                    'Add more quantifiable achievements to your experience',
                    'Include relevant keywords from job descriptions',
                    'Expand your professional summary with specific expertise'
                ],
                suggestions: [
                    'Use action verbs at the start of bullet points',
                    'Keep resume to 1 page for early career professionals'
                ],
                atsTips: [
                    'Use standard section headings (Experience, Education)',
                    'Avoid tables and graphics that confuse ATS systems'
                ]
            };

            try {
                const res = await fetch(GEMINI_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.3, maxOutputTokens: 512 }
                    })
                });
                const data = await res.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    aiFeedback = JSON.parse(jsonMatch[0]);
                }
            } catch { }

            setResumeScore({
                overall,
                sections,
                feedback: aiFeedback.feedback || [],
                suggestions: aiFeedback.suggestions || [],
                atsTips: aiFeedback.atsTips || []
            });
            setShowScorePanel(true);
        } catch {
            // Fallback scoring
            setResumeScore({
                overall: 65,
                sections: {
                    personal: resume.fullName ? 100 : 0,
                    summary: resume.summary ? 70 : 0,
                    education: resume.education.some(e => e.institution) ? 80 : 0,
                    experience: resume.experience.some(e => e.company) ? 70 : 0,
                    projects: resume.projects.some(p => p.name) ? 80 : 0,
                    skills: resume.skills.some(s => s.items) ? 100 : 0,
                    extras: 50
                },
                feedback: ['Complete all sections for a higher score', 'Add quantifiable achievements', 'Include more project details'],
                suggestions: ['Use action verbs', 'Keep it concise'],
                atsTips: ['Use standard fonts', 'Avoid images']
            });
            setShowScorePanel(true);
        } finally {
            setAnalyzing(false);
        }
    };

    const downloadPDF = async () => {
        if (!resumeRef.current) return;
        setDownloading(true);
        try {
            const canvas = await html2canvas(resumeRef.current, {
                scale: 2,
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff'
            });
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`${resume.fullName || 'resume'}_${selectedTemplate}.pdf`);
        } catch {
            alert('Error generating PDF. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    const getColor = (c: string) => ({
        bg: c === 'cyan' ? 'bg-cyan-500/15' : c === 'blue' ? 'bg-blue-500/15' : c === 'violet' ? 'bg-violet-500/15' : c === 'emerald' ? 'bg-emerald-500/15' : c === 'amber' ? 'bg-amber-500/15' : 'bg-rose-500/15',
        text: c === 'cyan' ? 'text-cyan-400' : c === 'blue' ? 'text-blue-400' : c === 'violet' ? 'text-violet-400' : c === 'emerald' ? 'text-emerald-400' : c === 'amber' ? 'text-amber-400' : 'text-rose-400',
        border: c === 'cyan' ? 'border-cyan-500/20' : c === 'blue' ? 'border-blue-500/20' : c === 'violet' ? 'border-violet-500/20' : c === 'emerald' ? 'border-emerald-500/20' : c === 'amber' ? 'border-amber-500/20' : 'border-rose-500/20',
    });

    const InputField = ({ label, value, onChange, placeholder, textarea }: any) => (
        <div>
            <label className="text-white/40 text-[10px] uppercase tracking-wider mb-1 block">{label}</label>
            {textarea ? (
                <textarea value={value} onChange={onChange} placeholder={placeholder} rows={3}
                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-white/80 placeholder:text-white/15 focus:outline-none focus:border-cyan-500/30 resize-none" />
            ) : (
                <input type="text" value={value} onChange={onChange} placeholder={placeholder}
                    className="w-full bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-white/80 placeholder:text-white/15 focus:outline-none focus:border-cyan-500/30" />
            )}
        </div>
    );

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-400';
        if (score >= 60) return 'text-amber-400';
        return 'text-rose-400';
    };

    const getScoreBg = (score: number) => {
        if (score >= 80) return 'bg-emerald-500';
        if (score >= 60) return 'bg-amber-500';
        return 'bg-rose-500';
    };

    return (
        <motion.div variants={containerV} initial="hidden" animate="show" className="space-y-6 h-[calc(100vh-140px)] flex flex-col overflow-hidden relative">
            {/* Header */}
            <motion.div variants={itemV} className="flex flex-col md:flex-row md:items-center justify-between gap-4 flex-shrink-0 relative z-10">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center shadow-[0_0_30px_rgba(59,130,246,0.3)] border border-white/10">
                        <Rocket size={28} className="text-white drop-shadow-md" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">Career Launchpad</h2>
                        <p className="text-white/40 text-sm mt-1">Accelerate your tech career with AI-powered tools & opportunities</p>
                    </div>
                </div>
            </motion.div>

            {/* Tabs */}
            <motion.div variants={itemV} className="flex gap-2 p-1.5 bg-white/[0.02] backdrop-blur-md rounded-2xl w-fit flex-shrink-0 border border-white/[0.05] relative z-10 shadow-xl overflow-x-auto max-w-full hidden-scrollbar">
                {tabs.map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id
                            ? `bg-gradient-to-r from-${tab.color}-500/20 to-${tab.color}-500/10 text-${tab.color}-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)] border border-${tab.color}-500/30`
                            : 'text-white/40 hover:text-white/80 hover:bg-white/[0.04] border border-transparent'}`}>
                        <tab.icon size={16} className={activeTab === tab.id ? '' : 'opacity-70'} /> {tab.label}
                    </button>
                ))}
            </motion.div>

            <div className="flex-1 overflow-y-auto custom-scrollbar pb-6">
                <AnimatePresence mode="wait">
                    {/* â•â•â• LINKEDIN POST GENERATOR â•â•â• */}
                    {activeTab === 'linkedin' && (
                        <motion.div key="linkedin" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }} className="grid grid-cols-1 lg:grid-cols-2 gap-6 relative">
                            {/* Form */}
                            <div className="space-y-4">
                                <div className="bg-white/[0.02] backdrop-blur-md rounded-2xl p-6 border border-white/[0.05] shadow-[0_0_30px_rgba(0,0,0,0.2)]">
                                    <h3 className="text-base font-bold text-white mb-5 flex items-center gap-2 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]">
                                        <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center border border-blue-500/20 shadow-inner">
                                            <Sparkles size={16} className="text-blue-400" />
                                        </div>
                                        Generate Post
                                    </h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-white/40 text-[10px] font-bold uppercase tracking-wider mb-2 block ml-1">What's this post about?</label>
                                            <textarea value={postTopic} onChange={(e) => setPostTopic(e.target.value)}
                                                placeholder="e.g., Just completed my Google SWE internship, built a full-stack project using React and Node.js..."
                                                className="w-full bg-black/40 border border-white/[0.05] hover:border-blue-500/20 rounded-xl p-4 text-sm text-white/90 placeholder:text-white/20 focus:outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/40 resize-none transition-all" rows={4} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="text-white/40 text-[10px] font-bold uppercase tracking-wider mb-2 block ml-1">Tone</label>
                                                <select value={postTone} onChange={(e) => setPostTone(e.target.value)}
                                                    className="w-full bg-black/40 border border-white/[0.05] hover:border-blue-500/20 rounded-xl px-4 py-3 text-xs text-white/90 focus:outline-none focus:border-blue-500/40 transition-all appearance-none cursor-pointer">
                                                    <option value="professional">ðŸŽ¯ Professional</option>
                                                    <option value="casual">ðŸ‘‹ Casual & Friendly</option>
                                                    <option value="inspirational">â­ Inspirational</option>
                                                    <option value="storytelling">ðŸ“– Storytelling</option>
                                                    <option value="humble">ðŸ™ Humble & Grateful</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className="text-white/40 text-[10px] font-bold uppercase tracking-wider mb-2 block ml-1">Post Type</label>
                                                <select value={postType} onChange={(e) => setPostType(e.target.value)}
                                                    className="w-full bg-black/40 border border-white/[0.05] hover:border-blue-500/20 rounded-xl px-4 py-3 text-xs text-white/90 focus:outline-none focus:border-blue-500/40 transition-all appearance-none cursor-pointer">
                                                    <option value="achievement">ðŸ† Achievement</option>
                                                    <option value="learning">ðŸŽ“ Learning / Tip</option>
                                                    <option value="project">ðŸ’» Project Showcase</option>
                                                    <option value="experience">ðŸ’¼ Experience</option>
                                                    <option value="announcement">ðŸ“¢ Announcement</option>
                                                </select>
                                            </div>
                                        </div>
                                        <button onClick={generateLinkedInPost} disabled={!postTopic.trim() || generating}
                                            className="w-full py-3.5 bg-gradient-to-r from-blue-500 to-indigo-600 border border-blue-400/20 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 hover:opacity-90 hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:hover:scale-100 transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] mt-2">
                                            {generating ? <><Loader2 size={18} className="animate-spin" /> Crafting Post...</> : <><Sparkles size={18} /> Generate Magic</>}
                                        </button>
                                    </div>
                                </div>
                                {/* Tips */}
                                <div className="bg-white/[0.01] backdrop-blur-md rounded-2xl p-5 border border-white/[0.02]">
                                    <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider mb-3 ml-1 flex items-center gap-1.5"><Lightbulb size={12} className="text-amber-400" /> Tips for viral posts</p>
                                    <div className="space-y-2">
                                        {['Start with a hook â€” first line is everything', 'Be authentic and share real experiences', 'Use line breaks for readability', 'End with a question to drive engagement'].map(tip => (
                                            <p key={tip} className="text-white/40 text-xs flex items-center gap-2 bg-white/[0.02] p-2 rounded-lg">
                                                <CheckCircle2 size={12} className="text-blue-400/50 flex-shrink-0" /> {tip}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Generated Post */}
                            <div className="bg-white/[0.02] backdrop-blur-md rounded-2xl p-6 border border-white/[0.05] flex flex-col relative overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.2)]">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px] -mr-32 -mt-32 pointer-events-none" />

                                <div className="flex items-center justify-between mb-5 relative z-10">
                                    <h3 className="text-base font-bold text-white flex items-center gap-2 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)]">
                                        <div className="w-8 h-8 rounded-lg bg-[#0A66C2]/20 flex items-center justify-center border border-[#0A66C2]/20 shadow-inner">
                                            <Linkedin size={16} className="text-[#0A66C2]" />
                                        </div>
                                        Preview
                                    </h3>
                                    <AnimatePresence>
                                        {generatedPost && (
                                            <motion.button initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} onClick={copyPost}
                                                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${copied ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-blue-500/15 text-blue-400 border border-blue-500/20 hover:bg-blue-500/25 shadow-[0_0_15px_rgba(59,130,246,0.1)]'}`}>
                                                {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy to Clipboard</>}
                                            </motion.button>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {generatedPost ? (
                                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 bg-black/40 rounded-xl p-5 border border-white/[0.05] overflow-y-auto relative z-10 custom-scrollbar shadow-inner">
                                        <pre className="text-white/85 text-sm leading-relaxed whitespace-pre-wrap font-sans">{generatedPost}</pre>
                                    </motion.div>
                                ) : (
                                    <div className="flex-1 flex items-center justify-center text-center relative z-10 bg-black/20 rounded-xl border border-white/[0.02] border-dashed">
                                        <div className="p-8">
                                            <div className="w-16 h-16 rounded-2xl bg-white/[0.02] flex items-center justify-center mx-auto mb-4 border border-white/[0.05]">
                                                <Linkedin size={28} className="text-white/20" />
                                            </div>
                                            <p className="text-white/40 text-sm font-medium">Your generated post will appear here</p>
                                            <p className="text-white/20 text-xs mt-2">Describe your topic and let the AI do the magic</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    )}

                    {/* â•â•â• ENHANCED RESUME BUILDER â•â•â• */}
                    {activeTab === 'resume' && (
                        <motion.div key="resume" initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }} className="space-y-6">
                            {/* Template Selection */}
                            <div className="bg-white/[0.02] backdrop-blur-md rounded-2xl p-5 border border-white/[0.05] shadow-[0_0_30px_rgba(0,0,0,0.2)]">
                                <div className="flex flex-col md:flex-row md:items-center justify-between mb-5 gap-4">
                                    <h3 className="text-base font-bold text-white flex items-center gap-2 drop-shadow-[0_0_8px_rgba(139,92,246,0.5)]">
                                        <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center border border-violet-500/20 shadow-inner">
                                            <LayoutTemplate size={16} className="text-violet-400" />
                                        </div>
                                        Choose Template
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        <button
                                            onClick={analyzeResume}
                                            disabled={analyzing}
                                            className="px-4 py-2 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center gap-2 hover:from-emerald-500/30 hover:to-teal-500/30 transition-all shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                                        >
                                            {analyzing ? <><Loader2 size={14} className="animate-spin" /> Analyzing...</> : <><BarChart3 size={14} /> AI Analysis</>}
                                        </button>
                                        <button
                                            onClick={() => setShowPreview(!showPreview)}
                                            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${showPreview ? 'bg-violet-500 text-white shadow-[0_0_15px_rgba(139,92,246,0.5)] hover:bg-violet-600' : 'bg-violet-500/15 text-violet-400 border border-violet-500/30 hover:bg-violet-500/25 shadow-[0_0_15px_rgba(139,92,246,0.1)]'}`}
                                        >
                                            {showPreview ? <><Edit3 size={14} /> Back to Edit</> : <><Eye size={14} /> Live Preview</>}
                                        </button>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {templates.map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => setSelectedTemplate(t.id)}
                                            className={`p-4 rounded-xl border transition-all text-left relative overflow-hidden group ${selectedTemplate === t.id
                                                ? 'bg-violet-500/10 border-violet-500/50 shadow-[0_0_20px_rgba(139,92,246,0.2)]'
                                                : 'bg-black/20 border-white/[0.05] hover:bg-white/[0.04] hover:border-white/[0.1]'
                                                }`}
                                        >
                                            {selectedTemplate === t.id && <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-transparent pointer-events-none" />}
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 border ${selectedTemplate === t.id ? 'border-violet-500/30 bg-violet-500/20 shadow-inner' : 'border-white/5 bg-white/[0.03] group-hover:bg-white/[0.08] transition-colors'} relative z-10`}>
                                                <t.icon size={18} className={selectedTemplate === t.id ? 'text-violet-400' : 'text-white/40 group-hover:text-white/80'} />
                                            </div>
                                            <p className={`text-sm font-bold relative z-10 ${selectedTemplate === t.id ? 'text-white' : 'text-white/70 group-hover:text-white'}`}>{t.name}</p>
                                            <p className={`text-[10px] mt-0.5 relative z-10 ${selectedTemplate === t.id ? 'text-violet-200/70' : 'text-white/30'}`}>{t.description}</p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                {/* Left: Sections nav - Sidebar */}
                                <div className="space-y-4 lg:col-span-1">
                                    <div className="bg-white/[0.02] backdrop-blur-md rounded-2xl p-5 border border-white/[0.05] shadow-[0_0_30px_rgba(0,0,0,0.2)] sticky top-6">
                                        <h3 className="text-sm font-bold text-white/50 uppercase tracking-widest mb-4 ml-1">Editor Menu</h3>
                                        <div className="space-y-1.5">
                                            {[
                                                { id: 'personal', label: 'Personal Info', icon: Users },
                                                { id: 'education', label: 'Education', icon: GraduationCap },
                                                { id: 'experience', label: 'Experience', icon: Building2 },
                                                { id: 'projects', label: 'Projects', icon: Code },
                                                { id: 'skills', label: 'Skills', icon: Zap },
                                                { id: 'extras', label: 'Certifications', icon: Award },
                                            ].map(s => (
                                                <button key={s.id} onClick={() => setActiveResumeSection(s.id)}
                                                    className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeResumeSection === s.id ? 'bg-gradient-to-r from-violet-500/20 to-violet-500/5 text-violet-400 border border-violet-500/20 shadow-inner' : 'text-white/50 hover:text-white/90 hover:bg-white/[0.03] border border-transparent'}`}>
                                                    <s.icon size={16} /> {s.label}
                                                </button>
                                            ))}
                                        </div>
                                        <div className="mt-6 pt-6 border-t border-white/[0.05] space-y-3">
                                            <button
                                                onClick={downloadPDF}
                                                disabled={downloading || !resume.fullName}
                                                className="w-full py-3 bg-gradient-to-r from-violet-500 to-indigo-600 border border-violet-400/20 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 hover:opacity-90 hover:scale-[1.02] active:scale-95 disabled:opacity-30 disabled:hover:scale-100 transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)]"
                                            >
                                                {downloading ? <><Loader2 size={16} className="animate-spin" /> Preparing PDF...</> : <><FileDown size={16} /> Export PDF</>}
                                            </button>
                                            <button
                                                onClick={() => setResume(defaultResume)}
                                                className="w-full py-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-bold rounded-xl hover:bg-red-500/20 transition-all flex items-center justify-center gap-2"
                                            >
                                                <RefreshCw size={14} /> Wipe Data
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Middle: Form or Score Panel */}
                                <div className="lg:col-span-3">
                                    {showScorePanel && resumeScore ? (
                                        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className="bg-white/[0.02] backdrop-blur-md rounded-2xl p-6 border border-white/[0.05] shadow-[0_0_30px_rgba(0,0,0,0.2)] space-y-6">
                                            <div className="flex items-center justify-between">
                                                <h3 className="text-base font-bold text-white flex items-center gap-2 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">
                                                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center border border-emerald-500/20 shadow-inner">
                                                        <BarChart3 size={16} className="text-emerald-400" />
                                                    </div>
                                                    AI Score Analysis
                                                </h3>
                                                <button onClick={() => setShowScorePanel(false)} className="w-8 h-8 rounded-full bg-white/[0.05] flex items-center justify-center text-white/40 hover:text-white/90 hover:bg-white/[0.1] transition-colors">
                                                    <X size={16} />
                                                </button>
                                            </div>

                                            {/* Overall Score */}
                                            <div className="flex items-center gap-4 p-4 bg-white/[0.02] rounded-xl">
                                                <div className="relative w-20 h-20">
                                                    <svg className="w-20 h-20 -rotate-90">
                                                        <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="6" />
                                                        <circle
                                                            cx="40" cy="40" r="36" fill="none"
                                                            stroke={getScoreColor(resumeScore.overall).replace('text-', '').replace('400', '500')}
                                                            strokeWidth="6" strokeLinecap="round"
                                                            strokeDasharray={`${resumeScore.overall * 2.26} 226`}
                                                            className="transition-all duration-1000"
                                                        />
                                                    </svg>
                                                    <span className={`absolute inset-0 flex items-center justify-center text-xl font-bold ${getScoreColor(resumeScore.overall)}`}>
                                                        {resumeScore.overall}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-white/80 font-medium">Overall Score</p>
                                                    <p className="text-white/40 text-xs">
                                                        {resumeScore.overall >= 80 ? 'Excellent! Your resume is ATS-friendly.' : resumeScore.overall >= 60 ? 'Good, but can be improved.' : 'Needs significant improvements.'}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Section Scores */}
                                            <div className="grid grid-cols-2 gap-3">
                                                {Object.entries(resumeScore.sections).map(([key, score]) => (
                                                    <div key={key} className="p-3 bg-white/[0.02] rounded-lg">
                                                        <div className="flex justify-between items-center mb-1">
                                                            <span className="text-white/60 text-xs capitalize">{key}</span>
                                                            <span className={`text-xs font-bold ${getScoreColor(score)}`}>{score}%</span>
                                                        </div>
                                                        <div className="h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                                                            <div className={`h-full ${getScoreBg(score)} rounded-full transition-all duration-500`} style={{ width: `${score}%` }} />
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>

                                            {/* Feedback */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-lg">
                                                    <p className="text-emerald-400 text-xs font-medium mb-2 flex items-center gap-1">
                                                        <CheckCircle2 size={12} /> Strengths
                                                    </p>
                                                    <ul className="space-y-1">
                                                        {resumeScore.feedback.map((f, i) => (
                                                            <li key={i} className="text-white/50 text-[10px] flex items-start gap-1.5">
                                                                <span className="text-emerald-400 mt-0.5">âœ“</span> {f}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="p-3 bg-amber-500/5 border border-amber-500/10 rounded-lg">
                                                    <p className="text-amber-400 text-xs font-medium mb-2 flex items-center gap-1">
                                                        <Lightbulb size={12} /> Suggestions
                                                    </p>
                                                    <ul className="space-y-1">
                                                        {resumeScore.suggestions.map((s, i) => (
                                                            <li key={i} className="text-white/50 text-[10px] flex items-start gap-1.5">
                                                                <span className="text-amber-400 mt-0.5">â€¢</span> {s}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>

                                            {/* ATS Tips */}
                                            <div className="p-3 bg-violet-500/5 border border-violet-500/10 rounded-lg">
                                                <p className="text-violet-400 text-xs font-medium mb-2 flex items-center gap-1">
                                                    <FileCheck size={12} /> ATS Optimization Tips
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {resumeScore.atsTips.map((t, i) => (
                                                        <span key={i} className="text-[10px] text-white/50 bg-violet-500/10 px-2 py-1 rounded">
                                                            {t}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : showPreview ? (
                                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-[#0c0f17] rounded-xl p-5 border border-white/[0.05]">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                                                    <Eye size={14} className="text-violet-400" /> Preview: {templates.find(t => t.id === selectedTemplate)?.name}
                                                </h3>
                                                <span className="text-xs text-white/30">Scroll to see full preview</span>
                                            </div>
                                            <div className="bg-gray-200 rounded-lg overflow-hidden max-h-[600px] overflow-y-auto">
                                                <div ref={resumeRef}>
                                                    {selectedTemplate === 'modern' && <ModernTemplate resume={resume} />}
                                                    {selectedTemplate === 'classic' && <ClassicTemplate resume={resume} />}
                                                    {selectedTemplate === 'minimal' && <MinimalTemplate resume={resume} />}
                                                    {selectedTemplate === 'creative' && <CreativeTemplate resume={resume} />}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <div className="bg-[#0c0f17] rounded-xl p-5 border border-white/[0.05]">
                                            {activeResumeSection === 'personal' && (
                                                <div className="space-y-3">
                                                    <h3 className="text-sm font-semibold text-white mb-2">Personal Information</h3>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        <InputField label="Full Name" value={resume.fullName} onChange={(e: any) => updateResume('fullName', e.target.value)} placeholder="John Doe" />
                                                        <InputField label="Email" value={resume.email} onChange={(e: any) => updateResume('email', e.target.value)} placeholder="john@email.com" />
                                                        <InputField label="Phone" value={resume.phone} onChange={(e: any) => updateResume('phone', e.target.value)} placeholder="+91 98765 43210" />
                                                        <InputField label="LinkedIn URL" value={resume.linkedin} onChange={(e: any) => updateResume('linkedin', e.target.value)} placeholder="linkedin.com/in/johndoe" />
                                                        <InputField label="GitHub URL" value={resume.github} onChange={(e: any) => updateResume('github', e.target.value)} placeholder="github.com/johndoe" />
                                                        <InputField label="Portfolio" value={resume.portfolio} onChange={(e: any) => updateResume('portfolio', e.target.value)} placeholder="johndoe.dev" />
                                                    </div>
                                                    <InputField label="Professional Summary" value={resume.summary} onChange={(e: any) => updateResume('summary', e.target.value)} placeholder="A brief summary of your skills and goals..." textarea />
                                                </div>
                                            )}

                                            {activeResumeSection === 'education' && (
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="text-sm font-semibold text-white">Education</h3>
                                                        <button onClick={() => updateResume('education', [...resume.education, { institution: '', degree: '', year: '', gpa: '' }])}
                                                            className="text-[10px] text-cyan-400 flex items-center gap-1"><Plus size={11} /> Add</button>
                                                    </div>
                                                    {resume.education.map((edu, i) => (
                                                        <div key={i} className="p-3 bg-white/[0.02] rounded-lg border border-white/[0.04] space-y-2">
                                                            <div className="flex justify-between items-center">
                                                                <span className="text-[10px] text-white/30">Entry {i + 1}</span>
                                                                {resume.education.length > 1 && <button onClick={() => updateResume('education', resume.education.filter((_, j) => j !== i))} className="text-white/15 hover:text-red-400"><Trash2 size={10} /></button>}
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <InputField label="Institution" value={edu.institution} onChange={(e: any) => { const n = [...resume.education]; n[i].institution = e.target.value; updateResume('education', n); }} placeholder="VIT Vellore" />
                                                                <InputField label="Degree" value={edu.degree} onChange={(e: any) => { const n = [...resume.education]; n[i].degree = e.target.value; updateResume('education', n); }} placeholder="B.Tech CSE" />
                                                                <InputField label="Year" value={edu.year} onChange={(e: any) => { const n = [...resume.education]; n[i].year = e.target.value; updateResume('education', n); }} placeholder="2022 - 2026" />
                                                                <InputField label="GPA" value={edu.gpa} onChange={(e: any) => { const n = [...resume.education]; n[i].gpa = e.target.value; updateResume('education', n); }} placeholder="8.5/10" />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {activeResumeSection === 'experience' && (
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="text-sm font-semibold text-white">Experience</h3>
                                                        <button onClick={() => updateResume('experience', [...resume.experience, { company: '', role: '', duration: '', description: '' }])}
                                                            className="text-[10px] text-cyan-400 flex items-center gap-1"><Plus size={11} /> Add</button>
                                                    </div>
                                                    {resume.experience.map((exp, i) => (
                                                        <div key={i} className="p-3 bg-white/[0.02] rounded-lg border border-white/[0.04] space-y-2">
                                                            <div className="flex justify-between"><span className="text-[10px] text-white/30">Entry {i + 1}</span>{resume.experience.length > 1 && <button onClick={() => updateResume('experience', resume.experience.filter((_, j) => j !== i))} className="text-white/15 hover:text-red-400"><Trash2 size={10} /></button>}</div>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <InputField label="Company" value={exp.company} onChange={(e: any) => { const n = [...resume.experience]; n[i].company = e.target.value; updateResume('experience', n); }} placeholder="TechCorp" />
                                                                <InputField label="Role" value={exp.role} onChange={(e: any) => { const n = [...resume.experience]; n[i].role = e.target.value; updateResume('experience', n); }} placeholder="SDE Intern" />
                                                                <InputField label="Duration" value={exp.duration} onChange={(e: any) => { const n = [...resume.experience]; n[i].duration = e.target.value; updateResume('experience', n); }} placeholder="Jun 2025 - Aug 2025" />
                                                            </div>
                                                            <InputField label="Description" value={exp.description} onChange={(e: any) => { const n = [...resume.experience]; n[i].description = e.target.value; updateResume('experience', n); }} placeholder="Built a REST API serving 10K+ users..." textarea />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {activeResumeSection === 'projects' && (
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="text-sm font-semibold text-white">Projects</h3>
                                                        <button onClick={() => updateResume('projects', [...resume.projects, { name: '', tech: '', description: '', link: '' }])}
                                                            className="text-[10px] text-cyan-400 flex items-center gap-1"><Plus size={11} /> Add</button>
                                                    </div>
                                                    {resume.projects.map((proj, i) => (
                                                        <div key={i} className="p-3 bg-white/[0.02] rounded-lg border border-white/[0.04] space-y-2">
                                                            <div className="flex justify-between"><span className="text-[10px] text-white/30">Project {i + 1}</span>{resume.projects.length > 1 && <button onClick={() => updateResume('projects', resume.projects.filter((_, j) => j !== i))} className="text-white/15 hover:text-red-400"><Trash2 size={10} /></button>}</div>
                                                            <div className="grid grid-cols-2 gap-2">
                                                                <InputField label="Project Name" value={proj.name} onChange={(e: any) => { const n = [...resume.projects]; n[i].name = e.target.value; updateResume('projects', n); }} placeholder="E-Commerce Platform" />
                                                                <InputField label="Tech Stack" value={proj.tech} onChange={(e: any) => { const n = [...resume.projects]; n[i].tech = e.target.value; updateResume('projects', n); }} placeholder="React, Node.js, MongoDB" />
                                                                <InputField label="Link" value={proj.link} onChange={(e: any) => { const n = [...resume.projects]; n[i].link = e.target.value; updateResume('projects', n); }} placeholder="github.com/proj" />
                                                            </div>
                                                            <InputField label="Description" value={proj.description} onChange={(e: any) => { const n = [...resume.projects]; n[i].description = e.target.value; updateResume('projects', n); }} placeholder="Full-stack app with auth, payments..." textarea />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {activeResumeSection === 'skills' && (
                                                <div className="space-y-3">
                                                    <div className="flex items-center justify-between">
                                                        <h3 className="text-sm font-semibold text-white">Skills</h3>
                                                        <button onClick={() => updateResume('skills', [...resume.skills, { category: '', items: '' }])}
                                                            className="text-[10px] text-cyan-400 flex items-center gap-1"><Plus size={11} /> Add Category</button>
                                                    </div>
                                                    {resume.skills.map((skill, i) => (
                                                        <div key={i} className="p-3 bg-white/[0.02] rounded-lg border border-white/[0.04] space-y-2">
                                                            <div className="flex justify-between"><span className="text-[10px] text-white/30">Category {i + 1}</span>{resume.skills.length > 1 && <button onClick={() => updateResume('skills', resume.skills.filter((_, j) => j !== i))} className="text-white/15 hover:text-red-400"><Trash2 size={10} /></button>}</div>
                                                            <InputField label="Category" value={skill.category} onChange={(e: any) => { const n = [...resume.skills]; n[i].category = e.target.value; updateResume('skills', n); }} placeholder="Languages / Frameworks / Tools" />
                                                            <InputField label="Skills (comma-separated)" value={skill.items} onChange={(e: any) => { const n = [...resume.skills]; n[i].items = e.target.value; updateResume('skills', n); }} placeholder="Python, JavaScript, Java, C++" />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}

                                            {activeResumeSection === 'extras' && (
                                                <div className="space-y-4">
                                                    <div>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h3 className="text-sm font-semibold text-white">Certifications</h3>
                                                            <button onClick={() => updateResume('certifications', [...resume.certifications, ''])}
                                                                className="text-[10px] text-cyan-400 flex items-center gap-1"><Plus size={11} /> Add</button>
                                                        </div>
                                                        {resume.certifications.map((cert, i) => (
                                                            <div key={i} className="flex gap-2 mb-2">
                                                                <input type="text" value={cert} onChange={(e) => { const n = [...resume.certifications]; n[i] = e.target.value; updateResume('certifications', n); }}
                                                                    placeholder="AWS Certified Cloud Practitioner"
                                                                    className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-white/80 placeholder:text-white/15 focus:outline-none focus:border-cyan-500/30" />
                                                                {resume.certifications.length > 1 && <button onClick={() => updateResume('certifications', resume.certifications.filter((_, j) => j !== i))} className="text-white/15 hover:text-red-400"><Trash2 size={11} /></button>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h3 className="text-sm font-semibold text-white">Achievements</h3>
                                                            <button onClick={() => updateResume('achievements', [...resume.achievements, ''])}
                                                                className="text-[10px] text-cyan-400 flex items-center gap-1"><Plus size={11} /> Add</button>
                                                        </div>
                                                        {resume.achievements.map((ach, i) => (
                                                            <div key={i} className="flex gap-2 mb-2">
                                                                <input type="text" value={ach} onChange={(e) => { const n = [...resume.achievements]; n[i] = e.target.value; updateResume('achievements', n); }}
                                                                    placeholder="Won 1st place at HackVIT 2025"
                                                                    className="flex-1 bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-2 text-xs text-white/80 placeholder:text-white/15 focus:outline-none focus:border-cyan-500/30" />
                                                                {resume.achievements.length > 1 && <button onClick={() => updateResume('achievements', resume.achievements.filter((_, j) => j !== i))} className="text-white/15 hover:text-red-400"><Trash2 size={11} /></button>}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}

                    {/* â•â•â• INTERNSHIPS â•â•â• */}
                    {activeTab === 'internships' && (
                        <motion.div key="internships" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                            {/* Stats bar */}
                            <div className="grid grid-cols-4 gap-3">
                                {[
                                    { label: 'Total Listed', value: internships.length, icon: Briefcase, color: 'cyan' },
                                    { label: 'Remote', value: internships.filter(i => i.type === 'Remote' || i.type === 'Virtual').length, icon: Globe, color: 'emerald' },
                                    { label: 'Paid', value: internships.filter(i => i.stipend.includes('â‚¹')).length, icon: Target, color: 'amber' },
                                    { label: 'Govt / AICTE', value: internships.filter(i => i.tags.some(t => t.includes('AI') || t.includes('IoT'))).length, icon: Award, color: 'violet' },
                                ].map((s, i) => (
                                    <div key={i} className="bg-[#0c0f17] rounded-xl p-3.5 border border-white/[0.05] text-center">
                                        <s.icon size={16} className={`${getColor(s.color).text} mx-auto mb-1.5`} />
                                        <p className="text-xl font-bold text-white/80">{s.value}</p>
                                        <p className="text-[9px] text-white/25">{s.label}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Internship cards */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {internships.map((intern, i) => {
                                    const c = getColor(intern.color);
                                    return (
                                        <motion.a key={intern.id} href={intern.link} target="_blank" rel="noopener noreferrer"
                                            initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 24 }}
                                            whileHover={{ y: -4, scale: 1.01 }}
                                            className={`group relative bg-white/[0.02] backdrop-blur-md rounded-2xl p-5 border border-white/[0.05] hover:border-${intern.color}-500/30 transition-all duration-300 overflow-hidden`}>

                                            {/* Hover Glow */}
                                            <div className={`absolute inset-0 bg-gradient-to-br from-${intern.color}-500/0 to-${intern.color}-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

                                            <div className="flex items-start justify-between mb-4 relative z-10">
                                                <div className="flex items-center gap-3">
                                                    <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0 shadow-inner border border-white/5`}>
                                                        <Building2 size={20} className={c.text} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-white/90 text-base font-bold group-hover:text-white transition-colors">{intern.company}</h4>
                                                        <p className={`text-[11px] font-medium ${c.text}`}>{intern.role}</p>
                                                    </div>
                                                </div>
                                                <div className="w-8 h-8 rounded-full bg-white/[0.03] flex items-center justify-center group-hover:bg-white/[0.1] transition-colors">
                                                    <ArrowUpRight size={14} className="text-white/30 group-hover:text-white/90 transition-colors" />
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-white/50 mb-4 relative z-10">
                                                <span className="flex items-center gap-1.5 bg-white/[0.04] px-2.5 py-1 rounded-md"><MapPin size={10} className="text-white/30" /> {intern.type}</span>
                                                <span className="flex items-center gap-1.5 bg-white/[0.04] px-2.5 py-1 rounded-md"><Clock size={10} className="text-white/30" /> {intern.duration}</span>
                                                <span className={`flex items-center gap-1.5 font-bold ${c.text} bg-${intern.color}-500/10 px-2.5 py-1 rounded-md`}>{intern.stipend}</span>
                                            </div>

                                            <div className="flex items-center justify-between mt-auto relative z-10 pt-2 border-t border-white/[0.04]">
                                                <div className="flex flex-wrap gap-1.5">
                                                    {intern.tags.slice(0, 3).map(t => (
                                                        <span key={t} className="px-2 py-0.5 bg-black/40 text-white/40 text-[9px] font-medium rounded-full border border-white/[0.05]">{t}</span>
                                                    ))}
                                                    {intern.tags.length > 3 && <span className="px-2 py-0.5 bg-black/40 text-white/40 text-[9px] font-medium rounded-full border border-white/[0.05]">+{intern.tags.length - 3}</span>}
                                                </div>
                                                {intern.deadline && <span className="text-[10px] text-white/30 font-medium tracking-wide flex items-center gap-1"><Calendar size={10} /> {intern.deadline}</span>}
                                            </div>
                                        </motion.a>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}

                    {/* â•â•â• HACKATHONS â•â•â• */}
                    {activeTab === 'hackathons' && (
                        <motion.div key="hackathons" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                            {/* Status filters */}
                            <div className="flex gap-4">
                                {[
                                    { status: 'live', label: 'Live Now', icon: <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />, count: hackathons.filter(h => h.status === 'live').length, color: 'emerald' },
                                    { status: 'upcoming', label: 'Upcoming', icon: <Clock size={12} className="text-blue-400" />, count: hackathons.filter(h => h.status === 'upcoming').length, color: 'blue' },
                                ].map(f => (
                                    <div key={f.status} className={`bg-gradient-to-br from-${f.color}-500/10 to-${f.color}-500/5 rounded-2xl px-5 py-3 border border-${f.color}-500/20 flex items-center gap-3 backdrop-blur-md shadow-[0_4px_20px_rgba(0,0,0,0.2)]`}>
                                        <div className="flex items-center gap-2">
                                            {f.icon}
                                            <span className={`text-sm font-semibold text-${f.color}-400/90`}>{f.label}</span>
                                        </div>
                                        <span className={`px-2 py-0.5 bg-${f.color}-500/20 text-${f.color}-400 text-xs rounded-full font-bold ml-2`}>{f.count}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Live hackathons */}
                            {hackathons.filter(h => h.status === 'live').length > 0 && (
                                <div>
                                    <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-widest mb-4 flex items-center gap-2 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]">
                                        <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Live Now
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {hackathons.filter(h => h.status === 'live').map((hack, i) => {
                                            const c = getColor(hack.color);
                                            return (
                                                <motion.a key={hack.id} href={hack.link} target="_blank" rel="noopener noreferrer"
                                                    whileHover={{ scale: 1.02, y: -4 }} transition={{ type: 'spring', stiffness: 300 }}
                                                    className="group relative bg-white/[0.02] backdrop-blur-md rounded-2xl p-5 border border-emerald-500/20 hover:border-emerald-500/50 transition-all duration-300 overflow-hidden shadow-[0_0_15px_rgba(16,185,129,0.05)] hover:shadow-[0_0_30px_rgba(16,185,129,0.15)]">

                                                    {/* Glowing Background */}
                                                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/0 to-emerald-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                                                    <div className="flex items-center justify-between mb-4 relative z-10">
                                                        <div className={`w-12 h-12 rounded-xl ${c.bg} flex items-center justify-center border border-white/5 shadow-inner`}>
                                                            <Trophy size={18} className={c.text} />
                                                        </div>
                                                        <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-black tracking-wider rounded-lg border border-emerald-500/30 shadow-[0_0_10px_rgba(52,211,153,0.2)]">LIVE</span>
                                                    </div>
                                                    <h4 className="text-white/95 text-base font-bold mb-1 relative z-10">{hack.name}</h4>
                                                    <p className="text-emerald-400/60 text-xs font-medium mb-3 relative z-10">{hack.organizer}</p>

                                                    <div className="flex items-center gap-3 text-[11px] text-white/50 mb-4 relative z-10">
                                                        <span className="flex items-center gap-1.5 bg-white/[0.04] px-2.5 py-1 rounded-md"><Calendar size={10} /> {hack.date}</span>
                                                        <span className="flex items-center gap-1.5 bg-white/[0.04] px-2.5 py-1 rounded-md"><Globe size={10} /> {hack.mode}</span>
                                                    </div>

                                                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-white/[0.04] relative z-10">
                                                        <div className="flex flex-wrap gap-1.5">
                                                            {hack.tags.slice(0, 2).map(t => (
                                                                <span key={t} className="px-2 py-1 bg-black/40 text-white/50 text-[9px] font-semibold rounded-md border border-white/[0.05]">{t}</span>
                                                            ))}
                                                        </div>
                                                        <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 px-2 py-1 rounded-md border border-amber-500/20 shadow-[0_0_10px_rgba(251,191,36,0.1)]">ðŸ† {hack.prizes}</span>
                                                    </div>
                                                </motion.a>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Upcoming hackathons */}
                            <div>
                                <h3 className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-4 flex items-center gap-2 drop-shadow-[0_0_8px_rgba(96,165,250,0.5)] mt-6">
                                    <Clock size={14} className="text-blue-400" /> Upcoming
                                </h3>
                                <div className="space-y-3">
                                    {hackathons.filter(h => h.status === 'upcoming').map((hack, i) => {
                                        const c = getColor(hack.color);
                                        return (
                                            <motion.a key={hack.id} href={hack.link} target="_blank" rel="noopener noreferrer"
                                                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05, type: 'spring' }}
                                                whileHover={{ x: 6, scale: 1.005 }}
                                                className={`group flex items-center gap-5 p-4 bg-white/[0.02] backdrop-blur-md rounded-2xl border border-white/[0.05] hover:border-${hack.color}-500/30 transition-all duration-300 relative overflow-hidden shadow-sm hover:shadow-[0_0_20px_rgba(59,130,246,0.1)]`}>

                                                <div className={`absolute inset-0 bg-gradient-to-r from-${hack.color}-500/0 via-${hack.color}-500/0 to-${hack.color}-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

                                                <div className={`w-14 h-14 rounded-xl ${c.bg} flex items-center justify-center flex-shrink-0 border border-white/5 relative z-10`}>
                                                    <Trophy size={20} className={c.text} />
                                                </div>
                                                <div className="flex-1 min-w-0 relative z-10">
                                                    <h4 className="text-white/90 text-base font-bold truncate group-hover:text-white transition-colors">{hack.name}</h4>
                                                    <p className="text-white/40 text-xs mt-0.5 font-medium">{hack.organizer} <span className="mx-2 text-white/20">â€¢</span> {hack.mode}</p>
                                                    <div className="flex gap-2 mt-2">
                                                        {hack.tags.map(t => (
                                                            <span key={t} className="px-2 py-0.5 bg-black/40 text-white/40 text-[10px] font-medium rounded-md border border-white/[0.05]">{t}</span>
                                                        ))}
                                                    </div>
                                                </div>
                                                <div className="text-right flex-shrink-0 relative z-10 flex flex-col items-end gap-1">
                                                    <p className="text-xs text-blue-400/80 font-medium flex items-center gap-1.5 bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20"><Calendar size={11} /> {hack.date}</p>
                                                    <p className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/20">ðŸ† {hack.prizes}</p>
                                                </div>
                                                <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/[0.02] group-hover:bg-white/[0.08] transition-colors relative z-10 ml-2">
                                                    <ExternalLink size={16} className="text-white/20 group-hover:text-white/80 transition-colors" />
                                                </div>
                                            </motion.a>

                                        );
                                    })}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}


