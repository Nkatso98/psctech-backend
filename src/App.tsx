import { Toaster } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './lib/auth-context';
import { NavigationProvider } from './lib/navigation-context';
import { Chatbot } from '@/components/chat/chatbot';
import Index from './pages/Index';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';
import Unauthorized from './pages/Unauthorized';

// Principal Routes
import Reports from './pages/Reports';
import Classes from './pages/Classes';
import Staff from './pages/Staff';
import Announcements from './pages/Announcements';
import Settings from './pages/Settings';
import OverallAcademicPerformance from './pages/OverallAcademicPerformance';
import AddStudent from './pages/AddStudent';
import AddTeacher from './pages/AddTeacher';

// Teacher Routes
import Schedule from './pages/Schedule';
import Attendance from './pages/Attendance';
import Results from './pages/Results';
import Notices from './pages/Notices';
import AIHomeworkGenerator from './pages/AIHomeworkGenerator';
import AITestGenerator from './pages/AITestGenerator';

// Parent Routes
import Calendar from './pages/Calendar';
import Messages from './pages/Messages';
import Children from './pages/Children';

// Learner Routes
import StudyZone from './pages/StudyZone';
import { AIStudySession } from './components/ai-study/ai-study-session';
import Homework from './pages/Homework';
import Timetables from './pages/Timetables';
import Performance from './pages/Performance';
import AIStudyZone from './pages/AIStudyZone';

// SGB Routes
import Meetings from './pages/Meetings';
import Documents from './pages/Documents';

// Other Routes
import Assignments from './pages/Assignments';
import ClassAllocation from './pages/ClassAllocation';
import AITesting from './pages/AITesting';
import InstitutionSettings from './pages/InstitutionSettings';
import Competitions from './pages/Competitions';
import Vouchers from './pages/Vouchers';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <BrowserRouter>
          <NavigationProvider>
            <Routes>
            {/* Main Routes */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            
            {/* Principal Routes */}
            <Route path="/overall-academic-performance" element={<OverallAcademicPerformance />} />
            <Route path="/add-student" element={<AddStudent />} />
            <Route path="/add-teacher" element={<AddTeacher />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/classes" element={<Classes />} />
            <Route path="/staff" element={<Staff />} />
            <Route path="/announcements" element={<Announcements />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/competitions" element={<Competitions />} />
            <Route path="/vouchers" element={<Vouchers />} />
            
            {/* Teacher Routes */}
            <Route path="/schedule" element={<Schedule />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/results" element={<Results />} />
            <Route path="/notices" element={<Notices />} />
            <Route path="/ai-homework-generator" element={<AIHomeworkGenerator />} />
            <Route path="/ai-test-generator" element={<AITestGenerator />} />
            
            {/* Parent Routes */}
            <Route path="/children" element={<Children />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/messages" element={<Messages />} />
            
            {/* Learner Routes */}
            <Route path="/study-zone" element={<StudyZone />} />
            <Route path="/study-session/:sessionId" element={<AIStudySession />} />
            <Route path="/homework" element={<Homework />} />
            <Route path="/timetable" element={<Timetables />} />
            <Route path="/performance" element={<Performance />} />
            <Route path="/ai-study-zone" element={<AIStudyZone />} />
            
            {/* SGB Routes */}
            <Route path="/meetings" element={<Meetings />} />
            <Route path="/documents" element={<Documents />} />
            
            {/* Other Routes */}
            <Route path="/assignments" element={<Assignments />} />
            <Route path="/class-allocation" element={<ClassAllocation />} />
            <Route path="/ai-testing" element={<AITesting />} />
            <Route path="/institution-settings" element={<InstitutionSettings />} />
            
            {/* Catch all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          </NavigationProvider>
          <Chatbot />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

