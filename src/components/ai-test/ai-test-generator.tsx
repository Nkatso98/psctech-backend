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
  FileTextIcon,
  DownloadIcon,
  PrinterIcon,
  ClockIcon,
  TargetIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  BookOpenIcon,
  CalculatorIcon,
  CalendarIcon,
  UsersIcon,
  EyeIcon,
  EditIcon,
  PlusIcon
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { InstitutionBrandedTestPDF } from '@/components/pdf/institution-branded-pdf';

interface TestQuestion {
  id: string;
  question: string;
  marks: number;
  type: 'multiple-choice' | 'short-answer' | 'essay' | 'problem-solving' | 'true-false';
  options?: string[];
  correctAnswer?: string;
  markingCriteria?: string;
}

interface GeneratedTest {
  id: string;
  title: string;
  subject: string;
  grade: string;
  topics: string[];
  questions: TestQuestion[];
  totalMarks: number;
  duration: number;
  instructions: string;
  examDate: string;
  status: 'draft' | 'generated' | 'scheduled' | 'completed';
  createdAt: string;
}

export function AITestGenerator() {
  const { user, institution } = useAuth();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [testForm, setTestForm] = useState({
    title: '',
    subject: '',
    grade: '',
    topics: '',
    totalMarks: 50,
    duration: 60,
    difficulty: 'medium',
    questionCount: 10,
    examDate: '',
    instructions: ''
  });
  const [generatedTest, setGeneratedTest] = useState<GeneratedTest | null>(null);
  const [selectedClasses, setSelectedClasses] = useState<string[]>([]);

  const subjects = ['Mathematics', 'English', 'Science', 'History', 'Geography', 'Physical Education', 'Art', 'Music'];
  const grades = ['Grade 10', 'Grade 11', 'Grade 12'];
  const difficulties = ['easy', 'medium', 'hard'];

  const generateTest = async () => {
    if (!testForm.title || !testForm.subject || !testForm.grade || !testForm.topics) {
      return;
    }

    setGenerating(true);
    
    // Simulate AI generation - replace with actual AI API call
    setTimeout(() => {
      const mockQuestions: TestQuestion[] = [];
      const questionTypes: Array<'multiple-choice' | 'short-answer' | 'essay' | 'problem-solving' | 'true-false'> = [
        'multiple-choice', 'short-answer', 'essay', 'problem-solving', 'true-false'
      ];
      
      for (let i = 1; i <= testForm.questionCount; i++) {
        const type = questionTypes[Math.floor(Math.random() * questionTypes.length)];
        let marks = 5;
        let question = '';
        let options: string[] = [];
        let correctAnswer = '';
        let markingCriteria = '';
        
        switch (type) {
          case 'multiple-choice':
            marks = 2;
            question = `${i}. Multiple Choice Question about ${testForm.topics}:\n\nWhat is the main concept of ${testForm.topics}?`;
            options = ['Option A: First concept', 'Option B: Second concept', 'Option C: Third concept', 'Option D: Fourth concept'];
            correctAnswer = 'Option A: First concept';
            markingCriteria = 'Correct answer: 2 marks, Incorrect: 0 marks';
            break;
          case 'short-answer':
            marks = 3;
            question = `${i}. Explain briefly: ${testForm.topics} and its significance in ${testForm.subject}.`;
            markingCriteria = 'Content: 2 marks, Clarity: 1 mark';
            break;
          case 'essay':
            marks = 10;
            question = `${i}. Write a comprehensive essay on: ${testForm.topics}. Include examples, applications, and your own analysis.`;
            markingCriteria = 'Content: 6 marks, Structure: 2 marks, Language: 2 marks';
            break;
          case 'problem-solving':
            marks = 8;
            question = `${i}. Solve the following problem related to ${testForm.topics}:\n\n[Detailed problem description with calculations required]`;
            markingCriteria = 'Method: 3 marks, Calculations: 3 marks, Final answer: 2 marks';
            break;
          case 'true-false':
            marks = 1;
            question = `${i}. True or False: ${testForm.topics} is a fundamental concept in ${testForm.subject}.`;
            correctAnswer = 'True';
            markingCriteria = 'Correct: 1 mark, Incorrect: 0 marks';
            break;
        }
        
        mockQuestions.push({
          id: i.toString(),
          question,
          marks,
          type,
          options: options.length > 0 ? options : undefined,
          correctAnswer: correctAnswer || undefined,
          markingCriteria
        });
      }

      const test: GeneratedTest = {
        id: Date.now().toString(),
        title: testForm.title,
        subject: testForm.subject,
        grade: testForm.grade,
        topics: testForm.topics.split(',').map(t => t.trim()),
        questions: mockQuestions,
        totalMarks: mockQuestions.reduce((sum, q) => sum + q.marks, 0),
        duration: testForm.duration,
        instructions: testForm.instructions || `Answer all questions. Show all your work for problem-solving questions. Write clearly and legibly.`,
        examDate: testForm.examDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'generated',
        createdAt: new Date().toISOString()
      };

      setGeneratedTest(test);
      setGenerating(false);
    }, 4000);
  };

  const scheduleTest = async () => {
    if (!generatedTest || selectedClasses.length === 0) return;
    
    setLoading(true);
    // Simulate scheduling - replace with actual API call
    setTimeout(() => {
      setGeneratedTest(prev => prev ? { ...prev, status: 'scheduled' } : null);
      setLoading(false);
    }, 1000);
  };

  const downloadTestPaper = () => {
    if (!generatedTest) return;
    
    // Generate printable test paper with institution branding
    const content = generateTestPaperContent();
    downloadAsPDF(content, `Test_${generatedTest.subject}_${generatedTest.title.replace(/\s+/g, '_')}`);
  };

  const downloadMemorandum = () => {
    if (!generatedTest) return;
    
    // Generate printable memorandum with institution branding
    const content = generateMemorandumContent();
    downloadAsPDF(content, `Memorandum_${generatedTest.subject}_${generatedTest.title.replace(/\s+/g, '_')}`);
  };

  const generateTestPaperContent = () => {
    if (!generatedTest || !institution) return '';
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">${institution.name}</h1>
          <p style="margin: 5px 0; color: #666;">${institution.address || 'School Address'}</p>
          <p style="margin: 5px 0; color: #666;">Tel: ${institution.phone || 'Phone Number'}</p>
        </div>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #1f2937; margin: 0;">EXAMINATION</h2>
          <h3 style="color: #374151; margin: 10px 0;">${generatedTest.title}</h3>
          <p style="margin: 5px 0; color: #666;">Subject: ${generatedTest.subject}</p>
          <p style="margin: 5px 0; color: #666;">Grade: ${generatedTest.grade}</p>
          <p style="margin: 5px 0; color: #666;">Topics: ${generatedTest.topics.join(', ')}</p>
          <p style="margin: 5px 0; color: #666;">Total Marks: ${generatedTest.totalMarks}</p>
          <p style="margin: 5px 0; color: #666;">Duration: ${generatedTest.duration} minutes</p>
          <p style="margin: 5px 0; color: #666;">Date: ${new Date(generatedTest.examDate).toLocaleDateString()}</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="color: #374151; border-bottom: 1px solid #d1d5db; padding-bottom: 10px;">Instructions:</h3>
          <p style="color: #4b5563; line-height: 1.6;">${generatedTest.instructions}</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="color: #374151; border-bottom: 1px solid #d1d5db; padding-bottom: 10px;">Questions:</h3>
          ${generatedTest.questions.map((q, index) => `
            <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span style="font-weight: bold; color: #374151;">Question ${index + 1}</span>
                <span style="background: #dbeafe; color: #1e40af; padding: 4px 8px; border-radius: 4px; font-size: 12px;">${q.marks} marks</span>
              </div>
              <div style="color: #4b5563; line-height: 1.6; white-space: pre-line;">${q.question}</div>
              ${q.options ? `
                <div style="margin-top: 10px; padding-left: 20px;">
                  ${q.options.map(option => `<div style="margin: 5px 0;">${option}</div>`).join('')}
                </div>
              ` : ''}
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
    if (!generatedTest || !institution) return '';
    
    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="color: #2563eb; margin: 0;">${institution.name}</h1>
          <p style="margin: 5px 0; color: #666;">${institution.address || 'School Address'}</p>
          <p style="margin: 5px 0; color: #666;">Tel: ${institution.phone || 'Phone Number'}</p>
        </div>
        
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #1f2937; margin: 0;">MEMORANDUM</h2>
          <h3 style="color: #374151; margin: 10px 0;">${generatedTest.title}</h3>
          <p style="margin: 5px 0; color: #666;">Subject: ${generatedTest.subject}</p>
          <p style="margin: 5px 0; color: #666;">Grade: ${generatedTest.grade}</p>
          <p style="margin: 5px 0; color: #666;">Topics: ${generatedTest.topics.join(', ')}</p>
          <p style="margin: 5px 0; color: #666;">Total Marks: ${generatedTest.totalMarks}</p>
        </div>
        
        <div style="margin-bottom: 30px;">
          <h3 style="color: #374151; border-bottom: 1px solid #d1d5db; padding-bottom: 10px;">Marking Guide:</h3>
          ${generatedTest.questions.map((q, index) => `
            <div style="margin-bottom: 20px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <span style="font-weight: bold; color: #374151;">Question ${index + 1} (${q.marks} marks)</span>
              </div>
              <div style="color: #4b5563; line-height: 1.6;">
                <strong>Expected Answer:</strong><br/>
                [Sample answer or marking criteria for ${q.type} question]
              </div>
              ${q.correctAnswer ? `
                <div style="margin-top: 10px; padding: 10px; background: #f0f9ff; border-radius: 4px;">
                  <strong>Correct Answer:</strong> ${q.correctAnswer}
                </div>
              ` : ''}
              <div style="margin-top: 10px; padding: 10px; background: #f3f4f6; border-radius: 4px;">
                <strong>Marking Breakdown:</strong><br/>
                ${q.markingCriteria}
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
        <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
          <BrainIcon className="h-5 w-5 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold">AI Test Generator</h3>
          <p className="text-sm text-muted-foreground">
            Generate comprehensive test papers using AI with institution branding
          </p>
        </div>
      </div>

      {/* Test Generation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileTextIcon className="h-5 w-5" />
            Generate New Test
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label htmlFor="title">Test Title *</Label>
              <Input
                id="title"
                placeholder="e.g., Mid-Term Test, Final Examination, Quiz 1"
                value={testForm.title}
                onChange={(e) => setTestForm({...testForm, title: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="subject">Subject *</Label>
              <Select value={testForm.subject} onValueChange={(value) => setTestForm({...testForm, subject: value})}>
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
              <Select value={testForm.grade} onValueChange={(value) => setTestForm({...testForm, grade: value})}>
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
              <Label htmlFor="topics">Topics Covered *</Label>
              <Input
                id="topics"
                placeholder="e.g., Algebra, Calculus, Trigonometry (comma-separated)"
                value={testForm.topics}
                onChange={(e) => setTestForm({...testForm, topics: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="totalMarks">Total Marks</Label>
              <Input
                id="totalMarks"
                type="number"
                min="10"
                max="100"
                value={testForm.totalMarks}
                onChange={(e) => setTestForm({...testForm, totalMarks: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration (minutes)</Label>
              <Input
                id="duration"
                type="number"
                min="15"
                max="180"
                value={testForm.duration}
                onChange={(e) => setTestForm({...testForm, duration: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <Label htmlFor="difficulty">Difficulty Level</Label>
              <Select value={testForm.difficulty} onValueChange={(value) => setTestForm({...testForm, difficulty: value})}>
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
                min="5"
                max="30"
                value={testForm.questionCount}
                onChange={(e) => setTestForm({...testForm, questionCount: parseInt(e.target.value)})}
              />
            </div>
            <div>
              <Label htmlFor="examDate">Exam Date</Label>
              <Input
                id="examDate"
                type="date"
                value={testForm.examDate}
                onChange={(e) => setTestForm({...testForm, examDate: e.target.value})}
              />
            </div>
            <div className="md:col-span-2">
              <Label htmlFor="instructions">Test Instructions (Optional)</Label>
              <Textarea
                id="instructions"
                placeholder="Any specific instructions for students..."
                value={testForm.instructions}
                onChange={(e) => setTestForm({...testForm, instructions: e.target.value})}
                rows={3}
              />
            </div>
          </div>
          
          <div className="flex gap-2 mt-6">
            <Button 
              onClick={generateTest} 
              disabled={!testForm.title || !testForm.subject || !testForm.grade || !testForm.topics || generating}
              className="flex-1"
            >
              {generating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Generating Test...
                </>
              ) : (
                <>
                  <BrainIcon className="h-4 w-4 mr-2" />
                  Generate Test
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Generated Test Display */}
      {generatedTest && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckCircleIcon className="h-5 w-5 text-green-600" />
                Generated Test: {generatedTest.title}
              </CardTitle>
              <Badge className={
                generatedTest.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                generatedTest.status === 'generated' ? 'bg-blue-100 text-blue-800' :
                generatedTest.status === 'scheduled' ? 'bg-green-100 text-green-800' :
                'bg-purple-100 text-purple-800'
              }>
                {generatedTest.status.charAt(0).toUpperCase() + generatedTest.status.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Test Summary */}
              <div className="grid gap-4 md:grid-cols-5">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{generatedTest.questions.length}</div>
                  <div className="text-sm text-muted-foreground">Questions</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{generatedTest.totalMarks}</div>
                  <div className="text-sm text-muted-foreground">Total Marks</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-orange-600">{generatedTest.duration}</div>
                  <div className="text-sm text-muted-foreground">Minutes</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{generatedTest.grade}</div>
                  <div className="text-sm text-muted-foreground">Grade</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{generatedTest.topics.length}</div>
                  <div className="text-sm text-muted-foreground">Topics</div>
                </div>
              </div>

              {/* Topics Covered */}
              <div>
                <h4 className="font-medium mb-3">Topics Covered:</h4>
                <div className="flex flex-wrap gap-2">
                  {generatedTest.topics.map((topic, index) => (
                    <Badge key={index} variant="secondary">{topic}</Badge>
                  ))}
                </div>
              </div>

              {/* Questions Preview */}
              <div>
                <h4 className="font-medium mb-3">Questions Preview:</h4>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {generatedTest.questions.map((question, index) => (
                    <div key={question.id} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">Question {index + 1}</span>
                          <Badge variant="outline" className="text-xs">{question.type}</Badge>
                        </div>
                        <Badge variant="outline">{question.marks} marks</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{question.question}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-4">
                <InstitutionBrandedTestPDF
                  test={testForm}
                  questions={generatedTest.questions}
                  memorandum={generatedTest.memorandum}
                />
                
                <div className="flex justify-end">
                  <Button 
                    onClick={scheduleTest} 
                    disabled={generatedTest.status === 'scheduled' || loading}
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Scheduling...
                      </>
                    ) : (
                      <>
                        <CalendarIcon className="h-4 w-4 mr-2" />
                        Schedule Test
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




