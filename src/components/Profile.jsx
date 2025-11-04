import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function Profile({ user }) {
  const [stravaStatus, setStravaStatus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState(null)

  useEffect(() => {
    checkStravaStatus()
  }, [])

  const checkStravaStatus = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/strava/status`, {
        credentials: 'include'
      })
      const data = await response.json()
      setStravaStatus(data)
    } catch (error) {
      console.error('Failed to check Strava status:', error)
    } finally {
      setLoading(false)
    }
  }

  const connectStrava = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/strava/connect`, {
        credentials: 'include'
      })
      const data = await response.json()
      
      if (data.auth_url) {
        // Redirect to Strava OAuth page
        window.location.href = data.auth_url
      }
    } catch (error) {
      console.error('Failed to initiate Strava connection:', error)
    }
  }

  const disconnectStrava = async () => {
    if (!confirm('Are you sure you want to disconnect Strava?')) {
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/strava/disconnect`, {
        method: 'POST',
        credentials: 'include'
      })
      
      if (response.ok) {
        setStravaStatus({ connected: false })
      }
    } catch (error) {
      console.error('Failed to disconnect Strava:', error)
    }
  }

  const syncActivities = async () => {
    setSyncing(true)
    setSyncResult(null)

    try {
      const response = await fetch(`${API_BASE_URL}/strava/sync`, {
        method: 'POST',
        credentials: 'include'
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setSyncResult({
          success: true,
          message: `Successfully imported ${data.imported} new activities!`
        })
        // Refresh Strava status to update last sync time
        checkStravaStatus()
      } else {
        setSyncResult({
          success: false,
          message: data.error || 'Failed to sync activities'
        })
      }
    } catch (error) {
      setSyncResult({
        success: false,
        message: 'Failed to sync activities'
      })
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-gray-500">Manage your account and integrations</p>
      </div>

      {/* User Info Card */}
      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-500">Username</label>
            <p className="text-lg">{user.username}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Email</label>
            <p className="text-lg">{user.email || 'Not set'}</p>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-500">Member Since</label>
            <p className="text-lg">{new Date(user.created_at).toLocaleDateString()}</p>
          </div>
        </CardContent>
      </Card>

      {/* Strava Integration Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/c/cb/Strava_Logo.svg" 
              alt="Strava" 
              className="h-6"
            />
            Strava Integration
          </CardTitle>
          <CardDescription>
            Connect your Strava account to automatically sync your rides
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-gray-500">Loading...</p>
          ) : stravaStatus?.connected ? (
            <>
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Connected to Strava</span>
              </div>
              
              {stravaStatus.athlete && (
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Athlete</label>
                    <p className="text-lg">
                      {stravaStatus.athlete.athlete_firstname} {stravaStatus.athlete.athlete_lastname}
                      {stravaStatus.athlete.athlete_username && ` (@${stravaStatus.athlete.athlete_username})`}
                    </p>
                  </div>
                  {stravaStatus.last_sync && (
                    <div>
                      <label className="text-sm font-medium text-gray-500">Last Sync</label>
                      <p className="text-lg">{new Date(stravaStatus.last_sync).toLocaleString()}</p>
                    </div>
                  )}
                </div>
              )}

              {syncResult && (
                <div className={`p-4 rounded-lg ${syncResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                  {syncResult.message}
                </div>
              )}

              <div className="flex gap-3">
                <Button 
                  onClick={syncActivities}
                  disabled={syncing}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${syncing ? 'animate-spin' : ''}`} />
                  {syncing ? 'Syncing...' : 'Sync Activities'}
                </Button>
                <Button 
                  onClick={disconnectStrava}
                  variant="outline"
                  className="text-red-600 hover:text-red-700"
                >
                  Disconnect
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 text-gray-500">
                <AlertCircle className="h-5 w-5" />
                <span>Not connected to Strava</span>
              </div>
              <p className="text-sm text-gray-600">
                Connect your Strava account to automatically import your cycling activities, 
                including power data, heart rate, and performance metrics.
              </p>
              <Button 
                onClick={connectStrava}
                className="bg-orange-500 hover:bg-orange-600"
              >
                Connect Strava
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

