import { useState, useEffect, useRef } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export default function Coach({ user }) {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [insights, setInsights] = useState(null);
  const messagesEndRef = useRef(null);

  const suggestedQuestions = [
    "What should I focus on in my next training session?",
    "How can I improve my FTP?",
    "Am I training too hard or not enough?",
    "What's my current training load telling me?",
    "How should I structure my weekly training?"
  ];

  useEffect(() => {
    // Load automatic insights when component mounts
    loadInsights();
    
    // Add welcome message with goals context
    const welcomeMsg = user?.training_goals 
      ? `Hi ${user.username}! 👋 I'm your AI cycling coach. I see your goal is: "${user.training_goals}". I've analyzed your recent rides and I'm here to help you achieve it. What would you like to know?`
      : `Hi ${user?.username || 'there'}! 👋 I'm your AI cycling coach. I've analyzed your recent rides and I'm here to help you improve. Set your training goals in your Profile to get more personalized coaching!`;
    
    setMessages([{
      role: 'assistant',
      content: welcomeMsg,
      timestamp: new Date()
    }]);
  }, [user]);

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
      </div>

      {/* Automatic Insights */}
      {insights && (
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

      {/* Suggested Questions */}
      {messages.length <= 1 && (
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
            placeholder="Ask your coach anything..."
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

