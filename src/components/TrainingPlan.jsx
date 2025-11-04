import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx';
import { Button } from '@/components/ui/button.jsx';
import { Calendar, Target, TrendingUp, Clock, Zap } from 'lucide-react';

export default function TrainingPlan({ user }) {
  const [currentPlan, setCurrentPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    fetchCurrentPlan();
  }, []);

  const fetchCurrentPlan = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/training-plans/current', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentPlan(data.plan);
      }
    } catch (error) {
      console.error('Error fetching plan:', error);
    } finally {
      setLoading(false);
    }
  };

  const createNewPlan = async (planData) => {
    try {
      const response = await fetch('http://localhost:5000/api/training-plans/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(planData)
      });
      
      if (response.ok) {
        const data = await response.json();
        setCurrentPlan(data.plan);
        setShowCreateForm(false);
      }
    } catch (error) {
      console.error('Error creating plan:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-600">Loading training plan...</div>
      </div>
    );
  }

  // No plan exists - show create plan view
  if (!currentPlan && !showCreateForm) {
    return (
      <div className="space-y-6 pb-24">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Training Plan</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Target className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No Training Plan Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Create a personalized training plan to achieve your cycling goals
              </p>
              <Button 
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Target className="h-4 w-4 mr-2" />
                Create Training Plan
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6">
              <Calendar className="h-8 w-8 text-blue-600 mb-3" />
              <h4 className="font-semibold mb-2">Structured Workouts</h4>
              <p className="text-sm text-gray-600">
                Get a personalized schedule with specific workouts for each day
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <TrendingUp className="h-8 w-8 text-green-600 mb-3" />
              <h4 className="font-semibold mb-2">Progressive Training</h4>
              <p className="text-sm text-gray-600">
                Build fitness gradually with periodized training phases
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <Target className="h-8 w-8 text-orange-600 mb-3" />
              <h4 className="font-semibold mb-2">Goal-Oriented</h4>
              <p className="text-sm text-gray-600">
                Plans tailored to your specific goals and available time
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show create form
  if (showCreateForm) {
    return (
      <CreatePlanForm 
        user={user} 
        onCreatePlan={createNewPlan}
        onCancel={() => setShowCreateForm(false)}
      />
    );
  }

  // Show current plan
  return (
    <div className="space-y-6 pb-24">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Training Plan</span>
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowCreateForm(true)}
            >
              New Plan
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Plan Overview */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Goal</p>
                <p className="text-lg font-semibold capitalize">
                  {currentPlan.goal_type.replace('_', ' ')}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Duration</p>
                <p className="text-lg font-semibold">{currentPlan.duration_weeks} weeks</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Rides/Week</p>
                <p className="text-lg font-semibold">{currentPlan.rides_per_week}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Hours/Week</p>
                <p className="text-lg font-semibold">{currentPlan.weekly_hours}h</p>
              </div>
            </div>

            {/* Progress Bar */}
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Progress</span>
                <span className="font-semibold">
                  {Math.round(currentPlan.completion_percentage || 0)}%
                </span>
              </div>
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${currentPlan.completion_percentage || 0}%` }}
                />
              </div>
            </div>

            {/* FTP Progress */}
            {currentPlan.goal_type === 'ftp_builder' && (
              <div className="border-t pt-4 mt-4">
                <h4 className="font-semibold mb-3">FTP Progress</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Starting FTP</span>
                    <span className="font-medium">{currentPlan.current_ftp}W</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Current FTP</span>
                    <span className="font-medium">{user.current_ftp}W</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Target FTP</span>
                    <span className="font-medium">{currentPlan.target_ftp}W</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden mt-3">
                    <div
                      className="h-full bg-green-600"
                      style={{
                        width: `${Math.min(100, ((user.current_ftp - currentPlan.current_ftp) / (currentPlan.target_ftp - currentPlan.current_ftp)) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Workout Calendar Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>This Week's Workouts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-400" />
            <p>Workout calendar view coming soon...</p>
            <p className="text-sm mt-2">
              Your personalized workouts will appear here
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Create Plan Form Component
function CreatePlanForm({ user, onCreatePlan, onCancel }) {
  const [goalType, setGoalType] = useState('ftp_builder');
  const [durationWeeks, setDurationWeeks] = useState(12);
  const [ridesPerWeek, setRidesPerWeek] = useState(4);
  const [hoursPerWeek, setHoursPerWeek] = useState(6);
  const [targetFTP, setTargetFTP] = useState(user?.current_ftp ? user.current_ftp + 25 : 300);

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreatePlan({
      goal_type: goalType,
      duration_weeks: durationWeeks,
      rides_per_week: ridesPerWeek,
      hours_per_week: hoursPerWeek,
      target_ftp: targetFTP,
      training_days: [1, 3, 5, 0] // Mon, Wed, Fri, Sun
    });
  };

  return (
    <div className="space-y-6 pb-24">
      <Card>
        <CardHeader>
          <CardTitle>Create Training Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Goal Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Training Goal
              </label>
              <select
                value={goalType}
                onChange={(e) => setGoalType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="ftp_builder">Increase FTP</option>
                <option value="century_ride">Century Ride (100mi)</option>
                <option value="race_prep">Race Preparation</option>
                <option value="general_fitness">General Fitness</option>
              </select>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Plan Duration: {durationWeeks} weeks
              </label>
              <input
                type="range"
                min="4"
                max="24"
                value={durationWeeks}
                onChange={(e) => setDurationWeeks(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>4 weeks</span>
                <span>24 weeks</span>
              </div>
            </div>

            {/* Rides Per Week */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rides Per Week: {ridesPerWeek}
              </label>
              <input
                type="range"
                min="2"
                max="7"
                value={ridesPerWeek}
                onChange={(e) => setRidesPerWeek(parseInt(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>2 rides</span>
                <span>7 rides</span>
              </div>
            </div>

            {/* Hours Per Week */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hours Per Week: {hoursPerWeek}
              </label>
              <input
                type="range"
                min="2"
                max="15"
                step="0.5"
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(parseFloat(e.target.value))}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>2 hours</span>
                <span>15 hours</span>
              </div>
            </div>

            {/* Target FTP */}
            {goalType === 'ftp_builder' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Target FTP (watts)
                </label>
                <input
                  type="number"
                  value={targetFTP}
                  onChange={(e) => setTargetFTP(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {user?.current_ftp && (
                  <div className="text-sm text-gray-500 mt-1">
                    Current FTP: {user.current_ftp}W
                    ({Math.round(((targetFTP - user.current_ftp) / user.current_ftp) * 100)}% increase)
                  </div>
                )}
              </div>
            )}

            {/* Buttons */}
            <div className="flex space-x-3">
              <Button 
                type="submit" 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Generate Plan
              </Button>
              {onCancel && (
                <Button 
                  type="button" 
                  onClick={onCancel}
                  variant="outline"
                  className="flex-1"
                >
                  Cancel
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

