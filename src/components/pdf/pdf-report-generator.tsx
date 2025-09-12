import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { Student } from '@/lib/types';
import { PDFGenerator } from './pdf-generator';

// Extend jsPDF with autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: unknown) => jsPDF;
  }
}

interface ClassAttendance {
  className: string;
  averageAttendance: number;
  studentCount: number;
  dates: Record<string, number>; // date -> attendance count
}

interface SubjectPerformance {
  subjectName: string;
  averageScore: number;
  classBreakdown: Record<string, number>; // className -> average score
}

export class PDFReportGenerator {
  
  // Generate attendance report
  static async generateAttendanceReport(
    schoolName: string,
    attendanceData: ClassAttendance[],
    periodText: string,
    totalStudents: number,
    classNames: string[]
  ) {
    // Create new PDF
    const doc = new jsPDF();
    
    // Add school logo and header
    await PDFGenerator.addLogoAndHeader(doc, schoolName);
    
    // Add title
    doc.setFontSize(16);
    doc.text("Attendance Report", 105, 40, { align: "center" });
    
    // Add period
    doc.setFontSize(12);
    doc.text(`Period: ${periodText}`, 105, 48, { align: "center" });
    
    // Add date
    const today = new Date().toLocaleDateString();
    doc.text(`Generated: ${today}`, 105, 54, { align: "center" });
    
    // Add overall attendance summary
    doc.setFontSize(14);
    doc.text("Overall Attendance Summary", 20, 65);
    
    // Calculate overall attendance
    const overallAttendance = attendanceData.reduce((sum, cls) => {
      return sum + (cls.averageAttendance * cls.studentCount);
    }, 0) / totalStudents || 0;
    
    // Add overall attendance data
    doc.setFontSize(12);
    doc.text(`School Overall Attendance: ${overallAttendance.toFixed(2)}%`, 20, 75);
    doc.text(`Total Students: ${totalStudents}`, 20, 81);
    
    // Add class breakdown table
    doc.setFontSize(14);
    doc.text("Class Breakdown", 20, 95);
    
    // Table headers and data
    const headers = [["Class", "Average Attendance (%)", "Student Count"]];
    const data = attendanceData.map(cls => [
      cls.className,
      cls.averageAttendance.toFixed(2),
      cls.studentCount.toString()
    ]);
    
    // Add table
    doc.autoTable({
      head: headers,
      body: data,
      startY: 100,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    // Add daily attendance trends
    doc.setFontSize(14);
    const tableHeight = (data.length * 10) + 30; // Estimate table height
    doc.text("Last 7 Days Attendance Trend", 20, 110 + tableHeight);
    
    // Get last 7 days
    const last7Days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.unshift(d.toISOString().split('T')[0]);
    }
    
    // Create headers and data for daily trends
    const dailyHeaders = [["Date", ...attendanceData.map(cls => cls.className)]];
    const dailyData = last7Days.map(date => {
      const row = [date];
      attendanceData.forEach(cls => {
        const attendance = cls.dates[date] || 0;
        const percentage = ((attendance / cls.studentCount) * 100).toFixed(2);
        row.push(`${percentage}%`);
      });
      return row;
    });
    
    // Add daily attendance table
    doc.autoTable({
      head: dailyHeaders,
      body: dailyData,
      startY: 120 + tableHeight,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    // Add signature section
    PDFGenerator.addSignatureSection(doc, "Principal");
    
    // Save PDF
    doc.save("attendance_report.pdf");
  }
  
  // Generate performance report
  static async generatePerformanceReport(
    schoolName: string,
    performanceData: SubjectPerformance[],
    periodText: string,
    classNames: string[],
    students: Student[]
  ) {
    // Create new PDF
    const doc = new jsPDF();
    
    // Add school logo and header
    await PDFGenerator.addLogoAndHeader(doc, schoolName);
    
    // Add title
    doc.setFontSize(16);
    doc.text("Academic Performance Report", 105, 40, { align: "center" });
    
    // Add period
    doc.setFontSize(12);
    doc.text(`Period: ${periodText}`, 105, 48, { align: "center" });
    
    // Add date
    const today = new Date().toLocaleDateString();
    doc.text(`Generated: ${today}`, 105, 54, { align: "center" });
    
    // Add overall performance summary
    doc.setFontSize(14);
    doc.text("Overall Performance Summary", 20, 65);
    
    // Calculate overall performance
    const overallPerformance = performanceData.reduce((sum, subject) => {
      return sum + subject.averageScore;
    }, 0) / performanceData.length || 0;
    
    // Add overall performance data
    doc.setFontSize(12);
    doc.text(`School Overall Performance: ${overallPerformance.toFixed(2)}%`, 20, 75);
    doc.text(`Total Classes: ${classNames.length}`, 20, 81);
    doc.text(`Total Students: ${students.length}`, 20, 87);
    
    // Add subject breakdown table
    doc.setFontSize(14);
    doc.text("Subject Performance Breakdown", 20, 100);
    
    // Table headers and data
    const headers = [["Subject", "Average Score (%)"]];
    const data = performanceData.map(subject => [
      subject.subjectName,
      subject.averageScore.toFixed(2)
    ]);
    
    // Add table
    doc.autoTable({
      head: headers,
      body: data,
      startY: 105,
      theme: 'grid',
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    // Add class subject breakdown
    doc.setFontSize(14);
    const tableHeight = (data.length * 10) + 30; // Estimate table height
    doc.text("Class Performance by Subject", 20, 115 + tableHeight);
    
    // Create headers and data for class subject breakdown
    const classHeaders = [["Class", ...performanceData.map(subject => subject.subjectName)]];
    const classData = classNames.map(className => {
      const row = [className];
      performanceData.forEach(subject => {
        const score = subject.classBreakdown[className] || 0;
        row.push(score.toFixed(2));
      });
      return row;
    });
    
    // Add class subject table
    doc.autoTable({
      head: classHeaders,
      body: classData,
      startY: 120 + tableHeight,
      theme: 'grid',
      styles: { fontSize: 9 },
      headStyles: { fillColor: [41, 128, 185] }
    });
    
    // Add signature section
    PDFGenerator.addSignatureSection(doc, "Principal");
    
    // Save PDF
    doc.save("performance_report.pdf");
  }
}