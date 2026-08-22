'use client';

import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import dynamic from 'next/dynamic';
import Sidebar from '@/components/Sidebar';
import DashboardOverview from '@/components/DashboardOverview';
import { DarkGradientBg } from '@/components/ui/elegant-dark-pattern';
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
import FacultyAttendance from '@/components/FacultyAttendance';
import StudentDetailsModal from '@/components/StudentDetailsModal';
import HostelHub from '@/components/HostelHub';
import ParentPortal from '@/components/ParentPortal';
import StudentSIS from '@/components/StudentSIS';
import AttendanceAdmin from '@/components/AttendanceAdmin';
import PlacementAdmin from '@/components/PlacementAdmin';
import FeesFinance from '@/components/FeesFinance';
import Examinations from '@/components/Examinations';
import SecurityDashboard from '@/components/SecurityDashboard';
import EmergencyComm from '@/components/EmergencyComm';
import WomenSafety from '@/components/WomenSafety';
import IncidentReporting from '@/components/IncidentReporting';
import VisitorManagement from '@/components/VisitorManagement';
import StudentWellbeing from '@/components/StudentWellbeing';
import CommunicationHub from '@/components/CommunicationHub';
import ComplaintsModule from '@/components/ComplaintsModule';
import TransportAdmin from '@/components/TransportAdmin';
import { UserProvider, useUser } from '@/context/UserContext';
import { RBACProvider, useRBAC } from '@/context/RBACContext';
import { AuditLogProvider } from '@/context/AuditLogContext';
import { EventBusProvider } from '@/context/EventBusContext';
import { AnimatedAIChat } from '@/components/ui/animated-ai-chat';
import GlobalLogin from '@/components/GlobalLogin';
import { canonicalStudents, canonicalFaculties } from '@/data/canonicalData';
const VitgrowwSafe = dynamic(() => import('@/components/VitgrowwSafe'), { ssr: false });

const BootScreen = dynamic(() => import('@/components/BootScreen'), { ssr: false });

function AppContent() {
  const [booted, setBooted] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const { user } = useUser();
  const { activeRole } = useRBAC();

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
        return <LearningHub />;
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
      case 'student-info':
        return <StudentSIS />;
      case 'attendance-admin':
        return <AttendanceAdmin />;
      case 'placement-admin':
        return <PlacementAdmin />;
      case 'fees-finance':
        return <FeesFinance />;
      case 'examinations':
        return <Examinations />;
      case 'faculty':
      case 'faculty-admin':
        return <FacultyAttendance />;
      case 'hostel-hub':
      case 'hostel-admin':
        return <HostelHub />;
      case 'parent-portal':
        return <ParentPortal />;
      case 'safe':
        return <VitgrowwSafe />;
      case 'security-dashboard':
        return <SecurityDashboard />;
      case 'emergency-comm':
        return <EmergencyComm />;
      case 'women-safety':
        return <WomenSafety />;
      case 'incident-reporting':
        return <IncidentReporting />;
      case 'visitor-management':
        return <VisitorManagement />;
      case 'student-wellbeing':
        return <StudentWellbeing />;
      case 'communication-hub':
        return <CommunicationHub />;
      case 'complaints':
        return <ComplaintsModule />;
      case 'transport-admin':
        return <TransportAdmin />;
      default:
        return <DashboardOverview />;
    }
  };



  // Boot screen
  if (!booted) {
    return <BootScreen onComplete={handleBootComplete} />;
  }

  // Global Login
  const isValidUser = user?.regNo && (canonicalStudents[user.regNo.toUpperCase()] || canonicalFaculties[user.regNo.toUpperCase()]);
  if (!isValidUser) {
    return <GlobalLogin onLoginSuccess={() => {}} />;
  }

  return (
    <DarkGradientBg>
              <div className="flex h-screen overflow-hidden w-full relative">
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
            </DarkGradientBg>
  );
}

export default function Home() {
  return (
    <EventBusProvider>
      <RBACProvider>
        <AuditLogProvider>
          <UserProvider>
            <AppContent />
          </UserProvider>
        </AuditLogProvider>
      </RBACProvider>
    </EventBusProvider>
  );
}
