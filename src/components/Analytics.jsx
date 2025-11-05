import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { BarChart3, TrendingUp, Activity, Zap } from 'lucide-react';
import { kmToMiles } from '../utils/units';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export function Analytics({ user }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30'); // 30, 90, 180, 365 days
  const [lastRideAnalysis, setLastRideAnalysis] = useState(null);
  const [analysisLoading, setAnalysisLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
    loadLastRideAnalysis();
  }, [timeRange]);

  const loadLastRideAnalysis = async () => {
    try {
      setAnalysisLoading(true);
      const response = await fetch(`${API_BASE_URL}/analytics/last-ride-analysis`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setLastRideAnalysis(data);
      }
    } catch (error) {
      console.error('Failed to load last ride analysis:', error);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/analytics?days=${timeRange}`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading analytics...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-6 w-6 text-blue-600" />
          <h1 className="text-2xl font-bold">Performance Analytics</h1>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="flex space-x-2 overflow-x-auto">
        {[
          { value: '30', label: '30 Days' },
          { value: '90', label: '90 Days' },
          { value: '180', label: '6 Months' },
          { value: '365', label: '1 Year' }
        ].map(range => (
          <button
            key={range.value}
            onClick={() => setTimeRange(range.value)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              timeRange === range.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>

      {/* Last Ride Analysis */}
      {analysisLoading ? (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center h-32">
              <div className="text-gray-500">Analyzing your last ride...</div>
            </div>
          </CardContent>
        </Card>
      ) : lastRideAnalysis && lastRideAnalysis.ride ? (
        <Card className="border-l-4 border-l-blue-600">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center space-x-2">
                  <Zap className="h-5 w-5 text-blue-600" />
                  <span>Last Ride Analysis</span>
                </CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {lastRideAnalysis.ride.name} • {new Date(lastRideAnalysis.ride.date).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-blue-600">{kmToMiles(lastRideAnalysis.ride.distance).toFixed(1)} mi</p>
                <p className="text-sm text-gray-600">{Math.floor(lastRideAnalysis.ride.duration / 60)} min</p>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Key Metrics */}
            <div className="grid grid-cols-3 gap-4 mb-6 pb-6 border-b">
              {lastRideAnalysis.ride.avg_power && (
                <div>
                  <p className="text-sm text-gray-600">Avg Power</p>
                  <p className="text-xl font-bold">{lastRideAnalysis.ride.avg_power}W</p>
                </div>
              )}
              {lastRideAnalysis.ride.avg_heart_rate && (
                <div>
                  <p className="text-sm text-gray-600">Avg HR</p>
                  <p className="text-xl font-bold">{lastRideAnalysis.ride.avg_heart_rate} bpm</p>
                </div>
              )}
              {lastRideAnalysis.ride.training_stress_score && (
                <div>
                  <p className="text-sm text-gray-600">TSS</p>
                  <p className="text-xl font-bold">{lastRideAnalysis.ride.training_stress_score}</p>
                </div>
              )}
            </div>

            {/* AI Analysis */}
            {lastRideAnalysis.analysis && (
              <div className="space-y-4">
                <h3 className="font-semibold text-lg">Coach's Insights</h3>
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {lastRideAnalysis.analysis}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-gray-500 py-8">
              <Activity className="h-12 w-12 mx-auto mb-3 opacity-20" />
              <p>No rides yet. Upload your first ride to get personalized insights!</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Rides</p>
                <p className="text-3xl font-bold">{analytics?.total_rides || 0}</p>
              </div>
              <Activity className="h-10 w-10 text-blue-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Distance</p>
                <p className="text-3xl font-bold">{analytics?.total_distance ? kmToMiles(analytics.total_distance).toFixed(0) : 0}<span className="text-lg">mi</span></p>
              </div>
              <TrendingUp className="h-10 w-10 text-green-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Power</p>
                <p className="text-3xl font-bold">{analytics?.avg_power || 0}<span className="text-lg">W</span></p>
              </div>
              <Zap className="h-10 w-10 text-orange-600 opacity-20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total TSS</p>
                <p className="text-3xl font-bold">{analytics?.total_tss || 0}</p>
              </div>
              <BarChart3 className="h-10 w-10 text-purple-600 opacity-20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Training Load Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-5 w-5" />
            <span>Training Load Trend</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TrainingLoadChart data={analytics?.weekly_tss || []} />
        </CardContent>
      </Card>

      {/* Power Zones Distribution */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Zap className="h-5 w-5" />
            <span>Power Zones Distribution</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <PowerZonesChart ftp={user?.current_ftp || 250} data={analytics?.power_zones || []} />
        </CardContent>
      </Card>

      {/* Ride Frequency */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Ride Frequency</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Rides per week</span>
                <span className="font-medium">{analytics?.rides_per_week?.toFixed(1) || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all"
                  style={{ width: `${Math.min((analytics?.rides_per_week || 0) / 7 * 100, 100)}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Hours per week</span>
                <span className="font-medium">{analytics?.hours_per_week?.toFixed(1) || 0}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-green-600 h-3 rounded-full transition-all"
                  style={{ width: `${Math.min((analytics?.hours_per_week || 0) / 15 * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics?.insights?.map((insight, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">
                <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2" />
                <p className="text-sm text-gray-700">{insight}</p>
              </div>
            )) || (
              <p className="text-gray-500 text-center py-4">
                Upload more rides to get personalized insights
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Training Load Chart Component
function TrainingLoadChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No training load data available
      </div>
    );
  }

  const maxTSS = Math.max(...data.map(d => d.tss), 100);

  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between h-48 space-x-2">
        {data.map((week, index) => (
          <div key={index} className="flex-1 flex flex-col items-center justify-end">
            <div 
              className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t transition-all hover:opacity-80"
              style={{ height: `${(week.tss / maxTSS) * 100}%` }}
              title={`Week ${week.week}: ${week.tss} TSS`}
            />
            <div className="text-xs text-gray-500 mt-2">W{week.week}</div>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-500 pt-2 border-t">
        <span>0 TSS</span>
        <span>{maxTSS} TSS</span>
      </div>
    </div>
  );
}

// Power Zones Chart Component
function PowerZonesChart({ ftp, data }) {
  const zones = [
    { name: 'Z1 Recovery', min: 0, max: 0.55, color: 'bg-gray-400' },
    { name: 'Z2 Endurance', min: 0.56, max: 0.75, color: 'bg-blue-400' },
    { name: 'Z3 Tempo', min: 0.76, max: 0.90, color: 'bg-green-400' },
    { name: 'Z4 Threshold', min: 0.91, max: 1.05, color: 'bg-yellow-400' },
    { name: 'Z5 VO2 Max', min: 1.06, max: 1.20, color: 'bg-orange-400' },
    { name: 'Z6 Anaerobic', min: 1.21, max: 1.50, color: 'bg-red-400' }
  ];

  // Calculate zone distribution from data or use defaults
  const zoneDistribution = data.length > 0 ? data : [
    { zone: 'Z1', percentage: 20 },
    { zone: 'Z2', percentage: 40 },
    { zone: 'Z3', percentage: 25 },
    { zone: 'Z4', percentage: 10 },
    { zone: 'Z5', percentage: 4 },
    { zone: 'Z6', percentage: 1 }
  ];

  return (
    <div className="space-y-4">
      {zones.map((zone, index) => {
        const distribution = zoneDistribution.find(d => d.zone === `Z${index + 1}`);
        const percentage = distribution?.percentage || 0;
        
        return (
          <div key={zone.name} className="space-y-1">
            <div className="flex justify-between text-sm">
              <span className="font-medium">{zone.name}</span>
              <span className="text-gray-600">
                {Math.round(ftp * zone.min)}-{Math.round(ftp * zone.max)}W ({percentage}%)
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className={`${zone.color} h-3 rounded-full transition-all`}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default Analytics;

