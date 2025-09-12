import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  BrainIcon,
  BookOpenIcon,
  DownloadIcon,
  SendIcon,
  UsersIcon,
  ClockIcon,
  TargetIcon,
  FileTextIcon,
  PrinterIcon,
  EyeIcon,
  PlusIcon,
  CheckCircleIcon,
  AlertCircleIcon
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { InstitutionBrandedHomeworkPDF } from '@/components/pdf/institution-branded-pdf';

interface HomeworkQuestion {
  id: string;
  question: string;
  marks: number;
  type: 'multiple-choice' | 'short-answer' | 'essay' | 'problem-solving';
}

interface GeneratedHomework {
  id: string;
  topic: string;
  subject: string;
  grade: string;
  questions: HomeworkQuestion[];
  totalMarks: number;
  estimatedTime: number;
  instructions: string;
  dueDate: string;
  status: 'draft' | 'generated' | 'sent' | 'completed';
  createdAt: string;
}

export function AIHomeworkGenerator() {
  const { user, institution } = useAuth();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [homeworkForm, setHomeworkForm] = useState({
    topic: '',
    subject: '',
    grade: '',
    difficulty: 'medium',
    questionCount: 5,
    totalMarks: 25,
    dueDate: '',
    instructions: ''
  });
  const [generatedHomework, setGeneratedHomework] = useState<GeneratedHomework | null>(null);
  const [selectedLearners, setSelectedLearners] = useState<string[]>([]);

  const subjects = ['Mathematics', 'English', 'Science', 'History', 'Geography', 'Physical Education', 'Art', 'Music'];
  const grades = ['Grade 10', 'Grade 11', 'Grade 12'];
  const difficulties = ['easy', 'medium', 'hard'];

  const generateHomework = async () => {
    if (!homeworkForm.topic || !homeworkForm.subject || !homeworkForm.grade) {
      return;
    }

    setGenerating(true);
    
    // Simulate AI generation - replace with actual AI API call
    setTimeout(() => {
      const mockQuestions: HomeworkQuestion[] = [];
      const questionTypes: Array<'multiple-choice' | 'short-answer' | 'essay' | 'problem-solving'> = [
        'multiple-choice', 'short-answer', 'essay', 'problem-solving'
      ];
      
      for (let i = 1; i <= homeworkForm.questionCount; i++) {
        const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];
        let marks = 5;
        let question = '';
        
        switch (type) {
          case 'multiple-choice':
            marks = 2;
            question = `${i}. Multiple Choice Question about ${homeworkForm.topic}:\n\nA) Option A\nB) Option B\nC) Option C\nD) Option D`;
            break;
          case 'short-answer':
            marks = 3;
            question = `${i}. Explain briefly: ${homeworkForm.topic} and its importance.`;
            break;
          case 'essay':
            marks = 8;
            question = `${i}. Write a comprehensive essay on: ${homeworkForm.topic}. Include examples and applications.`;
            break;
          case 'problem-solving':
            marks = 6;
            question = `${i}. Solve the following problem related to ${homeworkForm.topic}:\n\n[Problem description here]`;
            break;
        }
        
        mockQuestions.push({
          id: i.toString(),
          question,
          marks,
          type
        });
      }

      const homework: GeneratedHomework = {
        id: Date.now().toString(),
        topic: homeworkForm.topic,
        subject: homeworkForm.subject,
        grade: homeworkForm.grade,
        questions: mockQuestions,
        totalMarks: mockQuestions.reduce((sum, q) => sum + q.marks, 0),
        estimatedTime: Math.ceil(homeworkForm.questionCount * 8), // 8 minutes per question
        instructions: homeworkForm.instructions || `Complete all questions related to ${homeworkForm.topic}. Show all your work and provide clear explanations where required.`,
        dueDate: homeworkForm.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'generated',
        createdAt: new Date().toISOString()
      };

      setGeneratedHomework(homework);
      setGenerating(false);
    }, 3000);
  };

  const sendToLearners = async () => {
    if (!generatedHomework || selectedLearners.length === 0) return;
    
    setLoading(true);
    // Simulate sending to learners - replace with actual API call
    setTimeout(() => {
      setGeneratedHomework(prev => prev ? { ...prev, status: 'sent' } : null);
      setLoading(false);
    }, 1000);
  };

  const downloadQuestionPaper = () => {
    if (!generatedHomework) return;
    
    // Generate printable question paper with institution branding
    const content = generateQuestionPaperContent();
    downloadAsPDF(content, `Homework_${generatedHomework.subject}_${generatedHomework.topic.replace(/\s+/g, '_')}`);
  };

  const downloadMemorandum = () => {
    if (!generatedHomework) return;
    
    // Generate printable memorandum with institution branding
    const content = generateMemorandumContent();
    downloadAsPDF(content, `Memorandum_${generatedHomework.subject}_${generatedHomework.topic.replace(/\s+/g, '_')}`);
  };

  const generateQuestionPaperContent = () => {
    if (!generatedHomework || !institution) return '';
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">${institution.name}</h1>
          <p style="margin: 5px 0; color: #666;">${institution.address || 'School Address'}</p>
          <p style="margin: 5px 0; color: #666;">Tel: ${institution.phone || 'Phone Number'}</p>
        </div>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #1f2937; margin: 0;">HOMEWORK ASSIGNMENT</h2>
          <p style="margin: 5px 0; color: #666;">Subject: ${generatedHomework.subject}</p>
          <p style="margin: 5px 0; color: #666;">Grade: ${generatedHomework.grade}</p>
          <p style="margin: 5px 0; color: #666;">Topic: ${generatedHomework.topic}</p>
          <p style="margin: 5px 0; color: #666;">Total Marks: ${generatedHomework.totalMarks}</p>
          <p style="margin: 5px 0; color: #666;">Due Date: ${new Date(generatedHomework.dueDate).toLocaleDateString()}</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="color: #374151; border-bottom: 1px solid #d1d5db; padding-bottom: 10px;">Instructions:</h3>
          <p style="color: #4b5563; line-height: 1.6;">${generatedHomework.instructions}</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="color: #374151; border-bottom: 1px solid #d1d5db; padding-bottom: 10px;">Questions:</h3>
          ${generatedHomework.questions.map((q, index) => `
            <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span style="font-weight: bold; color: #374151;">Question ${index + 1}</span>
                <span style="background: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${q.marks} marks</span>
              </div>
              <div style="color: #4b5563; line-height: 1.6; white-space: pre-line;">${q.question}</div>
            </div>
          `).join('')}
        </div>
        
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #d1d5db;">
          <p style="color: #666; font-size: 14px;">Generated by ${user?.fullName} on ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
    `;
  };

  const generateMemorandumContent = () => {
    if (!generatedHomework || !institution) return '';
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">${institution.name}</h1>
          <p style="margin: 5px 0; color: #666;">${institution.address || 'School Address'}</p>
          <p style="margin: 5px 0; color: #666;">Tel: ${institution.phone || 'Phone Number'}</p>
        </div>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #1f2937; margin: 0;">MEMORANDUM</h2>
          <p style="margin: 5px 0; color: #666;">Subject: ${generatedHomework.subject}</p>
          <p style="margin: 5px 0; color: #666;">Grade: ${generatedHomework.grade}</p>
          <p style="margin: 5px 0; color: #666;">Topic: ${generatedHomework.topic}</p>
          <p style="margin: 5px 0; color: #666;">Total Marks: ${generatedHomework.totalMarks}</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="color: #374151; border-bottom: 1px solid #d1d5db; padding-bottom: 10px;">Marking Guide:</h3>
          ${generatedHomework.questions.map((q, index) => `
            <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span style="font-weight: bold; color: #374151;">Question ${index + 1} (${q.marks} marks)</span>
              </div>
              <div style="color: #4b5563; line-height: 1.6;">
                <strong>Expected Answer:</strong><br/>
                [Sample answer or marking criteria for ${q.topic}]
              </div>
              <div style="margin-top: 10px; padding: 10px; background: #f3f4f6; border-radius: 4px;">
                <strong>Marking Breakdown:</strong><br/>
                • Content: ${Math.ceil(q.marks * 0.7)} marks<br/>
                • Presentation: ${Math.ceil(q.marks * 0.2)} marks<br/>
                • Accuracy: ${Math.ceil(q.marks * 0.1)} marks
              </div>
            </div>
          `).join('')}
        </div>
        
        <div style="text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #d1d5db;">
          <p style="color: #666; font-size: 14px;">Generated by ${user?.fullName} on ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
    `;
  };

  const downloadAsPDF = (content: string, filename: string) => {
    // Create a new window with the content and trigger print
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>${filename}</title>
            <style>
              body { margin: 0; padding: 20px; }
              @media print {
                body { padding: 0; }
              }
            </style>
          </head>
          <body>${content}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
          <BrainIcon className="h-5 w-5 text-blue-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">AI Homework Generator</h3>
          <p className="text-sm text-muted-foreground">
            Generate homework assignments using AI and distribute to learners
          </p>
        </div>
      </div>

      {/* Homework Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpenIcon className="h-5 w-5" />
            Generate New Homework
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="topic">Topic *</Label>
              <Input
                id="topic"
                placeholder="e.g., Quadratic Equations, Shakespeare's Sonnets, Photosynthesis"
                value={homeworkForm.topic}
                onChange={(e) => setHomeworkForm({...homeworkForm, topic: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Select value={homeworkForm.subject} onValueChange={(value) => setHomeworkForm({...homeworkForm, subject: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(subject => (
                    <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="grade">Grade *</Label>
              <Select value={homeworkForm.grade} onValueChange={(value) => setHomeworkForm({...homeworkForm, grade: value})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select grade" />
                </SelectTrigger>
                <SelectContent>
                  {grades.map(grade => (
                    <SelectItem key={grade} value={grade}>{grade}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={homeworkForm.difficulty} onValueChange={(value) => setHomeworkForm({...homeworkForm, difficulty: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map(difficulty => (
                    <SelectItem key={difficulty} value={difficulty}>
                      {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="questionCount">Number of Questions</Label>
              <Input
                id="questionCount"
                type="number"
                min="1"
                max="20"
                value={homeworkForm.questionCount}
                onChange={(e) => setHomeworkForm({...homeworkForm, questionCount: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <Label htmlFor="totalMarks">Total Marks</Label>
              <Input
                id="totalMarks"
                type="number"
                min="5"
                max="100"
                value={homeworkForm.totalMarks}
                onChange={(e) => setHomeworkForm({...homeworkForm, totalMarks: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={homeworkForm.dueDate}
                onChange={(e) => setHomeworkForm({...homeworkForm, dueDate: e.target.value})}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="instructions">Additional Instructions (Optional)</Label>
              <Textarea
                id="instructions"
                placeholder="Any specific instructions for students..."
                value={homeworkForm.instructions}
                onChange={(e) => setHomeworkForm({...homeworkForm, instructions: e.target.value})}
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex gap-2 mt-6">
            <Button 
              onClick={generateHomework} 
              disabled={!homeworkForm.topic || !homeworkForm.subject || !homeworkForm.grade || generating}
              className="flex-1"
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating Homework...
                </>
              ) : (
                <>
                  <BrainIcon className="h-4 w-4 mr-2" />
                  Generate Homework
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Homework Display */}
      {generatedHomework && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                Generated Homework
              </CardTitle>
              <Badge className={
                generatedHomework.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                generatedHomework.status === 'generated' ? 'bg-blue-100 text-blue-800' :
                generatedHomework.status === 'sent' ? 'bg-green-100 text-green-800' :
                'bg-purple-100 text-purple-800'
              }>
                {generatedHomework.status.charAt(0).toUpperCase() + generatedHomework.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Homework Summary */}
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{generatedHomework.questions.length}</div>
                  <div className="text-sm text-muted-foreground">Questions</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{generatedHomework.totalMarks}</div>
                  <div className="text-sm text-muted-foreground">Total Marks</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{generatedHomework.estimatedTime}</div>
                  <div className="text-sm text-muted-foreground">Minutes</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{generatedHomework.grade}</div>
                  <div className="text-sm text-muted-foreground">Grade</div>
                </div>
              </div>

              {/* Questions Preview */}
              <div>
                <h4 className="font-medium mb-3">Questions Preview:</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {generatedHomework.questions.map((question, index) => (
                    <div key={question.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <span className="font-medium">Question {index + 1}</span>
                        <Badge variant="outline">{question.marks} marks</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{question.question}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <InstitutionBrandedHomeworkPDF
                  homework={homework}
                  questions={generatedHomework.questions}
                  memorandum={generatedHomework.memorandum}
                />
                
                <div className="flex justify-end">
                  <Button 
                    onClick={sendToLearners} 
                    disabled={generatedHomework.status === 'sent' || loading}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <SendIcon className="h-4 w-4 mr-2" />
                        Send to Learners
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}




