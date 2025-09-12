import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { AuthLayout } from '@/components/layout/auth-layout';
import { CompetitionManager } from '@/components/competitions/competition-manager';
import { useAuth } from '@/lib/auth-context';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { jsPDF } from 'jspdf';
import { 
  Trophy, 
  Calendar, 
  Users, 
  Award, 
  BookOpen, 
  Target,
  TrendingUp,
  Eye,
  Download,
  FileText,
  BarChart3,
  Star
} from 'lucide-react';

interface Competition {
  id: string;
  name: string;
  description: string;
  type: 'Academic' | 'Science' | 'Sports' | 'Arts' | 'Public Speaking';
  status: 'Upcoming' | 'Active' | 'Completed';
  startDate: string;
  endDate: string;
  maxParticipants: number;
  currentParticipants: number;
  prizes: number;
  requirements: string[];
  rules: string[];
  results?: {
    winner: string;
    runnerUp: string;
    thirdPlace: string;
    participants: Array<{
      name: string;
      school: string;
      score: number;
      rank: number;
    }>;
    totalParticipants: number;
    averageScore: number;
    highestScore: number;
    completionDate: string;
  };
}

export default function Competitions() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedCompetition, setSelectedCompetition] = useState<Competition | null>(null);
  const [competitions, setCompetitions] = useState<Competition[]>([]);

  useEffect(() => {
    // Load sample competitions data
    const sampleCompetitions: Competition[] = [
      {
        id: 'comp-1',
        name: 'Mathematics Olympiad',
        description: 'Annual mathematics competition for high school students covering algebra, geometry, calculus, and problem-solving.',
        type: 'Academic',
        status: 'Upcoming',
        startDate: '2025-09-01',
        endDate: '2025-09-30',
        maxParticipants: 200,
        currentParticipants: 156,
        prizes: 3,
        requirements: ['Grade 10-12 students', 'Mathematics proficiency', 'Problem-solving skills'],
        rules: ['Individual participation only', 'No calculators allowed', '3-hour time limit']
      },
      {
        id: 'comp-2',
        name: 'Science Fair',
        description: 'Innovation and research project showcase where students present scientific experiments and discoveries.',
        type: 'Science',
        status: 'Active',
        startDate: '2025-08-15',
        endDate: '2025-08-20',
        maxParticipants: 50,
        currentParticipants: 42,
        prizes: 3,
        requirements: ['All grades welcome', 'Original research project', 'Scientific method application'],
        rules: ['Group projects allowed (max 3 students)', 'Safety protocols must be followed', 'Presentation required']
      },
      {
        id: 'comp-3',
        name: 'Debate Championship',
        description: 'Inter-school debate competition focusing on current affairs, critical thinking, and public speaking skills.',
        type: 'Public Speaking',
        status: 'Completed',
        startDate: '2025-07-01',
        endDate: '2025-07-15',
        maxParticipants: 100,
        currentParticipants: 100,
        prizes: 3,
        requirements: ['Grade 9-12 students', 'Public speaking ability', 'Research skills'],
        rules: ['Team format (2 students per team)', 'Topics announced 1 week in advance', 'Judged on content and delivery'],
        results: {
          winner: 'Team Alpha - Boitekong Secondary',
          runnerUp: 'Team Beta - Rustenburg High',
          thirdPlace: 'Team Gamma - Marikana Academy',
          participants: [
            { name: 'Team Alpha', school: 'Boitekong Secondary', score: 95, rank: 1 },
            { name: 'Team Beta', school: 'Rustenburg High', score: 92, rank: 2 },
            { name: 'Team Gamma', school: 'Marikana Academy', score: 89, rank: 3 },
            { name: 'Team Delta', school: 'Phokeng College', score: 87, rank: 4 },
            { name: 'Team Epsilon', school: 'Lichtenburg High', score: 85, rank: 5 }
          ],
          totalParticipants: 100,
          averageScore: 78.5,
          highestScore: 95,
          completionDate: '2025-07-15'
        }
      }
    ];
    setCompetitions(sampleCompetitions);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Upcoming': return 'bg-blue-100 text-blue-800';
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Completed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Academic': return 'bg-purple-100 text-purple-800';
      case 'Science': return 'bg-blue-100 text-blue-800';
      case 'Sports': return 'bg-green-100 text-green-800';
      case 'Arts': return 'bg-pink-100 text-pink-800';
      case 'Public Speaking': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportCompetitionResultsPDF = (competition: Competition) => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      
      // Add PSC Tech branding header
      pdf.setFillColor(31, 41, 55);
      pdf.rect(0, 0, pageWidth, 40, 'F');
      
      // Add PSC Tech logo placeholder (you can replace with actual logo)
      pdf.setFillColor(255, 255, 255);
      pdf.circle(25, 20, 15, 'F');
      pdf.setTextColor(31, 41, 55);
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PSC', 25, 25, { align: 'center' });
      
      // Add PSC Tech branding
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PSC Tech', 50, 25);
      pdf.setFontSize(14);
      pdf.text('Competition Results Report', 50, 35);
      
      // Add competition title
      pdf.setFillColor(245, 245, 245);
      pdf.rect(10, 50, pageWidth - 20, 20, 'F');
      pdf.setTextColor(31, 41, 55);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(competition.name.toUpperCase(), pageWidth / 2, 65, { align: 'center' });
      
      // Add competition details
      pdf.setTextColor(31, 41, 55);
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      
      const detailsY = 90;
      pdf.text(`Type: ${competition.type}`, 20, detailsY);
      pdf.text(`Status: ${competition.status}`, 20, detailsY + 10);
      pdf.text(`Period: ${competition.startDate} to ${competition.endDate}`, 20, detailsY + 20);
      pdf.text(`Total Participants: ${competition.maxParticipants}`, 20, detailsY + 30);
      
      if (competition.results) {
        // Add results summary
        pdf.setFillColor(254, 243, 199);
        pdf.rect(20, 140, pageWidth - 40, 30, 'F');
        pdf.setTextColor(120, 53, 15);
        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('COMPETITION RESULTS', pageWidth / 2, 155, { align: 'center' });
        
        // Add winners
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('🏆 Winner:', 20, 175);
        pdf.setFont('helvetica', 'normal');
        pdf.text(competition.results.winner, 50, 175);
        
        pdf.setFont('helvetica', 'bold');
        pdf.text('🥈 Runner Up:', 20, 185);
        pdf.setFont('helvetica', 'normal');
        pdf.text(competition.results.runnerUp, 50, 185);
        
        pdf.setFont('helvetica', 'bold');
        pdf.text('🥉 Third Place:', 20, 195);
        pdf.setFont('helvetica', 'normal');
        pdf.text(competition.results.thirdPlace, 50, 195);
        
        // Add statistics
        pdf.setFillColor(243, 244, 246);
        pdf.rect(20, 210, pageWidth - 40, 25, 'F');
        pdf.setTextColor(107, 114, 128);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text('STATISTICS:', 25, 220);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Average Score: ${competition.results.averageScore}`, 25, 230);
        pdf.text(`Highest Score: ${competition.results.highestScore}`, 25, 235);
        
        // Add participant rankings (top 10)
        if (competition.results.participants && competition.results.participants.length > 0) {
          pdf.setFillColor(248, 250, 252);
          pdf.rect(20, 250, pageWidth - 40, 40, 'F');
          pdf.setTextColor(31, 41, 55);
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'bold');
          pdf.text('TOP PARTICIPANTS:', 25, 260);
          
          let yPos = 270;
          competition.results.participants.slice(0, 10).forEach((participant, index) => {
            pdf.text(`${index + 1}. ${participant.name} - ${participant.school} (Score: ${participant.score})`, 25, yPos);
            yPos += 5;
          });
        }
      }
      
      // Add footer with PSC Tech branding
      pdf.setFillColor(248, 250, 252);
      pdf.rect(0, pageHeight - 25, pageWidth, 25, 'F');
      
      // Add separator line
      pdf.setDrawColor(209, 213, 219);
      pdf.line(20, pageHeight - 25, pageWidth - 20, pageHeight - 25);
      
      // Add footer content
      pdf.setFontSize(8);
      pdf.setTextColor(107, 114, 128);
      
      // Left side - Generation info
      pdf.text(`Generated on ${new Date().toLocaleDateString()}`, 20, pageHeight - 15);
      
      // Center - PSC Tech branding
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(31, 41, 55);
      pdf.text('PSC Tech', pageWidth / 2, pageHeight - 20, { align: 'center' });
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(7);
      pdf.setTextColor(156, 163, 175);
      pdf.text('Powered by Nkanyezi Tech Solutions', pageWidth / 2, pageHeight - 15, { align: 'center' });
      
      // Right side - Contact info
      pdf.setTextColor(107, 114, 128);
      pdf.text('www.psctech.co.za', pageWidth - 20, pageHeight - 15, { align: 'right' });
      
      // Save the PDF
      pdf.save(`PSC_Tech_${competition.name.replace(/\s+/g, '_')}_Results.pdf`);
      
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <AuthLayout>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">School Competitions</h1>
            <p className="text-muted-foreground">
              {user?.role === 'Superadmin' || user?.role === 'Principal'
                ? 'Manage and monitor school competitions, track performance, and set up challenges.'
                : 'View available competitions and join challenges for your school.'
              }
            </p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Competition Overview</TabsTrigger>
              <TabsTrigger value="details">Competition Details</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <CompetitionManager />
            </TabsContent>

            <TabsContent value="details" className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold tracking-tight mb-4">Competition Management</h2>
                <p className="text-muted-foreground mb-6">
                  View available competitions and participate
                </p>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {competitions.map((competition) => (
                    <Card key={competition.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-yellow-600" />
                            <CardTitle className="text-lg">{competition.name}</CardTitle>
                          </div>
                          <Badge className={getStatusColor(competition.status)}>
                            {competition.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {competition.description}
                        </p>
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                            <Badge className={getTypeColor(competition.type)}>
                              {competition.type}
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{competition.startDate} - {competition.endDate}</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <span>{competition.currentParticipants}/{competition.maxParticipants} participants</span>
                          </div>
                          
                          <div className="flex items-center gap-2 text-sm">
                            <Award className="h-4 w-4 text-muted-foreground" />
                            <span>{competition.prizes} prizes</span>
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full" 
                          onClick={() => setSelectedCompetition(competition)}
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>

          {/* Competition Details Modal */}
          {selectedCompetition && (
            <Card className="border-2 border-blue-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Trophy className="h-8 w-8 text-yellow-600" />
                    <div>
                      <CardTitle className="text-2xl">{selectedCompetition.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={getStatusColor(selectedCompetition.status)}>
                          {selectedCompetition.status}
                        </Badge>
                        <Badge className={getTypeColor(selectedCompetition.type)}>
                          {selectedCompetition.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" onClick={() => setSelectedCompetition(null)}>
                    Close
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2">Description</h4>
                  <p className="text-muted-foreground">{selectedCompetition.description}</p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">Requirements</h4>
                    <ul className="space-y-2">
                      {selectedCompetition.requirements.map((req, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <Target className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Rules</h4>
                    <ul className="space-y-2">
                      {selectedCompetition.rules.map((rule, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-600" />
                          <span className="text-sm">{rule}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {selectedCompetition.results && (
                  <div className="border-t pt-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold">Results</h4>
                      <Button 
                        onClick={() => exportCompetitionResultsPDF(selectedCompetition)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export Results PDF
                      </Button>
                    </div>
                    
                    {/* Winners Section */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <Award className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                        <p className="font-medium text-yellow-800">Winner</p>
                        <p className="text-sm text-yellow-700">{selectedCompetition.results.winner}</p>
                      </div>
                      <div className="text-center p-3 bg-gray-50 rounded-lg">
                        <Award className="h-6 w-6 text-gray-600 mx-auto mb-2" />
                        <p className="font-medium text-gray-800">Runner Up</p>
                        <p className="text-sm text-gray-700">{selectedCompetition.results.runnerUp}</p>
                      </div>
                      <div className="text-center p-3 bg-orange-50 rounded-lg">
                        <Award className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                        <p className="font-medium text-orange-800">Third Place</p>
                        <p className="text-sm text-orange-700">{selectedCompetition.results.thirdPlace}</p>
                      </div>
                    </div>
                    
                    {/* Statistics Section */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <BarChart3 className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                        <p className="font-medium text-blue-800">Total Participants</p>
                        <p className="text-sm text-blue-700">{selectedCompetition.results.totalParticipants}</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
                        <p className="font-medium text-green-800">Average Score</p>
                        <p className="text-sm text-green-700">{selectedCompetition.results.averageScore}</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <Star className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                        <p className="font-medium text-purple-800">Highest Score</p>
                        <p className="text-sm text-purple-700">{selectedCompetition.results.highestScore}</p>
                      </div>
                      <div className="text-center p-3 bg-indigo-50 rounded-lg">
                        <Calendar className="h-6 w-6 text-indigo-600 mx-auto mb-2" />
                        <p className="font-medium text-indigo-800">Completed</p>
                        <p className="text-sm text-indigo-700">{selectedCompetition.results.completionDate}</p>
                      </div>
                    </div>
                    
                    {/* Top Participants Table */}
                    {selectedCompetition.results.participants && selectedCompetition.results.participants.length > 0 && (
                      <div className="border-t pt-4">
                        <h5 className="font-semibold mb-3">Top Participants</h5>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="space-y-2">
                            {selectedCompetition.results.participants.slice(0, 10).map((participant, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                                <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                    index === 0 ? 'bg-yellow-100 text-yellow-800' :
                                    index === 1 ? 'bg-gray-100 text-gray-800' :
                                    index === 2 ? 'bg-orange-100 text-orange-800' :
                                    'bg-blue-100 text-blue-800'
                                  }`}>
                                    {index + 1}
                                  </div>
                                  <div>
                                    <p className="font-medium">{participant.name}</p>
                                    <p className="text-sm text-muted-foreground">{participant.school}</p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-blue-600">{participant.score}</p>
                                  <p className="text-xs text-muted-foreground">points</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </DashboardLayout>
    </AuthLayout>
  );
}




