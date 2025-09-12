import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileTextIcon, 
  SearchIcon,
  FilterIcon,
  DownloadIcon,
  EyeIcon,
  CalendarIcon,
  UserIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
  ClockIcon,
  TrendingUpIcon,
  BarChart3Icon,
  FilterIcon as FilterIcon2
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { teacherStore, learnerStore, userStore } from '@/lib/store';

interface TeacherReport {
  id: string;
  teacherId: string;
  teacherName: string;
  learnerId: string;
  learnerName: string;
  grade: string;
  subject: string;
  reportType: 'behavior' | 'academic' | 'attendance' | 'general';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  date: Date;
  status: 'pending' | 'reviewed' | 'resolved' | 'escalated';
  actions: string[];
  recommendations: string[];
  followUpRequired: boolean;
  parentNotified: boolean;
}

interface ReportFilter {
  searchTerm: string;
  reportType: string;
  severity: string;
  status: string;
  teacher: string;
  grade: string;
  subject: string;
  dateRange: string;
}

export function TeacherReportsManager() {
  const { user, institution } = useAuth();
  const [reports, setReports] = useState<TeacherReport[]>([]);
  const [filteredReports, setFilteredReports] = useState<TeacherReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<TeacherReport | null>(null);
  const [activeTab, setActiveTab] = useState('all-reports');
  const [filters, setFilters] = useState<ReportFilter>({
    searchTerm: '',
    reportType: 'all',
    severity: 'all',
    status: 'all',
    teacher: 'all',
    grade: 'all',
    subject: 'all',
    dateRange: 'all'
  });

  useEffect(() => {
    if (user && institution) {
      loadReports();
    }
  }, [user, institution]);

  useEffect(() => {
    applyFilters();
  }, [reports, filters]);

  const loadReports = () => {
    // Load actual data from stores instead of hardcoded mock data
    const teachers = teacherStore.getAll();
    const learners = learnerStore.getAll();
    const users = userStore.getAll();
    
    if (teachers.length === 0 || learners.length === 0) {
      // If no data exists, create some sample reports based on actual store data
      setReports([]);
      return;
    }
    
    // Generate reports based on actual store data
    const generatedReports: TeacherReport[] = [];
    
    // Create reports for each teacher-learner combination
    teachers.forEach((teacher, teacherIndex) => {
      const teacherUser = userStore.getById(teacher.userId);
      if (!teacherUser) return;
      
      learners.forEach((learner, learnerIndex) => {
        const learnerUser = userStore.getById(learner.userId);
        if (!learnerUser) return;
        
        // Create different types of reports
        const reportTypes: Array<'behavior' | 'academic' | 'attendance' | 'general'> = ['behavior', 'academic', 'attendance', 'general'];
        const severities: Array<'low' | 'medium' | 'high' | 'critical'> = ['low', 'medium', 'high', 'critical'];
        const statuses: Array<'pending' | 'reviewed' | 'resolved' | 'escalated'> = ['pending', 'reviewed', 'resolved', 'escalated'];
        
        const reportType = reportTypes[teacherIndex % reportTypes.length];
        const severity = severities[learnerIndex % severities.length];
        const status = statuses[(teacherIndex + learnerIndex) % statuses.length];
        
        const report: TeacherReport = {
          id: `report-${teacher.teacherId}-${learner.learnerId}`,
          teacherId: teacher.teacherId,
          teacherName: teacherUser.fullName,
          learnerId: learner.learnerId,
          learnerName: learnerUser.fullName,
          grade: learner.grade.toString(),
          subject: teacher.subject,
          reportType,
          severity,
          title: generateReportTitle(reportType, severity),
          description: generateReportDescription(reportType, severity, learnerUser.fullName, teacher.subject),
          date: new Date(Date.now() - (teacherIndex + learnerIndex) * 24 * 60 * 60 * 1000),
          status,
          actions: generateActions(reportType, severity),
          recommendations: generateRecommendations(reportType, severity),
          followUpRequired: severity === 'high' || severity === 'critical',
          parentNotified: severity === 'high' || severity === 'critical'
        };
        
        generatedReports.push(report);
      });
    });
    
    setReports(generatedReports);
  };

  const generateReportTitle = (type: string, severity: string): string => {
    const titles: Record<string, Record<string, string>> = {
      behavior: {
        low: 'Minor classroom disruption',
        medium: 'Disruptive behavior in class',
        high: 'Significant behavioral issues',
        critical: 'Serious behavioral violation'
      },
      academic: {
        low: 'Slight decline in performance',
        medium: 'Declining academic performance',
        high: 'Significant academic concerns',
        critical: 'Critical academic failure'
      },
      attendance: {
        low: 'Occasional tardiness',
        medium: 'Frequent tardiness',
        high: 'Regular absenteeism',
        critical: 'Chronic absenteeism'
      },
      general: {
        low: 'Minor concern noted',
        medium: 'General concern raised',
        high: 'Serious concern identified',
        critical: 'Critical issue requiring immediate attention'
      }
    };
    
    return titles[type]?.[severity] || 'Report generated';
  };

  const generateReportDescription = (type: string, severity: string, learnerName: string, subject: string): string => {
    const descriptions = {
      behavior: `${learnerName} has been experiencing ${severity} behavioral issues during ${subject} lessons. This requires attention and intervention.`,
      academic: `${learnerName} has shown ${severity} academic performance in ${subject}. Additional support and monitoring may be needed.`,
      attendance: `${learnerName} has been ${severity === 'low' ? 'occasionally late' : severity === 'medium' ? 'frequently late' : 'regularly absent'} to ${subject} class.`,
      general: `A ${severity} concern has been identified regarding ${learnerName} in ${subject} class. This matter requires attention.`
    };
    
    return descriptions[type as keyof typeof descriptions] || 'Report description generated based on available data.';
  };

  const generateActions = (type: string, severity: string): string[] => {
    const actions = {
      behavior: ['Verbal warning given', 'Behavior contract discussed'],
      academic: ['Academic assessment scheduled', 'Additional support arranged'],
      attendance: ['Attendance policy explained', 'Morning routine discussed'],
      general: ['Issue documented', 'Follow-up scheduled']
    };
    
    const baseActions = actions[type as keyof typeof actions] || ['Action taken'];
    
    if (severity === 'high' || severity === 'critical') {
      baseActions.push('Parent contacted', 'Counselor involved');
    }
    
    return baseActions;
  };

  const generateRecommendations = (type: string, severity: string): string[] => {
    const recommendations = {
      behavior: ['Implement behavior contract', 'Regular check-ins'],
      academic: ['Additional tutoring support', 'Regular progress monitoring'],
      attendance: ['Monitor arrival times', 'Positive reinforcement'],
      general: ['Regular monitoring', 'Support intervention']
    };
    
    const baseRecommendations = recommendations[type as keyof typeof recommendations] || ['Regular monitoring'];
    
    if (severity === 'high' || severity === 'critical') {
      baseRecommendations.push('Intensive intervention program', 'Weekly progress reviews');
    }
    
    return baseRecommendations;
  };

  const applyFilters = () => {
    let filtered = [...reports];

    // Search term filter
    if (filters.searchTerm) {
      filtered = filtered.filter(report =>
        report.learnerName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        report.teacherName.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        report.title.toLowerCase().includes(filters.searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    // Report type filter
    if (filters.reportType !== 'all') {
      filtered = filtered.filter(report => report.reportType === filters.reportType);
    }

    // Severity filter
    if (filters.severity !== 'all') {
      filtered = filtered.filter(report => report.severity === filters.severity);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(report => report.status === filters.status);
    }

    // Teacher filter
    if (filters.teacher !== 'all') {
      filtered = filtered.filter(report => report.teacherId === filters.teacher);
    }

    // Grade filter
    if (filters.grade !== 'all') {
      filtered = filtered.filter(report => report.grade === filters.grade);
    }

    // Subject filter
    if (filters.subject !== 'all') {
      filtered = filtered.filter(report => report.subject === filters.subject);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      switch (filters.dateRange) {
        case 'today':
          filtered = filtered.filter(report => 
            report.date.toDateString() === now.toDateString()
          );
          break;
        case 'week':
          filtered = filtered.filter(report => report.date >= oneWeekAgo);
          break;
        case 'month':
          filtered = filtered.filter(report => report.date >= oneMonthAgo);
          break;
      }
    }

    setFilteredReports(filtered);
  };

  const getReportStats = () => {
    const total = reports.length;
    const pending = reports.filter(r => r.status === 'pending').length;
    const reviewed = reports.filter(r => r.status === 'reviewed').length;
    const resolved = reports.filter(r => r.status === 'resolved').length;
    const escalated = reports.filter(r => r.status === 'escalated').length;
    const critical = reports.filter(r => r.severity === 'critical').length;
    const high = reports.filter(r => r.severity === 'high').length;

    return { total, pending, reviewed, resolved, escalated, critical, high };
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'reviewed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
      case 'escalated': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getReportTypeIcon = (type: string) => {
    switch (type) {
      case 'behavior': return <AlertTriangleIcon className="h-4 w-4" />;
      case 'academic': return <TrendingUpIcon className="h-4 w-4" />;
      case 'attendance': return <ClockIcon className="h-4 w-4" />;
      case 'general': return <FileTextIcon className="h-4 w-4" />;
      default: return <FileTextIcon className="h-4 w-4" />;
    }
  };

  const exportReportToPDF = (report: TeacherReport) => {
    const content = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <!-- Institution Letterhead -->
        <div style="text-align: center; margin-bottom: 30px; padding: 20px; border-bottom: 3px solid #1f2937;">
          <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 15px;">
            <div style="width: 60px; height: 60px; background-color: #1f2937; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
              <span style="color: white; font-size: 24px; font-weight: bold;">PSC</span>
            </div>
            <div>
              <h1 style="color: #1f2937; margin: 0; font-size: 28px; font-weight: bold;">${institution?.name || 'PSC Tech School'}</h1>
              <p style="color: #6b7280; margin: 5px 0; font-size: 14px;">Excellence in Education</p>
              <p style="color: #6b7280; margin: 5px 0; font-size: 12px;">Powered by Nkanyezi Tech Solutions</p>
            </div>
          </div>
          <div style="border-top: 1px solid #e5e7eb; padding-top: 15px;">
            <h2 style="color: #1f2937; margin: 0; font-size: 20px;">TEACHER REPORT</h2>
            <p style="color: #6b7280; margin: 5px 0; font-size: 12px;">Official School Document</p>
          </div>
        </div>

        <!-- Report Header -->
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
            ${report.title}
          </h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 14px;">
            <div>
              <strong style="color: #374151;">Report ID:</strong> ${report.id}
            </div>
            <div>
              <strong style="color: #374151;">Date & Time:</strong> ${report.date.toLocaleString()}
            </div>
            <div>
              <strong style="color: #374151;">Teacher:</strong> ${report.teacherName}
            </div>
            <div>
              <strong style="color: #374151;">Learner:</strong> ${report.learnerName} (Grade ${report.grade})
            </div>
            <div>
              <strong style="color: #374151;">Subject:</strong> ${report.subject}
            </div>
            <div>
              <strong style="color: #374151;">Type:</strong> ${report.reportType.charAt(0).toUpperCase() + report.reportType.slice(1)}
            </div>
            <div>
              <strong style="color: #374151;">Severity:</strong> 
              <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; 
                background-color: ${report.severity === 'critical' ? '#fef2f2' : report.severity === 'high' ? '#fffbeb' : report.severity === 'medium' ? '#fef3c7' : '#f0fdf4'}; 
                color: ${report.severity === 'critical' ? '#dc2626' : report.severity === 'high' ? '#d97706' : report.severity === 'medium' ? '#ca8a04' : '#16a34a'}; 
                border: 1px solid ${report.severity === 'critical' ? '#fecaca' : report.severity === 'high' ? '#fed7aa' : report.severity === 'medium' ? '#fde68a' : '#bbf7d0'};">
                ${report.severity.charAt(0).toUpperCase() + report.severity.slice(1)}
              </span>
            </div>
            <div>
              <strong style="color: #374151;">Status:</strong> 
              <span style="padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; 
                background-color: ${report.status === 'pending' ? '#fef3c7' : report.status === 'reviewed' ? '#dbeafe' : report.status === 'resolved' ? '#dcfce7' : '#fef2f2'}; 
                color: ${report.status === 'pending' ? '#ca8a04' : report.status === 'reviewed' ? '#2563eb' : report.status === 'resolved' ? '#16a34a' : '#dc2626'}; 
                border: 1px solid ${report.status === 'pending' ? '#fde68a' : report.status === 'reviewed' ? '#bfdbfe' : report.status === 'resolved' ? '#bbf7d0' : '#fecaca'};">
                ${report.status.charAt(0).toUpperCase() + report.status.slice(1)}
              </span>
            </div>
          </div>
        </div>

        <!-- Report Description -->
        <div style="margin: 25px 0;">
          <h4 style="color: #374151; margin: 0 0 15px 0; font-size: 16px; border-left: 4px solid #1f2937; padding-left: 15px;">
            Report Description
          </h4>
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; border-left: 4px solid #1f2937;">
            <p style="line-height: 1.6; color: #4b5563; margin: 0; font-size: 14px;">${report.description}</p>
          </div>
        </div>

        <!-- Actions and Recommendations -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 25px; margin: 25px 0;">
          <div>
            <h4 style="color: #374151; margin: 0 0 15px 0; font-size: 16px; border-left: 4px solid #1f2937; padding-left: 15px;">
              Actions Taken
            </h4>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px;">
              <ul style="line-height: 1.6; color: #4b5563; margin: 0; padding-left: 20px; font-size: 14px;">
                ${report.actions.map(action => `<li style="margin-bottom: 8px;">${action}</li>`).join('')}
              </ul>
            </div>
          </div>
          
          <div>
            <h4 style="color: #374151; margin: 0 0 15px 0; font-size: 16px; border-left: 4px solid #1f2937; padding-left: 15px;">
              Recommendations
            </h4>
            <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px;">
              <ul style="line-height: 1.6; color: #4b5563; margin: 0; padding-left: 20px; font-size: 14px;">
                ${report.recommendations.map(rec => `<li style="margin-bottom: 8px;">${rec}</li>`).join('')}
              </ul>
            </div>
          </div>
        </div>

        <!-- Additional Information -->
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0;">
          <h4 style="color: #374151; margin: 0 0 15px 0; font-size: 16px; border-left: 4px solid #1f2937; padding-left: 15px;">
            Additional Information
          </h4>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 14px;">
            <div>
              <strong style="color: #374151;">Follow-up Required:</strong> 
              <span style="color: ${report.followUpRequired ? '#dc2626' : '#16a34a'}; font-weight: bold;">
                ${report.followUpRequired ? 'Yes' : 'No'}
              </span>
            </div>
            <div>
              <strong style="color: #374151;">Parent Notified:</strong> 
              <span style="color: ${report.parentNotified ? '#16a34a' : '#dc2626'}; font-weight: bold;">
                ${report.parentNotified ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>

        <!-- Footer -->
        <div style="margin-top: 40px; padding: 20px; border-top: 3px solid #1f2937; text-align: center;">
          <div style="margin-bottom: 15px;">
            <p style="color: #6b7280; margin: 5px 0; font-size: 12px;">
              Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
            </p>
            <p style="color: #6b7280; margin: 5px 0; font-size: 12px;">
              ${institution?.name || 'PSC Tech School'} • School Management System
            </p>
          </div>
          <div style="border-top: 1px solid #e5e7eb; padding-top: 15px;">
            <p style="color: #9ca3af; margin: 0; font-size: 10px;">
              This is an official school document. Please keep for your records.
            </p>
            <p style="color: #9ca3af; margin: 5px 0 0 0; font-size: 10px;">
              Powered by Nkanyezi Tech Solutions
            </p>
          </div>
        </div>
      </div>
    `;

    return content;
  };

  const exportAllReportsToPDF = () => {
    // Create a combined HTML content for all reports
    const allReportsContent = `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <!-- Institution Letterhead -->
        <div style="text-align: center; margin-bottom: 30px; padding: 20px; border-bottom: 3px solid #1f2937;">
          <div style="display: flex; align-items: center; justify-content: center; margin-bottom: 15px;">
            <div style="width: 60px; height: 60px; background-color: #1f2937; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 15px;">
              <span style="color: white; font-size: 24px; font-weight: bold;">PSC</span>
            </div>
            <div>
              <h1 style="color: #1f2937; margin: 0; font-size: 28px; font-weight: bold;">${institution?.name || 'PSC Tech School'}</h1>
              <p style="color: #6b7280; margin: 5px 0; font-size: 14px;">Excellence in Education</p>
              <p style="color: #6b7280; margin: 5px 0; font-size: 12px;">Powered by Nkanyezi Tech Solutions</p>
            </div>
          </div>
          <div style="border-top: 1px solid #e5e7eb; padding-top: 15px;">
            <h2 style="color: #1f2937; margin: 0; font-size: 20px;">ALL TEACHER REPORTS SUMMARY</h2>
            <p style="color: #6b7280; margin: 5px 0; font-size: 12px;">Official School Document</p>
          </div>
        </div>

        <!-- Summary Stats -->
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
          <h3 style="color: #1f2937; margin: 0 0 15px 0; font-size: 18px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
            Reports Summary
          </h3>
          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 15px; font-size: 14px;">
            <div style="text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #1f2937;">${stats.total}</div>
              <div style="color: #6b7280;">Total Reports</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #ca8a04;">${stats.pending}</div>
              <div style="color: #6b7280;">Pending</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #dc2626;">${stats.critical}</div>
              <div style="color: #6b7280;">Critical</div>
            </div>
            <div style="text-align: center;">
              <div style="font-size: 24px; font-weight: bold; color: #16a34a;">${stats.resolved}</div>
              <div style="color: #6b7280;">Resolved</div>
            </div>
          </div>
        </div>

        <!-- All Reports List -->
        ${reports.map((report, index) => `
          <div style="border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 20px; ${index % 2 === 0 ? 'background-color: #f8fafc;' : ''}">
            <h4 style="color: #1f2937; margin: 0 0 15px 0; font-size: 16px; border-bottom: 1px solid #e5e7eb; padding-bottom: 10px;">
              Report ${index + 1}: ${report.title}
            </h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 12px; margin-bottom: 15px;">
              <div><strong>Teacher:</strong> ${report.teacherName}</div>
              <div><strong>Learner:</strong> ${report.learnerName} (Grade ${report.grade})</div>
              <div><strong>Subject:</strong> ${report.subject}</div>
              <div><strong>Type:</strong> ${report.reportType.charAt(0).toUpperCase() + report.reportType.slice(1)}</div>
              <div><strong>Severity:</strong> 
                <span style="padding: 2px 6px; border-radius: 3px; font-size: 10px; font-weight: bold; 
                  background-color: ${report.severity === 'critical' ? '#fef2f2' : report.severity === 'high' ? '#fffbeb' : report.severity === 'medium' ? '#fef3c7' : '#f0fdf4'}; 
                  color: ${report.severity === 'critical' ? '#dc2626' : report.severity === 'high' ? '#d97706' : report.severity === 'medium' ? '#ca8a04' : '#16a34a'}; 
                  border: 1px solid ${report.severity === 'critical' ? '#fecaca' : report.severity === 'high' ? '#fed7aa' : report.severity === 'medium' ? '#fde68a' : '#bbf7d0'};">
                  ${report.severity.charAt(0).toUpperCase() + report.severity.slice(1)}
                </span>
              </div>
              <div><strong>Status:</strong> 
                <span style="padding: 2px 6px; border-radius: 3px; font-size: 10px; font-weight: bold; 
                  background-color: ${report.status === 'pending' ? '#fef3c7' : report.status === 'reviewed' ? '#dbeafe' : report.status === 'resolved' ? '#dcfce7' : '#fef2f2'}; 
                  color: ${report.status === 'pending' ? '#ca8a04' : report.status === 'reviewed' ? '#2563eb' : report.status === 'resolved' ? '#16a34a' : '#dc2626'}; 
                  border: 1px solid ${report.status === 'pending' ? '#fde68a' : report.status === 'reviewed' ? '#bfdbfe' : report.status === 'resolved' ? '#bbf7d0' : '#fecaca'};">
                  ${report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                </span>
              </div>
            </div>
            <p style="color: #4b5563; font-size: 12px; line-height: 1.4; margin: 0;">
              <strong>Description:</strong> ${report.description}
            </p>
            <div style="margin-top: 10px; font-size: 11px; color: #6b7280;">
              <strong>Date:</strong> ${report.date.toLocaleString()} | 
              <strong>Actions:</strong> ${report.actions.length} | 
              <strong>Recommendations:</strong> ${report.recommendations.length}
            </div>
          </div>
        `).join('')}

        <!-- Footer -->
        <div style="margin-top: 40px; padding: 20px; border-top: 3px solid #1f2937; text-align: center;">
          <div style="margin-bottom: 15px;">
            <p style="color: #6b7280; margin: 5px 0; font-size: 12px;">
              Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
            </p>
            <p style="color: #6b7280; margin: 5px 0; font-size: 12px;">
              ${institution?.name || 'PSC Tech School'} • School Management System
            </p>
          </div>
          <div style="border-top: 1px solid #e5e7eb; padding-top: 15px;">
            <p style="color: #9ca3af; margin: 0; font-size: 10px;">
              This is an official school document. Please keep for your records.
            </p>
            <p style="color: #9ca3af; margin: 5px 0 0 0; font-size: 10px;">
              Powered by Nkanyezi Tech Solutions
            </p>
          </div>
        </div>
      </div>
    `;

    // Create a temporary div with the content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = allReportsContent;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    document.body.appendChild(tempDiv);

    // Generate PDF using the existing PDFGenerator logic
    const generatePDF = async () => {
      try {
        const pdf = new (await import('jspdf')).default('p', 'mm', 'a4');
        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        
        // Add letterhead
        pdf.setFillColor(245, 245, 245);
        pdf.rect(0, 0, pageWidth, 30, 'F');
        
        // Add school name and document title
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(50, 50, 50);
        pdf.setFontSize(16);
        const schoolName = institution?.name || 'School Management System';
        pdf.text(schoolName, 40, 15);
        
        pdf.setFontSize(12);
        pdf.text('All Teacher Reports Summary', 40, 22);
        
        // Add date and user info
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        const today = new Date().toLocaleDateString();
        pdf.text(`Generated: ${today}`, pageWidth - 60, 15);
        pdf.text(`Generated by: ${user?.fullName || 'User'}`, pageWidth - 60, 22);
        
        // Convert HTML to canvas
        const html2canvas = (await import('html2canvas')).default;
        const canvas = await html2canvas(tempDiv, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });
        
        const contentDataUrl = canvas.toDataURL('image/png');
        
        // Calculate aspect ratio to fit content within PDF width
        const contentWidth = pageWidth - 20;
        const contentAspectRatio = canvas.height / canvas.width;
        const contentHeight = contentWidth * contentAspectRatio;
        
        // Add the content image to the PDF
        pdf.addImage(contentDataUrl, 'PNG', 10, 40, contentWidth, contentHeight);
        
        // Add footer
        const footerY = pageHeight - 10;
        pdf.setFontSize(8);
        pdf.setTextColor(100, 100, 100);
        pdf.text(`Page 1 of 1`, pageWidth / 2, footerY, { align: 'center' });
        
        // Save the PDF
        pdf.save(`all_teacher_reports_${new Date().toISOString().split('T')[0]}.pdf`);
      } catch (error) {
        console.error('Error generating PDF:', error);
      }
    };

    generatePDF();
    
    // Clean up
    setTimeout(() => {
      document.body.removeChild(tempDiv);
    }, 1000);
  };

  const stats = getReportStats();

  return (
    <div className="space-y-6">
      {/* Hidden content for PDF export */}
      {reports.map((report) => (
        <div
          key={`pdf-${report.id}`}
          id={`report-${report.id}`}
          className="hidden"
          dangerouslySetInnerHTML={{ __html: exportReportToPDF(report) }}
        />
      ))}
      
      {/* Hidden content for resolved reports PDF export */}
      {reports.filter(r => r.status === 'resolved').map((report) => (
        <div
          key={`pdf-resolved-${report.id}`}
          id={`resolved-report-${report.id}`}
          className="hidden"
          dangerouslySetInnerHTML={{ __html: exportReportToPDF(report) }}
        />
      ))}
      
      {/* Hidden content for detailed report PDF export */}
      {selectedReport && (
        <div
          key={`pdf-detail-${selectedReport.id}`}
          id={`detail-report-${selectedReport.id}`}
          className="hidden"
          dangerouslySetInnerHTML={{ __html: exportReportToPDF(selectedReport) }}
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Teacher Reports Management</h2>
          <p className="text-muted-foreground">
            View, manage, and export all teacher reports about learners
          </p>
        </div>
        <Button onClick={() => exportAllReportsToPDF()}>
          <DownloadIcon className="h-4 w-4 mr-2" />
          Export All Reports
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileTextIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              All teacher reports
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
            <ClockIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting review
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
            <AlertTriangleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
            <p className="text-xs text-muted-foreground">
              High priority
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircleIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
            <p className="text-xs text-muted-foreground">
              Successfully handled
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FilterIcon2 className="h-4 w-4 mr-2" />
            Filter Reports
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search reports..."
                value={filters.searchTerm}
                onChange={(e) => setFilters(prev => ({ ...prev, searchTerm: e.target.value }))}
                className="pl-10"
              />
            </div>
            
            <Select value={filters.reportType} onValueChange={(value) => setFilters(prev => ({ ...prev, reportType: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Report Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="behavior">Behavior</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="attendance">Attendance</SelectItem>
                <SelectItem value="general">General</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.severity} onValueChange={(value) => setFilters(prev => ({ ...prev, severity: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="reviewed">Reviewed</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="escalated">Escalated</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="all-reports">
            <FileTextIcon className="h-4 w-4 mr-2" />
            All Reports ({filteredReports.length})
          </TabsTrigger>
          <TabsTrigger value="pending">
            <ClockIcon className="h-4 w-4 mr-2" />
            Pending ({stats.pending})
          </TabsTrigger>
          <TabsTrigger value="critical">
            <AlertTriangleIcon className="h-4 w-4 mr-2" />
            Critical ({stats.critical})
          </TabsTrigger>
          <TabsTrigger value="resolved">
            <CheckCircleIcon className="h-4 w-4 mr-2" />
            Resolved ({stats.resolved})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all-reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Teacher Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {filteredReports.length === 0 ? (
                <div className="text-center py-8">
                  <FileTextIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No reports found</p>
                  <p className="text-sm text-muted-foreground">
                    Try adjusting your filters or check back later
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredReports
                    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .map((report) => (
                      <div
                        key={report.id}
                        className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium">{report.title}</h4>
                              <Badge className={getSeverityColor(report.severity)}>
                                {report.severity.charAt(0).toUpperCase() + report.severity.slice(1)}
                              </Badge>
                              <Badge className={getStatusColor(report.status)}>
                                {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                              </Badge>
                              <Badge variant="outline" className="flex items-center">
                                {getReportTypeIcon(report.reportType)}
                                <span className="ml-1 capitalize">{report.reportType}</span>
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-muted-foreground mb-3">
                              <div className="flex items-center space-x-2">
                                <UserIcon className="h-4 w-4" />
                                <span className="font-medium">Teacher:</span> 
                                <span className="text-blue-600 font-semibold">{report.teacherName}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <CalendarIcon className="h-4 w-4" />
                                <span className="font-medium">Time:</span> 
                                <span className="text-green-600 font-semibold">{report.date.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <AlertTriangleIcon className="h-4 w-4" />
                                <span className="font-medium">Reason:</span> 
                                <span className="text-orange-600 font-semibold capitalize">{report.reportType}</span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-muted-foreground mb-2">
                              <div>
                                <span className="font-medium">Learner:</span> {report.learnerName} (Grade {report.grade})
                              </div>
                              <div>
                                <span className="font-medium">Subject:</span> {report.subject}
                              </div>
                              <div>
                                <span className="font-medium">Severity:</span> 
                                <Badge className={`ml-1 ${getSeverityColor(report.severity)}`}>
                                  {report.severity.charAt(0).toUpperCase() + report.severity.slice(1)}
                                </Badge>
                              </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                              {report.description}
                            </p>
                            
                            <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                              <span className="flex items-center">
                                <UserIcon className="h-3 w-3 mr-1" />
                                {report.actions.length} actions taken
                              </span>
                              <span className="flex items-center">
                                <BarChart3Icon className="h-3 w-3 mr-1" />
                                {report.recommendations.length} recommendations
                              </span>
                              {report.followUpRequired && (
                                <span className="text-orange-600 font-medium">Follow-up Required</span>
                              )}
                              {report.parentNotified && (
                                <span className="text-green-600 font-medium">Parent Notified</span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedReport(report)}
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                            <PDFGenerator
                              contentId={`report-${report.id}`}
                              title={`Report - ${report.title}`}
                              fileName={`teacher_report_${report.id}`}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Review Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const pendingReports = filteredReports.filter(r => r.status === 'pending');
                if (pendingReports.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <CheckCircleIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No pending reports</p>
                      <p className="text-sm text-muted-foreground">
                        All reports have been reviewed
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {pendingReports.map((report) => (
                      <div
                        key={report.id}
                        className="border rounded-lg p-4 bg-yellow-50 border-yellow-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium">{report.title}</h4>
                              <Badge className={getSeverityColor(report.severity)}>
                                {report.severity.charAt(0).toUpperCase() + report.severity.slice(1)}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-muted-foreground mb-3">
                              <div className="flex items-center space-x-2">
                                <UserIcon className="h-4 w-4" />
                                <span className="font-medium">Teacher:</span> 
                                <span className="text-blue-600 font-semibold">{report.teacherName}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <CalendarIcon className="h-4 w-4" />
                                <span className="font-medium">Time:</span> 
                                <span className="text-green-600 font-semibold">{report.date.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <AlertTriangleIcon className="h-4 w-4" />
                                <span className="font-medium">Reason:</span> 
                                <span className="text-orange-600 font-semibold capitalize">{report.reportType}</span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-muted-foreground mb-2">
                              <div>
                                <span className="font-medium">Learner:</span> {report.learnerName}
                              </div>
                              <div>
                                <span className="font-medium">Subject:</span> {report.subject}
                              </div>
                              <div>
                                <span className="font-medium">Severity:</span> 
                                <Badge className={`ml-1 ${getSeverityColor(report.severity)}`}>
                                  {report.severity.charAt(0).toUpperCase() + report.severity.slice(1)}
                                </Badge>
                              </div>
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-2">
                              {report.description}
                            </p>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedReport(report)}
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => {
                                // Mark as reviewed
                                setReports(prev => 
                                  prev.map(r => 
                                    r.id === report.id 
                                      ? { ...r, status: 'reviewed' as const }
                                      : r
                                  )
                                );
                              }}
                            >
                              Mark Reviewed
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="critical" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Critical Issues</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const criticalReports = filteredReports.filter(r => r.severity === 'critical');
                if (criticalReports.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <CheckCircleIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No critical issues</p>
                      <p className="text-sm text-muted-foreground">
                        All reports are under control
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {criticalReports.map((report) => (
                      <div
                        key={report.id}
                        className="border rounded-lg p-4 bg-red-50 border-red-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium text-red-800">{report.title}</h4>
                              <Badge className="bg-red-100 text-red-800 border-red-200">
                                Critical
                              </Badge>
                              <Badge className={getStatusColor(report.status)}>
                                {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-red-600 mb-3">
                              <div className="flex items-center space-x-2">
                                <UserIcon className="h-4 w-4" />
                                <span className="font-medium">Teacher:</span> 
                                <span className="text-blue-600 font-semibold">{report.teacherName}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <CalendarIcon className="h-4 w-4" />
                                <span className="font-medium">Time:</span> 
                                <span className="text-green-600 font-semibold">{report.date.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <AlertTriangleIcon className="h-4 w-4" />
                                <span className="font-medium">Reason:</span> 
                                <span className="text-orange-600 font-semibold capitalize">{report.reportType}</span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-red-600 mb-2">
                              <div>
                                <span className="font-medium">Learner:</span> {report.learnerName}
                              </div>
                              <div>
                                <span className="font-medium">Subject:</span> {report.subject}
                              </div>
                              <div>
                                <span className="font-medium">Status:</span> 
                                <Badge className={`ml-1 ${getStatusColor(report.status)}`}>
                                  {report.status.charAt(0).toUpperCase() + report.status.slice(1)}
                                </Badge>
                              </div>
                            </div>
                            
                            <p className="text-sm text-red-700 mb-2">
                              {report.description}
                            </p>
                            
                            <div className="text-xs text-red-600">
                              <strong>Actions:</strong> {report.actions.join(', ')}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedReport(report)}
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                // Escalate report
                                setReports(prev => 
                                  prev.map(r => 
                                    r.id === report.id 
                                      ? { ...r, status: 'escalated' as const }
                                      : r
                                  )
                                );
                              }}
                            >
                              Escalate
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resolved" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Resolved Reports</CardTitle>
            </CardHeader>
            <CardContent>
              {(() => {
                const resolvedReports = filteredReports.filter(r => r.status === 'resolved');
                if (resolvedReports.length === 0) {
                  return (
                    <div className="text-center py-8">
                      <CheckCircleIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No resolved reports</p>
                      <p className="text-sm text-muted-foreground">
                        All reports are still being processed
                      </p>
                    </div>
                  );
                }

                return (
                  <div className="space-y-3">
                    {resolvedReports.map((report) => (
                      <div
                        key={report.id}
                        className="border rounded-lg p-4 bg-green-50 border-green-200"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-medium text-green-800">{report.title}</h4>
                              <Badge className="bg-green-100 text-green-800 border-green-200">
                                Resolved
                              </Badge>
                              <Badge className={getSeverityColor(report.severity)}>
                                {report.severity.charAt(0).toUpperCase() + report.severity.slice(1)}
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-green-600 mb-3">
                              <div className="flex items-center space-x-2">
                                <UserIcon className="h-4 w-4" />
                                <span className="font-medium">Teacher:</span> 
                                <span className="text-blue-600 font-semibold">{report.teacherName}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <CalendarIcon className="h-4 w-4" />
                                <span className="font-medium">Time:</span> 
                                <span className="text-green-600 font-semibold">{report.date.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <AlertTriangleIcon className="h-4 w-4" />
                                <span className="font-medium">Reason:</span> 
                                <span className="text-orange-600 font-semibold capitalize">{report.reportType}</span>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-green-600 mb-2">
                              <div>
                                <span className="font-medium">Learner:</span> {report.learnerName}
                              </div>
                              <div>
                                <span className="font-medium">Subject:</span> {report.subject}
                              </div>
                              <div>
                                <span className="font-medium">Resolution Date:</span> 
                                <span className="ml-1">{report.date.toLocaleDateString()}</span>
                              </div>
                            </div>
                            
                            <p className="text-sm text-green-700 mb-2">
                              {report.description}
                            </p>
                            
                            <div className="text-xs text-green-600">
                              <strong>Actions Taken:</strong> {report.actions.join(', ')}
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 ml-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedReport(report)}
                            >
                              <EyeIcon className="h-4 w-4" />
                            </Button>
                            <PDFGenerator
                              contentId={`resolved-report-${report.id}`}
                              title={`Resolved Report - ${report.title}`}
                              fileName={`resolved_report_${report.id}`}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Report Detail Modal */}
      {selectedReport && (
        <Card className="bg-muted/50">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div>
                Report Details: {selectedReport.title}
                <div className="text-sm font-normal text-muted-foreground mt-1">
                  {selectedReport.teacherName} • {selectedReport.date.toLocaleDateString()}
                </div>
              </div>
              <Button variant="outline" onClick={() => setSelectedReport(null)}>
                Close
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <span className="font-medium">Learner:</span> {selectedReport.learnerName}
                </div>
                <div>
                  <span className="font-medium">Grade:</span> {selectedReport.grade}
                </div>
                <div>
                  <span className="font-medium">Subject:</span> {selectedReport.subject}
                </div>
                <div>
                  <span className="font-medium">Type:</span> {selectedReport.reportType}
                </div>
              </div>
              
              <div>
                <span className="font-medium">Description:</span>
                <p className="text-muted-foreground mt-1">{selectedReport.description}</p>
              </div>
              
              <div>
                <span className="font-medium">Actions Taken:</span>
                <ul className="list-disc list-inside text-muted-foreground mt-1">
                  {selectedReport.actions.map((action, index) => (
                    <li key={index}>{action}</li>
                  ))}
                </ul>
              </div>
              
              <div>
                <span className="font-medium">Recommendations:</span>
                <ul className="list-disc list-inside text-muted-foreground mt-1">
                  {selectedReport.recommendations.map((rec, index) => (
                    <li key={index}>{rec}</li>
                  ))}
                </ul>
              </div>
              
              <div className="flex items-center space-x-4">
                <PDFGenerator
                  contentId={`detail-report-${selectedReport.id}`}
                  title={`Detailed Report - ${selectedReport.title}`}
                  fileName={`detailed_report_${selectedReport.id}`}
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    // Update report status
                    setReports(prev => 
                      prev.map(r => 
                        r.id === selectedReport.id 
                          ? { ...r, status: 'reviewed' as const }
                          : r
                      )
                    );
                    setSelectedReport(null);
                  }}
                >
                  Mark as Reviewed
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}


