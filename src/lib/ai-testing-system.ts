import { v4 as uuidv4 } from 'uuid';
import { 
  AITest, 
  Question, 
  TestSession, 
  TestMessage, 
  TestResult, 
  QuestionType 
} from './types';

// LocalStorage keys
const STORAGE_KEYS = {
  AI_TESTS: 'psctech_ai_tests',
  TEST_SESSIONS: 'psctech_test_sessions',
  TEST_RESULTS: 'psctech_test_results'
};

// Generic function to get data from localStorage
function getFromStorage<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

// Generic function to save data to localStorage
function saveToStorage<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Create stores for AI testing system
export const aiTestStore = {
  getAll: (): AITest[] => getFromStorage<AITest>(STORAGE_KEYS.AI_TESTS),
  
  getById: (id: string): AITest | undefined => {
    return getFromStorage<AITest>(STORAGE_KEYS.AI_TESTS).find(test => test.testId === id);
  },
  
  getByField: <K extends keyof AITest>(field: K, value: AITest[K]): AITest[] => {
    return getFromStorage<AITest>(STORAGE_KEYS.AI_TESTS).filter(test => test[field] === value);
  },
  
  create: (test: Omit<AITest, 'testId'>): AITest => {
    const tests = getFromStorage<AITest>(STORAGE_KEYS.AI_TESTS);
    const newTest = {
      ...test,
      testId: uuidv4()
    } as AITest;
    tests.push(newTest);
    saveToStorage(STORAGE_KEYS.AI_TESTS, tests);
    return newTest;
  },
  
  update: (test: AITest): void => {
    const tests = getFromStorage<AITest>(STORAGE_KEYS.AI_TESTS);
    const index = tests.findIndex(t => t.testId === test.testId);
    if (index !== -1) {
      tests[index] = test;
      saveToStorage(STORAGE_KEYS.AI_TESTS, tests);
    }
  },
  
  delete: (id: string): void => {
    const tests = getFromStorage<AITest>(STORAGE_KEYS.AI_TESTS);
    saveToStorage(
      STORAGE_KEYS.AI_TESTS,
      tests.filter(t => t.testId !== id)
    );
  }
};

export const testSessionStore = {
  getAll: (): TestSession[] => getFromStorage<TestSession>(STORAGE_KEYS.TEST_SESSIONS),
  
  getById: (id: string): TestSession | undefined => {
    return getFromStorage<TestSession>(STORAGE_KEYS.TEST_SESSIONS).find(session => session.sessionId === id);
  },
  
  getByField: <K extends keyof TestSession>(field: K, value: TestSession[K]): TestSession[] => {
    return getFromStorage<TestSession>(STORAGE_KEYS.TEST_SESSIONS).filter(session => session[field] === value);
  },
  
  create: (session: Omit<TestSession, 'sessionId'>): TestSession => {
    const sessions = getFromStorage<TestSession>(STORAGE_KEYS.TEST_SESSIONS);
    const newSession = {
      ...session,
      sessionId: uuidv4()
    } as TestSession;
    sessions.push(newSession);
    saveToStorage(STORAGE_KEYS.TEST_SESSIONS, sessions);
    return newSession;
  },
  
  update: (session: TestSession): void => {
    const sessions = getFromStorage<TestSession>(STORAGE_KEYS.TEST_SESSIONS);
    const index = sessions.findIndex(s => s.sessionId === session.sessionId);
    if (index !== -1) {
      sessions[index] = session;
      saveToStorage(STORAGE_KEYS.TEST_SESSIONS, sessions);
    }
  },
  
  delete: (id: string): void => {
    const sessions = getFromStorage<TestSession>(STORAGE_KEYS.TEST_SESSIONS);
    saveToStorage(
      STORAGE_KEYS.TEST_SESSIONS,
      sessions.filter(s => s.sessionId !== id)
    );
  }
};

export const testResultStore = {
  getAll: (): TestResult[] => getFromStorage<TestResult>(STORAGE_KEYS.TEST_RESULTS),
  
  getById: (id: string): TestResult | undefined => {
    return getFromStorage<TestResult>(STORAGE_KEYS.TEST_RESULTS).find(result => result.resultId === id);
  },
  
  getByField: <K extends keyof TestResult>(field: K, value: TestResult[K]): TestResult[] => {
    return getFromStorage<TestResult>(STORAGE_KEYS.TEST_RESULTS).filter(result => result[field] === value);
  },
  
  create: (result: Omit<TestResult, 'resultId'>): TestResult => {
    const results = getFromStorage<TestResult>(STORAGE_KEYS.TEST_RESULTS);
    const newResult = {
      ...result,
      resultId: uuidv4()
    } as TestResult;
    results.push(newResult);
    saveToStorage(STORAGE_KEYS.TEST_RESULTS, results);
    return newResult;
  },
  
  update: (result: TestResult): void => {
    const results = getFromStorage<TestResult>(STORAGE_KEYS.TEST_RESULTS);
    const index = results.findIndex(r => r.resultId === result.resultId);
    if (index !== -1) {
      results[index] = result;
      saveToStorage(STORAGE_KEYS.TEST_RESULTS, results);
    }
  },
  
  delete: (id: string): void => {
    const results = getFromStorage<TestResult>(STORAGE_KEYS.TEST_RESULTS);
    saveToStorage(
      STORAGE_KEYS.TEST_RESULTS,
      results.filter(r => r.resultId !== id)
    );
  }
};

// AI Testing System Functions
export const aiTestingSystem = {
  // Create a new test with AI-generated questions
  createTest: (
    teacherId: string,
    institutionId: string,
    subject: string,
    topic: string,
    grade: number,
    className: string,
    duration: number,
    questionCount: number = 10
  ): AITest => {
    // In a real system, we would integrate with an actual AI model
    // For this demo, we'll create some sample questions based on the topic
    
    // Helper to generate a unique ID
    const generateId = () => uuidv4();
    
    // Sample question templates by subject
    const questionTemplates: Record<string, Question[]> = {
      Mathematics: [
        {
          questionId: generateId(),
          content: `What is the result of 15 × 7?`,
          type: 'MultipleChoice',
          options: ['95', '105', '115', '125'],
          correctAnswer: '105',
          explanation: '15 × 7 = 105',
          difficulty: 'Easy'
        },
        {
          questionId: generateId(),
          content: `Solve for x: 2x + 5 = 15`,
          type: 'MultipleChoice',
          options: ['3', '5', '7', '10'],
          correctAnswer: '5',
          explanation: '2x + 5 = 15 → 2x = 10 → x = 5',
          difficulty: 'Easy'
        },
        {
          questionId: generateId(),
          content: `If a rectangle has a length of 12 cm and a width of 8 cm, what is its area?`,
          type: 'MultipleChoice',
          options: ['20 cm²', '40 cm²', '96 cm²', '120 cm²'],
          correctAnswer: '96 cm²',
          explanation: 'Area = length × width = 12 × 8 = 96 cm²',
          difficulty: 'Easy'
        },
        {
          questionId: generateId(),
          content: `What is the square root of 144?`,
          type: 'MultipleChoice',
          options: ['10', '12', '14', '16'],
          correctAnswer: '12',
          explanation: '12 × 12 = 144, so √144 = 12',
          difficulty: 'Medium'
        },
        {
          questionId: generateId(),
          content: `If 3x - 7 = 14, what is the value of x?`,
          type: 'ShortAnswer',
          correctAnswer: '7',
          explanation: '3x - 7 = 14 → 3x = 21 → x = 7',
          difficulty: 'Medium'
        },
        {
          questionId: generateId(),
          content: `The sum of the angles in a triangle is 180 degrees.`,
          type: 'TrueFalse',
          correctAnswer: 'True',
          explanation: 'This is a fundamental property of triangles in Euclidean geometry.',
          difficulty: 'Easy'
        }
      ],
      Science: [
        {
          questionId: generateId(),
          content: `What is the chemical symbol for water?`,
          type: 'MultipleChoice',
          options: ['O2', 'CO2', 'H2O', 'N2'],
          correctAnswer: 'H2O',
          explanation: 'Water consists of two hydrogen atoms and one oxygen atom, hence H2O.',
          difficulty: 'Easy'
        },
        {
          questionId: generateId(),
          content: `Which of the following is NOT a renewable energy source?`,
          type: 'MultipleChoice',
          options: ['Solar', 'Wind', 'Coal', 'Hydroelectric'],
          correctAnswer: 'Coal',
          explanation: 'Coal is a fossil fuel and is not renewable within human timeframes.',
          difficulty: 'Medium'
        },
        {
          questionId: generateId(),
          content: `What is the process by which plants make their own food using sunlight?`,
          type: 'ShortAnswer',
          correctAnswer: 'Photosynthesis',
          explanation: 'Photosynthesis is the process by which plants convert light energy to chemical energy.',
          difficulty: 'Easy'
        },
        {
          questionId: generateId(),
          content: `The Earth's closest star is the Sun.`,
          type: 'TrueFalse',
          correctAnswer: 'True',
          explanation: 'The Sun is the closest star to Earth, approximately 93 million miles away.',
          difficulty: 'Easy'
        }
      ],
      History: [
        {
          questionId: generateId(),
          content: `Who was the first President of South Africa after apartheid?`,
          type: 'MultipleChoice',
          options: ['Thabo Mbeki', 'Nelson Mandela', 'F.W. de Klerk', 'Jacob Zuma'],
          correctAnswer: 'Nelson Mandela',
          explanation: 'Nelson Mandela became the first Black president of South Africa in 1994.',
          difficulty: 'Easy'
        },
        {
          questionId: generateId(),
          content: `In which year did South Africa host the FIFA World Cup?`,
          type: 'MultipleChoice',
          options: ['2006', '2008', '2010', '2014'],
          correctAnswer: '2010',
          explanation: 'South Africa hosted the FIFA World Cup in 2010, the first African nation to do so.',
          difficulty: 'Medium'
        },
        {
          questionId: generateId(),
          content: `The Berlin Wall fell in 1989.`,
          type: 'TrueFalse',
          correctAnswer: 'True',
          explanation: 'The Berlin Wall, which separated East and West Berlin, fell on November 9, 1989.',
          difficulty: 'Medium'
        }
      ],
      English: [
        {
          questionId: generateId(),
          content: `What is the past tense of the verb "to go"?`,
          type: 'MultipleChoice',
          options: ['Goed', 'Went', 'Gone', 'Going'],
          correctAnswer: 'Went',
          explanation: '"Went" is the past tense of "go", while "gone" is the past participle.',
          difficulty: 'Easy'
        },
        {
          questionId: generateId(),
          content: `What type of word is "quickly" in the sentence "He ran quickly"?`,
          type: 'MultipleChoice',
          options: ['Noun', 'Verb', 'Adjective', 'Adverb'],
          correctAnswer: 'Adverb',
          explanation: 'An adverb modifies a verb, adjective, or another adverb. Here, "quickly" modifies the verb "ran".',
          difficulty: 'Medium'
        },
        {
          questionId: generateId(),
          content: `Which of these is a simile?`,
          type: 'MultipleChoice',
          options: [
            'The tree is tall.',
            'The sun gives light.',
            'She is as fast as a cheetah.',
            'The sky darkened.'
          ],
          correctAnswer: 'She is as fast as a cheetah.',
          explanation: 'A simile is a figure of speech that compares two things using "like" or "as".',
          difficulty: 'Medium'
        }
      ]
    };
    
    // Select questions based on the subject
    const availableQuestions = questionTemplates[subject] || questionTemplates['Mathematics'];
    
    // Make copies of the questions to avoid reference issues
    const selectedQuestions: Question[] = [];
    const maxQuestions = Math.min(questionCount, availableQuestions.length);
    
    // Create a shuffled copy of the available questions
    const shuffledQuestions = [...availableQuestions].sort(() => 0.5 - Math.random());
    
    for (let i = 0; i < maxQuestions; i++) {
      // Create a deep copy of the question
      const question = { ...shuffledQuestions[i] };
      question.questionId = generateId(); // Generate a new ID
      selectedQuestions.push(question);
    }
    
    // Create the test
    const newTest: AITest = {
      testId: generateId(),
      teacherId,
      institutionId,
      subject,
      topic,
      grade,
      class: className,
      questions: selectedQuestions,
      createdAt: new Date().toISOString(),
      duration,
      status: 'Pending'
    };
    
    // Save the test to storage
    aiTestStore.create(newTest);
    
    return newTest;
  },
  
  // Start a new test session
  startTestSession: (testId: string): TestSession | null => {
    const test = aiTestStore.getById(testId);
    if (!test) return null;
    
    // Create a new session
    const newSession: TestSession = {
      sessionId: uuidv4(),
      testId,
      startedAt: new Date().toISOString(),
      participants: [],
      isActive: true,
      messages: [{
        messageId: uuidv4(),
        senderId: 'AI',
        senderName: 'AI Assistant',
        content: `Welcome to the "${test.subject}: ${test.topic}" test! This test has ${test.questions.length} questions and should take about ${test.duration} minutes to complete. When you're ready to begin, the AI will present each question. Good luck!`,
        timestamp: new Date().toISOString(),
        type: 'Info'
      }]
    };
    
    // Update test status
    test.status = 'Active';
    aiTestStore.update(test);
    
    // Save the session
    testSessionStore.create(newSession);
    
    return newSession;
  },
  
  // Join a test session (for learners)
  joinTestSession: (sessionId: string, learnerId: string, learnerName: string): boolean => {
    const session = testSessionStore.getById(sessionId);
    if (!session || !session.isActive) return false;
    
    // Add the learner to participants if not already present
    if (!session.participants.includes(learnerId)) {
      session.participants.push(learnerId);
      
      // Add a welcome message
      session.messages.push({
        messageId: uuidv4(),
        senderId: 'AI',
        senderName: 'AI Assistant',
        content: `${learnerName} has joined the test session.`,
        timestamp: new Date().toISOString(),
        type: 'Info'
      });
      
      testSessionStore.update(session);
    }
    
    return true;
  },
  
  // Post a message in a test session
  postMessage: (sessionId: string, message: Omit<TestMessage, 'messageId'>): TestMessage | null => {
    const session = testSessionStore.getById(sessionId);
    if (!session || !session.isActive) return null;
    
    const newMessage: TestMessage = {
      ...message,
      messageId: uuidv4()
    };
    
    session.messages.push(newMessage);
    testSessionStore.update(session);
    
    return newMessage;
  },
  
  // Submit an answer in a test session
  submitAnswer: (
    sessionId: string, 
    learnerId: string, 
    questionId: string, 
    answer: string,
    learnerName: string
  ): { message: TestMessage; isCorrect: boolean } | null => {
    const session = testSessionStore.getById(sessionId);
    if (!session || !session.isActive) return null;
    
    // Find the test and the question
    const test = aiTestStore.getById(session.testId);
    if (!test) return null;
    
    const question = test.questions.find(q => q.questionId === questionId);
    if (!question) return null;
    
    // Check if the answer is correct
    const isCorrect = question.correctAnswer.toLowerCase() === answer.toLowerCase();
    
    // Create a message for the answer
    const newMessage: TestMessage = {
      messageId: uuidv4(),
      senderId: learnerId,
      senderName: learnerName,
      content: answer,
      timestamp: new Date().toISOString(),
      type: 'Answer',
      questionId,
      isCorrect
    };
    
    // Add the answer message
    session.messages.push(newMessage);
    
    // Add the AI response message
    const aiResponseMessage: TestMessage = {
      messageId: uuidv4(),
      senderId: 'AI',
      senderName: 'AI Assistant',
      content: isCorrect 
        ? `Correct! ${question.explanation || ''}` 
        : `Incorrect. The correct answer is: ${question.correctAnswer}. ${question.explanation || ''}`,
      timestamp: new Date(Date.now() + 500).toISOString(), // Slightly later timestamp
      type: 'Info'
    };
    
    session.messages.push(aiResponseMessage);
    testSessionStore.update(session);
    
    return { message: newMessage, isCorrect };
  },
  
  // End a test session and calculate results
  endTestSession: (sessionId: string): TestResult[] => {
    const session = testSessionStore.getById(sessionId);
    if (!session) return [];
    
    const test = aiTestStore.getById(session.testId);
    if (!test) return [];
    
    // Update session state
    session.isActive = false;
    session.endedAt = new Date().toISOString();
    
    // Update test status
    test.status = 'Completed';
    aiTestStore.update(test);
    
    // Calculate results for each participant
    const results: TestResult[] = [];
    
    session.participants.forEach(learnerId => {
      const userMessages = session.messages.filter(m => 
        m.senderId === learnerId && 
        m.type === 'Answer' && 
        m.questionId !== undefined
      );
      
      const answeredQuestions = userMessages.length;
      const correctAnswers = userMessages.filter(m => m.isCorrect === true).length;
      const score = test.questions.length > 0 
        ? Math.round((correctAnswers / test.questions.length) * 100) 
        : 0;
      
      const result: TestResult = {
        resultId: uuidv4(),
        sessionId,
        learnerId,
        testId: test.testId,
        score,
        totalQuestions: test.questions.length,
        answeredQuestions,
        correctAnswers,
        completedAt: new Date().toISOString()
      };
      
      results.push(result);
      testResultStore.create(result);
    });
    
    // Sort results by score (highest first)
    results.sort((a, b) => b.score - a.score);
    
    return results;
  },
  
  // Add results message to session
  addResultsMessage: (sessionId: string, results: TestResult[]): TestMessage | null => {
    const session = testSessionStore.getById(sessionId);
    if (!session) return null;
    
    const test = aiTestStore.getById(session.testId);
    if (!test) return null;
    
    // Create the message content with results
    let resultsMessage = `Test completed. Here are the results:\n\n`;
    
    // Add top performers
    if (results.length > 0) {
      resultsMessage += `Top Performers:\n`;
      const topResults = results.slice(0, Math.min(10, results.length));
      
      topResults.forEach((result, index) => {
        // Find the learner's name from the messages
        const learnerMessages = session.messages.filter(m => m.senderId === result.learnerId);
        const learnerName = learnerMessages.length > 0 ? learnerMessages[0].senderName : `Learner ${index + 1}`;
        
        resultsMessage += `${index + 1}. ${learnerName}: ${result.score}% (${result.correctAnswers}/${result.totalQuestions})\n`;
      });
    } else {
      resultsMessage += `No participants completed the test.`;
    }
    
    // Create and add the message
    const resultsMessageObj: TestMessage = {
      messageId: uuidv4(),
      senderId: 'AI',
      senderName: 'AI Assistant',
      content: resultsMessage,
      timestamp: new Date().toISOString(),
      type: 'Result'
    };
    
    session.messages.push(resultsMessageObj);
    testSessionStore.update(session);
    
    return resultsMessageObj;
  },
  
  // Get the next question for a test session
  getNextQuestion: (sessionId: string, currentQuestionId?: string): Question | null => {
    const session = testSessionStore.getById(sessionId);
    if (!session || !session.isActive) return null;
    
    const test = aiTestStore.getById(session.testId);
    if (!test) return null;
    
    // If no current question, return the first one
    if (!currentQuestionId) {
      return test.questions[0];
    }
    
    // Find the index of the current question
    const currentIndex = test.questions.findIndex(q => q.questionId === currentQuestionId);
    if (currentIndex === -1) return null;
    
    // Return the next question if available
    if (currentIndex < test.questions.length - 1) {
      return test.questions[currentIndex + 1];
    }
    
    return null;
  },
  
  // Send the next question in a test session
  sendNextQuestion: (sessionId: string, currentQuestionId?: string): { question: Question; message: TestMessage } | null => {
    const nextQuestion = this.getNextQuestion(sessionId, currentQuestionId);
    if (!nextQuestion) return null;
    
    const session = testSessionStore.getById(sessionId);
    if (!session || !session.isActive) return null;
    
    // Format the question message
    let questionContent = `**Question:** ${nextQuestion.content}\n\n`;
    
    if (nextQuestion.type === 'MultipleChoice' && nextQuestion.options) {
      nextQuestion.options.forEach((option, index) => {
        questionContent += `${String.fromCharCode(65 + index)}. ${option}\n`;
      });
      questionContent += '\nPlease answer with the letter of your choice (A, B, C, or D).';
    } else if (nextQuestion.type === 'TrueFalse') {
      questionContent += '\nPlease answer with "True" or "False".';
    } else {
      questionContent += '\nPlease provide your answer.';
    }
    
    // Create and add the message
    const questionMessage: TestMessage = {
      messageId: uuidv4(),
      senderId: 'AI',
      senderName: 'AI Assistant',
      content: questionContent,
      timestamp: new Date().toISOString(),
      type: 'Question',
      questionId: nextQuestion.questionId
    };
    
    session.messages.push(questionMessage);
    testSessionStore.update(session);
    
    return { question: nextQuestion, message: questionMessage };
  },
  
  // Get all active tests for a specific teacher
  getActiveTestsForTeacher: (teacherId: string): AITest[] => {
    return aiTestStore.getByField('teacherId', teacherId)
      .filter(test => test.status !== 'Completed')
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  
  // Get all available test sessions for a learner
  getAvailableTestSessionsForLearner: (learnerGrade: number, institutionId: string): { test: AITest, session: TestSession }[] => {
    // Get all active sessions
    const activeSessions = testSessionStore.getAll().filter(session => session.isActive);
    
    // Get corresponding tests that match the learner's grade and institution
    const availableSessions = activeSessions.map(session => {
      const test = aiTestStore.getById(session.testId);
      if (test && test.grade === learnerGrade && test.institutionId === institutionId) {
        return { test, session };
      }
      return null;
    }).filter(item => item !== null) as { test: AITest, session: TestSession }[];
    
    return availableSessions;
  },
  
  // Get test results for a specific learner
  getTestResultsForLearner: (learnerId: string): { result: TestResult, test: AITest }[] => {
    const results = testResultStore.getByField('learnerId', learnerId);
    
    return results.map(result => {
      const test = aiTestStore.getById(result.testId);
      if (test) {
        return { result, test };
      }
      return null;
    }).filter(item => item !== null) as { result: TestResult, test: AITest }[];
  }
};

export default aiTestingSystem;