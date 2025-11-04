import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { 
  Home, 
  Upload, 
  MessageCircle, 
  BarChart3, 
  User, 
  Activity, 
  Zap, 
  Clock, 
  TrendingUp,
  Heart,
  Mountain,
  LogIn,
  Eye,
  EyeOff,
  Calendar,
  Target
} from 'lucide-react'
import aiCyclistLogo from './assets/ai_cyclist_logo_dynamic.png'
import UploadRides from './components/Upload.jsx'
import AICoach from './components/Coach.jsx'
import Analytics from './components/Analytics.jsx'
import TrainingPlan from './components/TrainingPlan.jsx'
import Profile from './components/Profile.jsx'
import './App.css'

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Login Component
function LoginScreen({ onLogin }) {
  const [isRegisterMode, setIsRegisterMode] = useState(false)
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, password })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        onLogin(data.user)
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (err) {
      setError('Connection error. Please check if the backend is running.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    setSuccess('')
    
    // Validation
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setIsLoading(false)
      return
    }
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters')
      setIsLoading(false)
      return
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ username, email, password })
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setSuccess('Registration successful! Logging you in...')
        // Auto-login after successful registration
        setTimeout(async () => {
          const loginResponse = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({ username, password })
          })
          const loginData = await loginResponse.json()
          if (loginResponse.ok) {
            onLogin(loginData.user)
          }
        }, 1500)
      } else {
        setError(data.error || 'Registration failed')
      }
    } catch (err) {
      setError('Connection error. Please check if the backend is running.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-purple-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-md border-white/20">
        <CardHeader className="text-center">
          <img src={aiCyclistLogo} alt="AI Cycling Academy" className="h-16 w-auto mx-auto mb-4" />
          <CardTitle className="text-2xl text-white">
            {isRegisterMode ? 'Create Account' : 'Welcome Back'}
          </CardTitle>
          <CardDescription className="text-blue-100">
            {isRegisterMode ? 'Join your AI cycling coach' : 'Sign in to your AI cycling coach'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={isRegisterMode ? handleRegister : handleLogin} className="space-y-4">
            <div>
              <Input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-blue-200"
                required
              />
            </div>
            {isRegisterMode && (
              <div>
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-blue-200"
                  required
                />
              </div>
            )}
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-blue-200 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-200 hover:text-white"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {isRegisterMode && (
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-white/10 border-white/20 text-white placeholder:text-blue-200 pr-10"
                  required
                />
              </div>
            )}
            {error && (
              <div className="text-red-300 text-sm bg-red-500/20 p-3 rounded-lg">
                {error}
              </div>
            )}
            {success && (
              <div className="text-green-300 text-sm bg-green-500/20 p-3 rounded-lg">
                {success}
              </div>
            )}
            <Button 
              type="submit" 
              className="w-full bg-orange-500 hover:bg-orange-600 text-white"
              disabled={isLoading}
            >
              {isLoading ? (isRegisterMode ? 'Creating Account...' : 'Signing in...') : (isRegisterMode ? 'Create Account' : 'Sign In')}
            </Button>
          </form>
          <div className="mt-6 text-center">
            <button
              onClick={() => {
                setIsRegisterMode(!isRegisterMode)
                setError('')
                setSuccess('')
              }}
              className="text-blue-200 hover:text-white text-sm underline"
            >
              {isRegisterMode ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
          {!isRegisterMode && (
            <div className="mt-4 text-center">
              <p className="text-blue-200 text-sm mb-2">Demo Accounts:</p>
              <div className="space-y-1 text-xs text-blue-300">
                <p><strong>Demo:</strong> demo / demo123 (with sample data)</p>
                <p><strong>User:</strong> user / user123 (fresh account)</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// Dashboard Component
function Dashboard({ user }) {
  const [dashboardData, setDashboardData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/dashboard/summary?days=30`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading dashboard...</div>
      </div>
    )
  }

  const summary = dashboardData?.summary || {}
  const recentRides = dashboardData?.recent_rides || []
  const hasRides = recentRides.length > 0

  return (
    <div className="space-y-6 pb-24">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">
          Welcome back, {user.username}! 🚴‍♂️
        </h1>
        <p className="text-blue-100">
          {hasRides 
            ? `You've completed ${summary.total_rides} rides in the last 30 days` 
            : "Ready to upload your first ride and get AI coaching insights?"
          }
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2 text-blue-600">
                <Activity className="h-5 w-5" />
                <p className="text-sm text-gray-600">Rides</p>
              </div>
              <p className="text-2xl font-bold">{summary.total_rides || 0}</p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2 text-green-600">
                <Mountain className="h-5 w-5" />
                <p className="text-sm text-gray-600">Distance</p>
              </div>
              <p className="text-2xl font-bold">
                {summary.total_distance?.toFixed(0) || 0}
                <span className="text-sm text-gray-500 ml-1">km</span>
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2 text-yellow-600">
                <Zap className="h-5 w-5" />
                <p className="text-sm text-gray-600">Avg Power</p>
              </div>
              <p className="text-2xl font-bold">
                {summary.avg_power?.toFixed(0) || 0}
                <span className="text-sm text-gray-500 ml-1">W</span>
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2 text-purple-600">
                <TrendingUp className="h-5 w-5" />
                <p className="text-sm text-gray-600">TSS</p>
              </div>
              <p className="text-2xl font-bold">{summary.total_tss?.toFixed(0) || 0}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* FTP Card */}
      {summary.current_ftp && (
        <Card className="bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm mb-1">Current FTP</p>
                <p className="text-4xl font-bold">{summary.current_ftp}W</p>
              </div>
              <Target className="h-12 w-12 text-orange-100" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recent Rides */}
      {hasRides ? (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Recent Rides</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentRides.map((ride) => (
                <div key={ride.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Activity className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{ride.name}</p>
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <span>{ride.distance?.toFixed(1)}km</span>
                        <span>•</span>
                        <span>{Math.round(ride.duration/60)}min</span>
                        {ride.elevation_gain && (
                          <>
                            <span>•</span>
                            <span>{ride.elevation_gain}m</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    {ride.avg_power && (
                      <p className="font-medium text-lg">{ride.avg_power}W</p>
                    )}
                    {ride.training_stress_score && (
                      <Badge variant="secondary" className="mt-1">
                        TSS {ride.training_stress_score.toFixed(0)}
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Get Started</CardTitle>
            <CardDescription>Upload your first ride to begin AI coaching</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No rides yet. Upload your cycling data to get started!</p>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Upload className="h-4 w-4 mr-2" />
                Upload First Ride
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Training Load Summary */}
      {hasRides && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>30-Day Summary</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Total Time</p>
                <p className="text-2xl font-bold">
                  {(summary.total_time / 3600).toFixed(1)}
                  <span className="text-sm text-gray-500 ml-1">hrs</span>
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Elevation</p>
                <p className="text-2xl font-bold">
                  {summary.total_elevation?.toFixed(0) || 0}
                  <span className="text-sm text-gray-500 ml-1">m</span>
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Avg Speed</p>
                <p className="text-2xl font-bold">
                  {summary.avg_speed?.toFixed(1) || 0}
                  <span className="text-sm text-gray-500 ml-1">km/h</span>
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-gray-600">Rides/Week</p>
                <p className="text-2xl font-bold">
                  {((summary.total_rides || 0) / 4.3).toFixed(1)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

// Upload Component is imported from separate file

// AI Coach Component is imported from separate file

// Analytics Component is imported from separate file

// Profile Component (Placeholder)
function Profile({ user, onLogout }) {
  return (
    <div className="space-y-6 pb-24">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Profile</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-gray-600">Username</p>
            <p className="text-lg font-medium">{user.username}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="text-lg font-medium">{user.email}</p>
          </div>
          {user.current_ftp && (
            <div>
              <p className="text-sm text-gray-600">Current FTP</p>
              <p className="text-lg font-medium">{user.current_ftp}W</p>
            </div>
          )}
          {user.weight && (
            <div>
              <p className="text-sm text-gray-600">Weight</p>
              <p className="text-lg font-medium">{user.weight}kg</p>
            </div>
          )}
          <div className="border-t pt-4 mt-4">
            <p className="text-sm text-gray-600 mb-2">Training Goals</p>
            <p className="text-base">{user.training_goals || 'No goals set yet. Add your goals to get personalized coaching!'}</p>
            <Button 
              onClick={() => {
                const goals = prompt('Enter your training goals:', user.training_goals || '');
                if (goals !== null) {
                  fetch(`${API_BASE_URL}/coaching/goals`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({ goals })
                  }).then(() => window.location.reload());
                }
              }}
              variant="outline"
              className="mt-2 w-full"
            >
              {user.training_goals ? 'Update Goals' : 'Set Goals'}
            </Button>
          </div>
          <div className="pt-4">
            <Button 
              onClick={onLogout}
              variant="outline" 
              className="w-full border-red-500 text-red-500 hover:bg-red-50"
            >
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Bottom Navigation
function BottomNav({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'dashboard', icon: Home, label: 'Home' },
    { id: 'upload', icon: Upload, label: 'Upload' },
    { id: 'plan', icon: Calendar, label: 'Plan' },
    { id: 'coach', icon: MessageCircle, label: 'Coach' },
    { id: 'analytics', icon: BarChart3, label: 'Analytics' },
    { id: 'profile', icon: User, label: 'Profile' }
  ]

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-50">
      <div className="max-w-screen-xl mx-auto px-2">
        <div className="flex items-center justify-around">
          {tabs.map(tab => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center py-3 px-4 flex-1 transition-colors ${
                  isActive 
                    ? 'text-blue-600' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className={`h-6 w-6 mb-1 ${isActive ? 'stroke-[2.5]' : ''}`} />
                <span className={`text-xs ${isActive ? 'font-semibold' : ''}`}>
                  {tab.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// Main App Component
function App() {
  const [user, setUser] = useState(null)
  const [activeTab, setActiveTab] = useState('dashboard')

  const handleLogin = (userData) => {
    setUser(userData)
  }

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      })
    } catch (err) {
      console.error('Logout error:', err)
    }
    setUser(null)
    setActiveTab('dashboard')
  }

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-screen-xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src={aiCyclistLogo} alt="AI Cycling Academy" className="h-10 w-auto" />
              <div>
                <h1 className="text-lg font-bold text-gray-900">AI Cycling Academy</h1>
                <p className="text-xs text-gray-600">Your AI-Powered Coach</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-screen-xl mx-auto px-4 py-6">
        {activeTab === 'dashboard' && <Dashboard user={user} />}
        {activeTab === 'upload' && <UploadRides />}
        {activeTab === 'plan' && <TrainingPlan user={user} />}
        {activeTab === 'coach' && <AICoach user={user} />}
        {activeTab === 'analytics' && <Analytics user={user} />}
        {activeTab === 'profile' && <Profile user={user} onLogout={handleLogout} />}
      </main>

      {/* Bottom Navigation */}
      <BottomNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}

export default App

