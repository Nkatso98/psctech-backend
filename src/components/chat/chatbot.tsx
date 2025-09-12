import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, 
  X, 
  Minimize2, 
  Maximize2, 
  Send, 
  Bot, 
  User,
  Lightbulb,
  BookOpen,
  Target,
  TrendingUp,
  Shield,
  Zap,
  Users,
  Globe
} from 'lucide-react';

export function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Array<{
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
  }>>([
    {
      id: '1',
      text: "Hello! I'm your PSC Tech AI assistant. I can help you with:\n\n• School management questions\n• System navigation help\n• Feature explanations\n• Troubleshooting\n• Best practices\n\nHow can I assist you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isTyping) return;

    const userMessage = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user' as const,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const botResponse = generateBotResponse(userMessage.text);
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      }]);
      setIsTyping(false);
    }, 1000 + Math.random() * 2000);
  };

  const generateBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase();
    // System navigation help
    if (input.includes('navigate') || input.includes('menu') || input.includes('where')) {
      return `I can help you navigate the PSC Tech system! Here are the main areas:\n\n• **Dashboard**: Overview of your school's data\n• **Students**: Manage student records and information\n• **Teachers**: Handle teacher accounts and assignments\n• **Attendance**: Track daily attendance\n• **Reports**: Generate academic and administrative reports\n• **Settings**: Configure your school's preferences\n\nWhat specific area would you like to know more about?`;
    }
    // Feature explanations
    if (input.includes('feature') || input.includes('what can') || input.includes('help')) {
      return `PSC Tech offers many powerful features:\n\n• **AI-Powered Tools**: Generate homework, tests, and study materials\n• **Real-time Tracking**: Monitor attendance, grades, and performance\n• **Communication**: Send messages and announcements\n• **Analytics**: Detailed reports and insights\n• **Multi-role Access**: Different dashboards for principals, teachers, parents, and students\n• **Mobile Ready**: Access from any device\n\nWhich feature interests you most?`;
    }
    // Troubleshooting
    if (input.includes('error') || input.includes('problem') || input.includes('issue') || input.includes('not working')) {
      return `I'm here to help with any issues! Common solutions include:\n\n• **Clear browser cache** and refresh the page\n• **Check your internet connection**\n• **Verify your login credentials**\n• **Try a different browser**\n• **Contact support** if the issue persists\n\nCan you describe the specific problem you're experiencing?`;
    }
    // School management
    if (input.includes('school') || input.includes('manage') || input.includes('admin')) {
      return `School management in PSC Tech includes:\n\n• **Student Management**: Add, edit, and track student information\n• **Teacher Management**: Handle staff accounts and assignments\n• **Class Management**: Organize classes and schedules\n• **Performance Tracking**: Monitor academic progress\n• **Communication Tools**: Keep everyone informed\n• **Reporting**: Generate comprehensive reports\n\nWhat aspect of school management do you need help with?`;
    }
    // AI tools
    if (input.includes('ai') || input.includes('artificial intelligence') || input.includes('generate')) {
      return `Our AI tools are designed to save you time:\n\n• **AI Homework Generator**: Create assignments based on topics and requirements\n• **AI Test Generator**: Generate tests with memorandums\n• **AI Study Zone**: Personalized learning recommendations\n• **Smart Analytics**: AI-powered insights and predictions\n• **Automated Reports**: Generate comprehensive reports automatically\n\nWould you like me to explain how to use any of these AI features?`;
    }
    // Default helpful response
    return `I understand you're asking about "${userInput}". Let me help you with that!\n\nPSC Tech is a comprehensive school management system that helps:\n\n• **Principals** manage their entire institution\n• **Teachers** track attendance and grades\n• **Parents** monitor their children's progress\n• **Students** access learning materials\n\nCould you be more specific about what you'd like to know? I'm here to help!`;
  };

  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (isMinimized) setIsMinimized(false);
  };

  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  if (!isOpen) {
    return (
      <Button
        onClick={toggleChat}
        className="fixed bottom-4 right-4 h-14 w-14 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transition-all duration-300 z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 w-96 h-[650px] z-50">
      {/* Glassmorphism Background */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-2xl"></div>
      
      {/* Main Chatbot Container */}
      <div className="relative h-full bg-gradient-to-br from-white/90 via-blue-50/80 to-purple-50/90 rounded-3xl border border-white/30 shadow-2xl overflow-hidden">
        {/* Header with Modern Design */}
        <div className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-4 rounded-t-3xl">
          {/* Animated Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-indigo-400/20 animate-pulse"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Modern Bot Icon */}
              <div className="relative">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                {/* Animated Ring */}
                <div className="absolute inset-0 w-10 h-10 border-2 border-white/30 rounded-full animate-ping"></div>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-white">PSC Tech AI</h3>
                <p className="text-xs text-blue-100">Your Smart Assistant</p>
              </div>
            </div>
            
            {/* Control Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleMinimize}
                className="text-white/80 hover:text-white hover:bg-white/20 h-9 w-9 p-0 rounded-full transition-all duration-300"
              >
                {isMinimized ? <Maximize2 className="h-4 w-4" /> : <Minimize2 className="h-4 w-4" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleChat}
                className="text-white/80 hover:text-white hover:bg-white/20 h-9 w-9 p-0 rounded-full transition-all duration-300"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Messages Area */}
            <div className="flex-1 p-4 overflow-hidden">
              <ScrollArea className="h-full pr-2">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-4 shadow-lg ${
                          message.sender === 'user'
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                            : 'bg-white/80 backdrop-blur-sm text-gray-800 border border-gray-200/50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {message.sender === 'bot' && (
                            <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <Bot className="h-3 w-3 text-white" />
                            </div>
                          )}
                          <div className="whitespace-pre-wrap text-sm leading-relaxed">
                            {message.text}
                          </div>
                          {message.sender === 'user' && (
                            <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </div>
                        <div className={`text-xs mt-3 ${
                          message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Typing Indicator */}
                  {isTyping && (
                    <div className="flex justify-start animate-in slide-in-from-bottom-2 duration-300">
                      <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-gray-200/50 shadow-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <Bot className="h-3 w-3 text-white" />
                          </div>
                          <div className="flex space-x-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                            <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>
            </div>
            
            {/* Modern Input Area */}
            <div className="p-4 bg-gradient-to-r from-gray-50/80 to-blue-50/60 backdrop-blur-sm border-t border-gray-200/50">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-700">Type your message</span>
              </div>
              
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleSendMessage(); } }}
                    placeholder="Ask me anything..."
                    className="w-full h-12 pl-4 pr-12 bg-white/80 backdrop-blur-sm border-2 border-gray-200/50 rounded-2xl focus:border-blue-400 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 text-gray-800 placeholder-gray-500"
                    disabled={isTyping}
                  />
                  {/* Send Button Overlay */}
                  <Button 
                    type="button" 
                    onClick={handleSendMessage} 
                    disabled={isTyping || !inputValue.trim()}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4 text-white" />
                  </Button>
                </div>
              </div>
              
              {/* Status Bar */}
              <div className="flex items-center justify-between mt-3 text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isTyping ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                  <span>{isTyping ? 'AI is typing...' : 'Ready to help'}</span>
                </div>
                <span className="font-mono">{messages.length} messages</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
