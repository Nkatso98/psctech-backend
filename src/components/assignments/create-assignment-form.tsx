import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  BookOpenIcon, 
  PlusIcon, 
  BrainIcon,
  CalendarIcon,
  UsersIcon,
  TargetIcon,
  ClockIcon,
  SaveIcon,
  EyeIcon,
  EyeOffIcon
} from 'lucide-react';
import { 
  Assignment, 
  AssignmentQuestion,
  Learner,
  User,
  QuestionType,
  CognitiveLevel,
  CurriculumFramework
} from '@/lib/types';
import { 
  learnerStore,
  userStore
} from '@/lib/store';
import { useAuth } from '@/lib/auth-context';
import { aiQuestionGenerator } from '@/lib/ai-question-generator';

interface CreateAssignmentFormProps {
  onSave?: (assignment: Assignment) => void;
  onCancel?: () => void;
  editAssignment?: Assignment;
}

export function CreateAssignmentForm({ 
  onSave, 
  onCancel, 
  editAssignment 
}: CreateAssignmentFormProps) {
  const { user, institution } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [learners, setLearners] = useState<Learner[]>([]);
  const [selectedLearners, setSelectedLearners] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [grade, setGrade] = useState('');
  const [curriculum, setCurriculum] = useState<CurriculumFramework>('CAPS');
  const [dueDate, setDueDate] = useState('');
  const [timeLimit, setTimeLimit] = useState<number | undefined>(undefined);
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium');
  const [cognitiveLevels, setCognitiveLevels] = useState<CognitiveLevel[]>(['Understand']);
  const [questionCount, setQuestionCount] = useState(10);
  const [questionTypes, setQuestionTypes] = useState<QuestionType[]>(['MultipleChoice']);
  const [learningObjectives, setLearningObjectives] = useState<string[]>([]);
  const [objectiveInput, setObjectiveInput] = useState('');
  const [questions, setQuestions] = useState<AssignmentQuestion[]>([]);
  const [showPreview, setShowPreview] = useState(false);

  const subjects = ['Mathematics', 'Natural Sciences', 'Languages', 'Social Sciences', 'Life Orientation'];
  const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const curricula: CurriculumFramework[] = ['CAPS', 'Cambridge', 'IB', 'CommonCore', 'IGCSE', 'A-Levels'];
  const availableQuestionTypes: QuestionType[] = ['MultipleChoice', 'TrueFalse', 'ShortAnswer', 'Essay', 'Practical', 'CaseStudy', 'ProblemSolving'];
  const availableCognitiveLevels: CognitiveLevel[] = ['Remember', 'Understand', 'Apply', 'Analyze', 'Evaluate', 'Create'];

  useEffect(() => {
    loadLearners();
    if (editAssignment) {
      loadEditData();
    }
  }, [editAssignment]);

  const loadLearners = () => {
    if (institution?.id) {
      const institutionLearners = learnerStore.getByInstitutionId(institution.id);
      setLearners(institutionLearners);
    }
  };

  const loadEditData = () => {
    if (editAssignment) {
      setTitle(editAssignment.title);
      setDescription(editAssignment.description);
      setSubject(editAssignment.subject);
      setTopic(editAssignment.topic);
      setGrade(editAssignment.grade);
      setCurriculum(editAssignment.curriculum);
      setDueDate(new Date(editAssignment.dueDate).toISOString().split('T')[0]);
      setTimeLimit(editAssignment.timeLimit);
      setDifficulty(editAssignment.difficulty);
      setCognitiveLevels(editAssignment.cognitiveLevels);
      setQuestionCount(editAssignment.questions.length);
      setQuestionTypes([...new Set(editAssignment.questions.map(q => q.questionType))]);
      setLearningObjectives(editAssignment.learningObjectives);
      setSelectedLearners(editAssignment.assignedLearners);
      setQuestions(editAssignment.questions);
    }
  };

  const addLearningObjective = () => {
    if (objectiveInput.trim() && !learningObjectives.includes(objectiveInput.trim())) {
      setLearningObjectives([...learningObjectives, objectiveInput.trim()]);
      setObjectiveInput('');
    }
  };

  const removeLearningObjective = (objective: string) => {
    setLearningObjectives(learningObjectives.filter(obj => obj !== objective));
  };

  const generateQuestions = async () => {
    if (!subject || !topic || !grade) {
      alert('Please select subject, topic, and grade before generating questions');
      return;
    }

    setIsLoading(true);

    try {
      const generatedQuestions = await aiQuestionGenerator.generateQuestions({
        subject,
        topic,
        grade,
        curriculum,
        questionCount,
        difficulty,
        availableQuestionTypes,
        availableCognitiveLevels,
        standards: [],
        includeExplanation: true,
        includeRealWorldContext: false
      });

      // Convert AI questions to assignment questions
      const assignmentQuestions: AssignmentQuestion[] = generatedQuestions.questions.map((q, index) => ({
        questionId: `q-${index + 1}`,
        questionType: q.questionType,
        content: q.content,
        options: q.options,
        correctAnswer: q.correctAnswer,
        marks: Math.ceil(100 / questionCount), // Distribute marks evenly
        explanation: q.explanation,
        cognitiveLevel: q.cognitiveLevel,
        topic: q.topic,
        learningStandard: q.standards?.[0]?.standard || undefined
      }));

      setQuestions(assignmentQuestions);
      alert(`Generated ${assignmentQuestions.length} questions successfully!`);
    } catch (error) {
      console.error('Error generating questions:', error);
      alert('Error generating questions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = (): boolean => {
    if (!title.trim()) {
      alert('Please enter an assignment title');
      return false;
    }
    if (!subject) {
      alert('Please select a subject');
      return false;
    }
    if (!topic.trim()) {
      alert('Please enter a topic');
      return false;
    }
    if (!grade) {
      alert('Please select a grade');
      return false;
    }
    if (!dueDate) {
      alert('Please set a due date');
      return false;
    }
    if (selectedLearners.length === 0) {
      alert('Please select at least one learner');
      return false;
    }
    if (questions.length === 0) {
      alert('Please generate or add questions first');
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm() || !user || !institution) return;

    setIsLoading(true);

    try {
      const assignmentData: Omit<Assignment, 'assignmentId' | 'createdAt' | 'updatedAt'> = {
        title: title.trim(),
        description: description.trim(),
        subject,
        topic: topic.trim(),
        grade,
        curriculum,
        teacherId: user.userId,
        institutionId: institution.id,
        dueDate: new Date(dueDate),
        totalMarks: questions.reduce((sum, q) => sum + q.marks, 0),
        timeLimit,
        isActive: true,
        isPublished: false,
        assignedLearners: selectedLearners,
        questions,
        learningObjectives,
        difficulty,
        cognitiveLevels
      };

      if (onSave) {
        // Create a temporary assignment object for the callback
        const tempAssignment: Assignment = {
          ...assignmentData,
          assignmentId: editAssignment?.assignmentId || 'temp-id',
          createdAt: editAssignment?.createdAt || new Date(),
          updatedAt: new Date()
        };
        onSave(tempAssignment);
      }
    } catch (error) {
      console.error('Error saving assignment:', error);
      alert('Error saving assignment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const getSelectedLearnerNames = (): string[] => {
    return selectedLearners.map(learnerId => {
      const learner = learners.find(l => l.learnerId === learnerId);
      const learnerUser = learner ? userStore.getById(learner.userId) : null;
      return learnerUser ? `${learnerUser.firstName} ${learnerUser.lastName}` : 'Unknown';
    });
  };

  const toggleLearnerSelection = (learnerId: string) => {
    if (selectedLearners.includes(learnerId)) {
      setSelectedLearners(selectedLearners.filter(id => id !== learnerId));
    } else {
      setSelectedLearners([...selectedLearners, learnerId]);
    }
  };

  const toggleCognitiveLevel = (level: CognitiveLevel) => {
    if (cognitiveLevels.includes(level)) {
      setCognitiveLevels(cognitiveLevels.filter(l => l !== level));
    } else {
      setCognitiveLevels([...cognitiveLevels, level]);
    }
  };

  const toggleQuestionType = (type: QuestionType) => {
    if (questionTypes.includes(type)) {
      setQuestionTypes(questionTypes.filter(t => t !== type));
    } else {
      setQuestionTypes([...questionTypes, type]);
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <BookOpenIcon className="h-5 w-5" />
          <span>{editAssignment ? 'Edit' : 'Create'} Assignment</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Assignment Title *</Label>
            <Input
              id="title"
              placeholder="e.g., Algebra Fundamentals Quiz"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Select value={subject} onValueChange={setSubject}>
              <SelectTrigger>
                <SelectValue placeholder="Choose subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subj) => (
                  <SelectItem key={subj} value={subj}>{subj}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="topic">Topic *</Label>
            <Input
              id="topic"
              placeholder="e.g., Linear Equations"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="grade">Grade *</Label>
            <Select value={grade} onValueChange={setGrade}>
              <SelectTrigger>
                <SelectValue placeholder="Choose grade" />
              </SelectTrigger>
              <SelectContent>
                {grades.map((g) => (
                  <SelectItem key={g} value={g}>Grade {g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="curriculum">Curriculum</Label>
            <Select value={curriculum} onValueChange={(value: CurriculumFramework) => setCurriculum(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {curricula.map((curr) => (
                  <SelectItem key={curr} value={curr}>{curr}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Provide a detailed description of the assignment..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </div>

        {/* Due Date and Time Limit */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date *</Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="timeLimit">Time Limit (minutes, optional)</Label>
            <Input
              id="timeLimit"
              type="number"
              placeholder="e.g., 60"
              value={timeLimit || ''}
              onChange={(e) => setTimeLimit(e.target.value ? parseInt(e.target.value) : undefined)}
            />
          </div>
        </div>

        {/* Learning Objectives */}
        <div className="space-y-2">
          <Label>Learning Objectives</Label>
          <div className="flex space-x-2">
            <Input
              placeholder="Add a learning objective..."
              value={objectiveInput}
              onChange={(e) => setObjectiveInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addLearningObjective()}
            />
            <Button type="button" onClick={addLearningObjective} variant="outline">
              Add
            </Button>
          </div>
          {learningObjectives.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {learningObjectives.map((objective, index) => (
                <Badge key={index} variant="secondary" className="flex items-center space-x-1">
                  <span>{objective}</span>
                  <button
                    onClick={() => removeLearningObjective(objective)}
                    className="ml-1 hover:text-red-600"
                  >
                    ×
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Question Generation Settings */}
        <div className="border rounded-lg p-4 bg-muted/20">
          <h4 className="font-medium mb-3">AI Question Generation Settings</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="questionCount">Number of Questions</Label>
              <Input
                id="questionCount"
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

          <div className="space-y-2 mt-4">
            <Label>Question Types</Label>
            <div className="flex flex-wrap gap-2">
              {questionTypes.map((type) => (
                <Badge
                  key={type}
                  variant={questionTypes.includes(type) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleQuestionType(type)}
                >
                  {type}
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-2 mt-4">
            <Label>Cognitive Levels</Label>
            <div className="flex flex-wrap gap-2">
              {cognitiveLevels.map((level) => (
                <Badge
                  key={level}
                  variant={cognitiveLevels.includes(level) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => toggleCognitiveLevel(level)}
                >
                  {level}
                </Badge>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <Button 
              onClick={generateQuestions} 
              disabled={isLoading || !subject || !topic || !grade}
              className="w-full"
            >
              <BrainIcon className="h-4 w-4 mr-2" />
              {isLoading ? 'Generating Questions...' : 'Generate Questions with AI'}
            </Button>
          </div>
        </div>

        {/* Learner Assignment */}
        <div className="space-y-2">
          <Label>Assign to Learners *</Label>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto border rounded-lg p-3">
            {learners.map((learner) => {
              const learnerUser = userStore.getById(learner.userId);
              return (
                <div key={learner.learnerId} className="flex items-center space-x-2">
                  <Checkbox
                    id={learner.learnerId}
                    checked={selectedLearners.includes(learner.learnerId)}
                    onCheckedChange={() => toggleLearnerSelection(learner.learnerId)}
                  />
                  <Label htmlFor={learner.learnerId} className="text-sm cursor-pointer">
                    {learnerUser ? `${learnerUser.firstName} ${learnerUser.lastName}` : 'Unknown'} - Grade {learner.grade}
                  </Label>
                </div>
              );
            })}
          </div>
          {selectedLearners.length > 0 && (
            <p className="text-sm text-muted-foreground">
              Selected: {getSelectedLearnerNames().join(', ')}
            </p>
          )}
        </div>

        {/* Questions Preview */}
        {questions.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Generated Questions ({questions.length})</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPreview(!showPreview)}
              >
                {showPreview ? <EyeOffIcon className="h-4 w-4 mr-2" /> : <EyeIcon className="h-4 w-4 mr-2" />}
                {showPreview ? 'Hide' : 'Show'} Preview
              </Button>
            </div>
            
            {showPreview && (
              <div className="space-y-3 max-h-96 overflow-y-auto border rounded-lg p-4">
                {questions.map((question, index) => (
                  <div key={question.questionId} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">Question {index + 1}</Badge>
                      <Badge variant="secondary">{question.questionType}</Badge>
                      <Badge variant="outline">{question.marks} marks</Badge>
                    </div>
                    <p className="text-sm mb-2">{question.content}</p>
                    {question.options && (
                      <div className="text-xs text-muted-foreground">
                        Options: {question.options.join(', ')}
                      </div>
                    )}
                    <div className="text-xs text-muted-foreground mt-1">
                      Cognitive Level: {question.cognitiveLevel}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          )}
          <Button 
            onClick={handleSave} 
            disabled={isLoading || questions.length === 0}
            className="min-w-[120px]"
          >
            {isLoading ? (
              'Saving...'
            ) : (
              <>
                <SaveIcon className="h-4 w-4 mr-2" />
                {editAssignment ? 'Update' : 'Save'} Assignment
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}


