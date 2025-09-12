import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { 
  BrainIcon, 
  BookOpenIcon, 
  TargetIcon, 
  TrendingUpIcon,
  LightbulbIcon,
  ClockIcon,
  AwardIcon,
  UsersIcon,
  GlobeIcon,
  GraduationCapIcon,
  ZapIcon,
  BarChart3Icon
} from 'lucide-react';
import { 
  CurriculumFramework, 
  QuestionType, 
  CognitiveLevel,
  AIQuestionRequest,
  CAPSCurriculum,
  InternationalCurriculum
} from '@/lib/types';
import { curriculumStandardsAPI } from '@/lib/curriculum-standards';
import { aiTestingSystem } from '@/lib/ai-testing-system';
import { useAuth } from '@/lib/auth-context';

export function EnhancedStudyZone() {
  const { user, institution } = useAuth();
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedGrade, setSelectedGrade] = useState<string>('');
  const [selectedCurriculum, setSelectedCurriculum] = useState<CurriculumFramework>('CAPS');
  const [selectedTopic, setSelectedTopic] = useState<string>('');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [selectedQuestionTypes, setSelectedQuestionTypes] = useState<QuestionType[]>(['MultipleChoice']);
  const [selectedCognitiveLevels, setSelectedCognitiveLevels] = useState<CognitiveLevel[]>(['Understand']);
  const [includeExplanation, setIncludeExplanation] = useState<boolean>(true);
  const [includeRealWorldContext, setIncludeRealWorldContext] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedTest, setGeneratedTest] = useState<any>(null);
  const [availableStandards, setAvailableStandards] = useState<(CAPSCurriculum | InternationalCurriculum)[]>([]);

  // Available subjects and grades
  const subjects = ['Mathematics', 'Natural Sciences', 'Languages', 'Social Sciences', 'Life Orientation'];
  const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const curricula: CurriculumFramework[] = ['CAPS', 'Cambridge', 'IB', 'CommonCore', 'IGCSE', 'A-Levels'];
  const questionTypes: QuestionType[] = ['MultipleChoice', 'TrueFalse', 'ShortAnswer', 'Essay', 'Practical', 'CaseStudy', 'ProblemSolving'];
  const cognitiveLevels: CognitiveLevel[] = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];

  // Load available standards when subject and grade change
  useEffect(() => {
    if (selectedSubject && selectedGrade) {
      const standards = curriculumStandardsAPI.getBySubjectAndGrade(selectedSubject, selectedGrade);
      setAvailableStandards(standards);
      
      // Auto-select first topic if available
      if (standards.length > 0 && !selectedTopic) {
        setSelectedTopic(standards[0].topic);
      }
    }
  }, [selectedSubject, selectedGrade, selectedTopic]);

  // Generate AI-powered test
  const generateTest = async () => {
    if (!selectedSubject || !selectedGrade || !selectedTopic) {
      alert('Please select subject, grade, and topic');
      return;
    }

    setIsGenerating(true);

    try {
      const request: AIQuestionRequest = {
        subject: selectedSubject,
        topic: selectedTopic,
        grade: selectedGrade,
        curriculum: selectedCurriculum,
        questionCount,
        difficulty,
        questionTypes: selectedQuestionTypes,
        cognitiveLevels: selectedCognitiveLevels,
        standards: [],
        includeExplanation,
        includeRealWorldContext
      };

      // Create test using the enhanced AI system
      const test = await aiTestingSystem.createTestFromStandards(
        user?.userId || '',
        institution?.id || '',
        request
      );

      setGeneratedTest(test);
    } catch (error) {
      console.error('Error generating test:', error);
      alert('Failed to generate test. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="flex items-center justify-center mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mr-4">
            <BrainIcon className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Enhanced Study Zone</h1>
            <p className="text-lg text-gray-600">AI-Powered Learning with Curriculum Standards</p>
          </div>
        </div>
        <p className="text-gray-600 max-w-3xl mx-auto">
          Generate personalized study materials aligned with national and international curriculum standards. 
          Create AI-powered tests, practice questions, and learning resources tailored to your needs.
        </p>
      </div>

      <Tabs defaultValue="generator" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="generator">Test Generator</TabsTrigger>
          <TabsTrigger value="standards">Curriculum Standards</TabsTrigger>
          <TabsTrigger value="progress">Learning Progress</TabsTrigger>
          <TabsTrigger value="resources">Study Resources</TabsTrigger>
        </TabsList>

        {/* Test Generator Tab */}
        <TabsContent value="generator" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ZapIcon className="w-5 h-5 mr-2 text-blue-600" />
                AI-Powered Test Generator
              </CardTitle>
              <CardDescription>
                Create customized tests aligned with curriculum standards and learning objectives
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Settings */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Select value={selectedSubject} onValueChange={setSelectedSubject}>
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

                <div className="space-y-2">
                  <Label htmlFor="grade">Grade</Label>
                  <Select value={selectedGrade} onValueChange={setSelectedGrade}>
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

                <div className="space-y-2">
                  <Label htmlFor="curriculum">Curriculum Framework</Label>
                  <Select value={selectedCurriculum} onValueChange={(value: CurriculumFramework) => setSelectedCurriculum(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {curricula.map(curriculum => (
                        <SelectItem key={curriculum} value={curriculum}>
                          {curriculum}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select topic" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableStandards.map(standard => (
                        <SelectItem key={standard.id} value={standard.topic}>
                          {standard.topic}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="questionCount">Number of Questions</Label>
                  <Input
                    type="number"
                    min="1"
                    max="50"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(parseInt(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Difficulty Level</Label>
                  <Select value={difficulty} onValueChange={(value: 'Easy' | 'Medium' | 'Hard') => setDifficulty(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Easy">Easy</SelectItem>
                      <SelectItem value="Medium">Medium</SelectItem>
                      <SelectItem value="Hard">Hard</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Generate Button */}
              <div className="flex justify-center">
                <Button
                  onClick={generateTest}
                  disabled={isGenerating || !selectedSubject || !selectedGrade || !selectedTopic}
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {isGenerating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Generating Test...
                    </>
                  ) : (
                    <>
                      <BrainIcon className="w-5 h-5 mr-2" />
                      Generate AI-Powered Test
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
                <CardTitle className="flex items-center text-green-600">
                  <AwardIcon className="w-5 h-5 mr-2" />
                  Test Generated Successfully!
                </CardTitle>
                <CardDescription>
                  Your AI-powered test has been created and is ready for use
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{generatedTest.questions.length}</div>
                    <div className="text-sm text-blue-600">Questions</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{generatedTest.totalMarks}</div>
                    <div className="text-sm text-green-600">Total Marks</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{generatedTest.duration}</div>
                    <div className="text-sm text-purple-600">Minutes</div>
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold mb-2">Test Details:</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div><strong>Subject:</strong> {generatedTest.subject}</div>
                    <div><strong>Topic:</strong> {generatedTest.topic}</div>
                    <div><strong>Grade:</strong> {generatedTest.grade}</div>
                    <div><strong>Curriculum:</strong> {generatedTest.curriculum}</div>
                    <div><strong>Difficulty:</strong> {generatedTest.difficulty}</div>
                    <div><strong>Standards:</strong> {generatedTest.standards.length}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Curriculum Standards Tab */}
        <TabsContent value="standards" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <GlobeIcon className="w-5 h-5 mr-2 text-green-600" />
                Curriculum Standards Explorer
              </CardTitle>
              <CardDescription>
                Explore learning objectives and assessment criteria for different curricula
              </CardDescription>
            </CardHeader>
            <CardContent>
              {availableStandards.length > 0 ? (
                <div className="space-y-4">
                  {availableStandards.map(standard => (
                    <div key={standard.id} className="p-4 border rounded-lg">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-lg">{standard.topic}</h4>
                          <p className="text-sm text-gray-600">
                            {standard.subject} - Grade {('grade' in standard ? standard.grade : standard.gradeEquivalent)} 
                            {standard.framework && ` (${standard.framework})`}
                          </p>
                        </div>
                        <Badge variant="outline">{'framework' in standard ? standard.framework : 'CAPS'}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h5 className="font-medium mb-2">Learning Objectives:</h5>
                          <ul className="text-sm space-y-1">
                            {('learningOutcomes' in standard ? standard.learningOutcomes : standard.learningObjectives || []).slice(0, 3).map((obj, index) => (
                              <li key={index} className="flex items-start">
                                <span className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                {obj}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h5 className="font-medium mb-2">Assessment Criteria:</h5>
                          <ul className="text-sm space-y-1">
                            {('assessmentStandards' in standard ? standard.assessmentStandards : standard.assessmentCriteria).slice(0, 3).map((criteria, index) => (
                              <li key={index} className="flex items-start">
                                <span className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                {criteria}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <BookOpenIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>Select a subject and grade to view available curriculum standards</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Learning Progress Tab */}
        <TabsContent value="progress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUpIcon className="w-5 h-4 mr-2 text-orange-600" />
                Learning Progress Dashboard
              </CardTitle>
              <CardDescription>
                Track your progress across different subjects and curriculum standards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Subject Progress */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Subject Progress</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Mathematics</span>
                        <span>75%</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Natural Sciences</span>
                        <span>60%</span>
                      </div>
                      <Progress value={60} className="h-2" />
                    </div>
                    <div>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Languages</span>
                        <span>85%</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                  </div>
                </div>

                {/* Standards Achievement */}
                <div className="space-y-4">
                  <h4 className="font-semibold">Standards Achievement</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">12</div>
                      <div className="text-xs text-blue-600">Standards Met</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">8</div>
                      <div className="text-xs text-green-600">In Progress</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600">5</div>
                      <div className="text-xs text-orange-600">Need Review</div>
                    </div>
                    <div className="text-center p-3 bg-purple-50 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600">3</div>
                      <div className="text-xs text-purple-600">Advanced</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Study Resources Tab */}
        <TabsContent value="resources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <LightbulbIcon className="w-5 h-5 mr-2 text-yellow-600" />
                Study Resources & Tools
              </CardTitle>
              <CardDescription>
                Access learning materials, practice exercises, and study aids
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto py-6 flex flex-col items-center">
                  <BookOpenIcon className="w-8 h-8 mb-2 text-blue-600" />
                  <span className="font-medium">Practice Tests</span>
                  <span className="text-sm text-gray-500">AI-generated questions</span>
                </Button>
                
                <Button variant="outline" className="h-auto py-6 flex flex-col items-center">
                  <TargetIcon className="w-8 h-8 mb-2 text-green-600" />
                  <span className="font-medium">Standards Tracker</span>
                  <span className="text-sm text-gray-500">Monitor progress</span>
                </Button>
                
                <Button variant="outline" className="h-auto py-6 flex flex-col items-center">
                  <TrendingUpIcon className="w-8 h-8 mb-2 text-purple-600" />
                  <span className="font-medium">Performance Analytics</span>
                  <span className="text-sm text-gray-500">Detailed insights</span>
                </Button>
                
                <Button variant="outline" className="h-auto py-6 flex flex-col items-center">
                  <UsersIcon className="w-8 h-8 mb-2 text-orange-600" />
                  <span className="font-medium">Study Groups</span>
                  <span className="text-sm text-gray-500">Collaborate with peers</span>
                </Button>
                
                <Button variant="outline" className="h-auto py-6 flex flex-col items-center">
                  <GraduationCapIcon className="w-8 h-8 mb-2 text-red-600" />
                  <span className="font-medium">Tutorial Videos</span>
                  <span className="text-sm text-gray-500">Visual learning</span>
                </Button>
                
                <Button variant="outline" className="h-auto py-6 flex flex-col items-center">
                  <ZapIcon className="w-8 h-8 mb-2 text-yellow-600" />
                  <span className="font-medium">Quick Quizzes</span>
                  <span className="text-sm text-gray-500">5-minute assessments</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


