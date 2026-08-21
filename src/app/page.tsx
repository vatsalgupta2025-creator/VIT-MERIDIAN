'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/Sidebar';
import DashboardOverview from '@/components/DashboardOverview';
import SearchBar from '@/components/SearchBar';
import SmartBriefing from '@/components/SmartBriefing';
import LearningComponent from '@/components/LearningComponent';
import FocusMode from '@/components/FocusMode';
import FileShare from '@/components/FileShare';
import OracleSearch from '@/components/OracleSearch';
import AnswerKeyManager from '@/components/AnswerKeyManager';
import StudyMaterials from '@/components/StudyMaterials';
import CareerHub from '@/components/CareerHub';
import LostAndFound from '@/components/LostAndFound';
import TimetableHelper from '@/components/TimetableHelper';
import RoommateMatch from '@/components/RoommateMatch';
import NoteShare from '@/components/NoteShare';
import AdminAutomation from '@/components/AdminAutomation';
import GroupStudy from '@/components/GroupStudy';
import QuickPoll from '@/components/QuickPoll';
import ClubsEvents from '@/components/ClubsEvents';
import StudyBuddy from '@/components/StudyBuddy';
import BudgetTracker from '@/components/BudgetTracker';
import AttendanceTracker from '@/components/AttendanceTracker';
import AIAssistant from '@/components/AIAssistant';
import LearningHub from '@/components/LearningHub';
import AiMockInterview from '@/components/AiMockInterview';
import MrVighelp from '@/components/MrVighelp';
import AiRoadmap from '@/components/AiRoadmap';
import CampusExplorer from '@/components/CampusExplorer';
import VisualAlgorithms from '@/components/VisualAlgorithms';
import TravelPool from '@/components/TravelPool';
import BusTransportation from '@/components/BusTransportation';
import ProfileView from '@/components/ProfileView';
import FacultyManagement from '@/components/FacultyManagement';
import StudentDetailsModal from '@/components/StudentDetailsModal';
import { UserProvider } from '@/context/UserContext';
import { AnimatedAIChat } from '@/components/ui/animated-ai-chat';

const BootScreen = dynamic(() => import('@/components/BootScreen'), { ssr: false });

export default function Home() {
  const [booted, setBooted] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');

  // Listen for custom navigate events from dashboard widgets
  useEffect(() => {
    const handleNavigate = (e: any) => {
      if (e.detail) setActiveSection(e.detail);
    };
    window.addEventListener('navigate', handleNavigate);
    return () => window.removeEventListener('navigate', handleNavigate);
  }, []);

  const handleBootComplete = useCallback(() => {
    setBooted(true);
  }, []);

  const renderMainContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'timetable':
        return <TimetableHelper />;
      case 'search':
        return <OracleSearch />;
      case 'campus':
        return <CampusExplorer />;
      case 'briefing':
        return <SmartBriefing fullPage />;
      case 'profile':
      case 'settings':
        return <ProfileView />;
      case 'learning':
        return <LearningComponent />;
      case 'fileshare':
        return <FileShare />;
      case 'study-materials':
        return <StudyMaterials />;
      case 'career':
        return <CareerHub />;
      case 'lost-found':
        return <LostAndFound />;
      case 'clubs-events':
        return <ClubsEvents />;
      case 'roommate':
        return <RoommateMatch />;
      case 'note-share':
        return <NoteShare />;
      case 'admin-automation':
        return <AdminAutomation />;
      case 'group-study':
        return <GroupStudy />;
      case 'quick-poll':
        return <QuickPoll />;
      case 'study-buddy':
        return <StudyBuddy />;
      case 'budget':
        return <BudgetTracker />;
      case 'attendance':
        return <AttendanceTracker />;
      case 'focus':
        return <DashboardOverview />; // Render dashboard underneath the focus overlay
      case 'answer-key':
        return <AnswerKeyManager />;
      case 'mock-interview':
        return <AiMockInterview />;
      case 'ai-chat':
        return <AnimatedAIChat />;
      case 'visual-algos':
        return <VisualAlgorithms />;
      case 'travel-pool':
        return <TravelPool />;
      case 'bus-transport':
        return <BusTransportation />;
      case 'faculty':
        return <FacultyManagement />;
      default:
        return <DashboardOverview />;
    }
  };

  // Boot screen
  if (!booted) {
    return <BootScreen onComplete={handleBootComplete} />;
  }

  return (
    <UserProvider>
      <div className="flex h-screen bg-[#040812] aurora-bg overflow-hidden relative">
        {/* Ambient glow orbs */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="fixed top-0 left-1/4 w-[600px] h-[600px] rounded-full bg-cyan-500/[0.04] blur-[150px] pointer-events-none"
        />
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="fixed bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-violet-500/[0.04] blur-[120px] pointer-events-none"
        />

        {/* Sidebar */}
        <Sidebar activeSection={activeSection} onNavigate={setActiveSection} />

        {/* Main content area */}
        <div className="flex-1 flex overflow-hidden relative z-10">
          {/* Primary content */}
          <main className={`flex-1 overflow-y-auto ${activeSection === 'campus' ? 'p-0 relative' : 'p-6 lg:p-8'}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className={`${activeSection === 'campus' ? 'w-full h-full' : 'max-w-5xl mx-auto'} animate-in`}
              >
                {renderMainContent()}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        <AnimatePresence>
          {activeSection === 'focus' && (
            <FocusMode onClose={() => setActiveSection('dashboard')} />
          )}
        </AnimatePresence>
        <StudentDetailsModal />
        <MrVighelp />
      </div>
    </UserProvider>
  );
}
