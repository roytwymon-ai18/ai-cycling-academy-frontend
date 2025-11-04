import { useState, useEffect, useRef } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Coach({ user }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState(null);
  const [onboardingStatus, setOnboardingStatus] = useState({
    completed: false,
    step: 0,
    totalSteps: 12
  });
  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    "What should I focus on in my next training session?",
    "How can I improve my FTP?",
    "Am I training too hard or not enough?",
    "What's my current training load telling me?",
    "How should I structure my weekly training?"
  ];

  useEffect(() => {
    // Load client profile to check onboarding status
    loadClientProfile();
    
    // Load automatic insights when component mounts
    loadInsights();
  }, [user]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadClientProfile = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/coaching/profile`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        const profile = data.profile;
        
        setOnboardingStatus({
          completed: profile.onboarding_completed,
          step: profile.onboarding_step,
          totalSteps: 12
        });

        // If onboarding not completed, start the interview
        if (!profile.onboarding_completed) {
          const welcomeMsg = `Hi ${user?.username || 'there'}! 👋 I'm Coach Manee, your personalized AI cycling coach.

Before we dive into training plans and performance metrics, I'd love to get to know YOU as a cyclist. This will help me provide truly personalized coaching that fits your goals, style, and life.

This quick interview has 12 questions — it'll take about 5-10 minutes. Ready to start? 🚴`;
          
          setMessages([{
            role: 'assistant',
            content: welcomeMsg,
            timestamp: new Date()
          }]);

          // If step is 0, trigger first question
          if (profile.onboarding_step === 0) {
            setTimeout(() => startOnboarding(), 1000);
          }
        } else {
          // Load chat history for returning users
          loadChatHistory();
        }
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      // Default welcome message if profile load fails
      showDefaultWelcome();
    }
  };

  const startOnboarding = async () => {
    // Send empty message to trigger first question
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/coaching/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ message: 'START_ONBOARDING' })
      });

      const data = await response.json();

      if (response.ok) {
        const aiMessage = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);
        
        if (data.onboarding_step !== undefined) {
          setOnboardingStatus(prev => ({
            ...prev,
            step: data.onboarding_step,
            completed: data.onboarding_completed || false
          }));
        }
      }
    } catch (error) {
      console.error('Failed to start onboarding:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadChatHistory = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/coaching/chat/history`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.messages && data.messages.length > 0) {
          // Load last 20 messages
          const recentMessages = data.messages.slice(-20).map(msg => ({
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.created_at)
          }));
          setMessages(recentMessages);
        } else {
          showDefaultWelcome();
        }
      } else {
        showDefaultWelcome();
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
      showDefaultWelcome();
    }
  };

  const showDefaultWelcome = () => {
    const welcomeMsg = user?.training_goals 
      ? `Hi ${user.username}! 👋 I'm Coach Manee, your personalized AI cycling coach. I see your goal is: "${user.training_goals}". I've analyzed your recent rides and I'm here to help you achieve it. I remember all our conversations, so I can provide increasingly personalized guidance. What would you like to know?`
      : `Hi ${user?.username || 'there'}! 👋 I'm Coach Manee, your personalized AI cycling coach. I've analyzed your recent rides and I'm here to help you improve. I remember all our conversations to provide better coaching over time. Set your training goals in your Profile to get even more personalized advice!`;
    
    setMessages([{
      role: 'assistant',
      content: welcomeMsg,
      timestamp: new Date()
    }]);
  };

  const loadInsights = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/coaching/insights`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setInsights(data.insights);
      }
    } catch (error) {
      console.error('Failed to load insights:', error);
    }
  };

  const sendMessage = async (messageText = null) => {
    const text = messageText || inputMessage.trim();
    if (!text) return;

    // Add user message to chat
    const userMessage = {
      role: 'user',
      content: text,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/coaching/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({ message: text })
      });

      const data = await response.json();

      if (response.ok) {
        // Add AI response to chat
        const aiMessage = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, aiMessage]);

        // Update onboarding status if in progress
        if (data.onboarding_step !== undefined) {
          setOnboardingStatus({
            step: data.onboarding_step,
            completed: data.onboarding_completed || false,
            totalSteps: 12
          });
        }

        // Reload insights after onboarding completion
        if (data.onboarding_completed) {
          setTimeout(() => loadInsights(), 1000);
        }
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage();
  };

  const handleSuggestedQuestion = (question) => {
    sendMessage(question);
  };

  return (
    <div className="flex flex-col h-screen pb-24">
      <div className="p-4 border-b bg-white">
        <h2 className="text-xl font-bold mb-1">🤖 AI Coach</h2>
        <p className="text-sm text-gray-600">Your personal cycling coach powered by AI</p>
        
        {/* Onboarding Progress Bar */}
        {!onboardingStatus.completed && onboardingStatus.step > 0 && (
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>Getting to know you...</span>
              <span>{onboardingStatus.step} / {onboardingStatus.totalSteps}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(onboardingStatus.step / onboardingStatus.totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>
        )}
      </div>

      {/* Automatic Insights - only show after onboarding */}
      {onboardingStatus.completed && insights && (
        <div className="p-4 bg-blue-50 border-b border-blue-200">
          <h3 className="font-bold text-blue-900 mb-2">📊 Recent Training Insights</h3>
          <div className="space-y-2 text-sm">
            {insights.weekly_summary && (
              <p className="text-blue-800">
                <strong>This week:</strong> {insights.weekly_summary}
              </p>
            )}
            {insights.training_load && (
              <p className="text-blue-800">
                <strong>Training load:</strong> {insights.training_load}
              </p>
            )}
            {insights.recommendation && (
              <p className="text-blue-800">
                <strong>Recommendation:</strong> {insights.recommendation}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs mt-1 opacity-70">
                {new Date(message.timestamp).toLocaleTimeString([], { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </p>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Questions - only show after onboarding and if few messages */}
      {onboardingStatus.completed && messages.length <= 2 && (
        <div className="p-4 border-t bg-gray-50">
          <p className="text-sm font-semibold text-gray-700 mb-2">Suggested questions:</p>
          <div className="space-y-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                onClick={() => handleSuggestedQuestion(question)}
                className="w-full text-left text-sm p-2 bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t bg-white">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={!onboardingStatus.completed ? "Type your answer..." : "Ask your coach anything..."}
            disabled={isLoading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

