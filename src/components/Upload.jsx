import { useState, useRef } from 'react'
import { kmToMiles, metersToFeet } from '../utils/units'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';;

export default function Upload({ onNavigate }) {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [uploadResult, setUploadResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file) => {
    // Reset states
    setError(null);
    setPreview(null);
    setUploadResult(null);

    // Validate file type
    const validExtensions = ['fit', 'gpx', 'tcx'];
    const fileExtension = file.name.split('.').pop().toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      setError('Invalid file type. Please upload a .fit, .gpx, or .tcx file.');
      return;
    }

    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      setError('File too large. Maximum size is 50MB.');
      return;
    }

    // Show preview
    setUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/upload/preview`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setPreview({
          ...data.preview,
          file: file
        });
      } else {
        setError(data.error || 'Failed to preview file');
      }
    } catch (err) {
      setError('Failed to preview file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const confirmUpload = async () => {
    if (!preview || !preview.file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', preview.file);

      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await response.json();

      if (response.ok) {
        setUploadResult(data.ride);
        setPreview(null);
      } else {
        setError(data.error || 'Failed to upload file');
      }
    } catch (err) {
      setError('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const cancelPreview = () => {
    setPreview(null);
    setError(null);
  };

  const uploadAnother = () => {
    setUploadResult(null);
    setPreview(null);
    setError(null);
  };

  const onButtonClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-2">📤 Upload Rides</h2>
      <p className="text-sm text-gray-600 mb-6">Upload your cycling data files (.fit, .tcx, .gpx)</p>

      {/* Upload Result */}
      {uploadResult && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center mb-3">
            <span className="text-2xl mr-2">✅</span>
            <h3 className="text-lg font-bold text-green-800">Upload Successful!</h3>
          </div>
          
          <div className="bg-white p-4 rounded-lg mb-4">
            <h4 className="font-bold mb-2">{uploadResult.name}</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Distance:</span>
                <span className="ml-2 font-semibold">{kmToMiles(uploadResult.distance).toFixed(1)} mi</span>
              </div>
              <div>
                <span className="text-gray-600">Duration:</span>
                <span className="ml-2 font-semibold">{Math.round(uploadResult.duration / 60)} min</span>
              </div>
              <div>
                <span className="text-gray-600">Elevation:</span>
                <span className="ml-2 font-semibold">{Math.round(metersToFeet(uploadResult.elevation_gain))} ft</span>
              </div>
              <div>
                <span className="text-gray-600">Avg Power:</span>
                <span className="ml-2 font-semibold">{uploadResult.avg_power} W</span>
              </div>
              {uploadResult.avg_heart_rate > 0 && (
                <div>
                  <span className="text-gray-600">Avg HR:</span>
                  <span className="ml-2 font-semibold">{uploadResult.avg_heart_rate} bpm</span>
                </div>
              )}
              {uploadResult.tss > 0 && (
                <div>
                  <span className="text-gray-600">TSS:</span>
                  <span className="ml-2 font-semibold">{uploadResult.tss}</span>
                </div>
              )}
            </div>
          </div>

          {uploadResult.ai_analysis && (
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <h4 className="font-bold mb-2 text-blue-900">🤖 AI Analysis</h4>
              <p className="text-sm text-blue-800">{uploadResult.ai_analysis}</p>
            </div>
          )}

          <button
            onClick={uploadAnother}
            className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700"
          >
            Upload Another Ride
          </button>
        </div>
      )}

      {/* Preview */}
      {preview && !uploadResult && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-bold mb-3 text-blue-900">Preview Ride Data</h3>
          
          <div className="bg-white p-4 rounded-lg mb-4">
            <h4 className="font-bold mb-2">{preview.name}</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">Date:</span>
                <span className="ml-2 font-semibold">
                  {preview.date ? new Date(preview.date).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Distance:</span>
                <span className="ml-2 font-semibold">{kmToMiles(preview.distance).toFixed(1)} mi</span>
              </div>
              <div>
                <span className="text-gray-600">Duration:</span>
                <span className="ml-2 font-semibold">{preview.duration} min</span>
              </div>
              <div>
                <span className="text-gray-600">Elevation:</span>
                <span className="ml-2 font-semibold">{Math.round(metersToFeet(preview.elevation_gain))} ft</span>
              </div>
              {preview.avg_power > 0 && (
                <div>
                  <span className="text-gray-600">Avg Power:</span>
                  <span className="ml-2 font-semibold">{preview.avg_power} W</span>
                </div>
              )}
              {preview.avg_heart_rate > 0 && (
                <div>
                  <span className="text-gray-600">Avg HR:</span>
                  <span className="ml-2 font-semibold">{preview.avg_heart_rate} bpm</span>
                </div>
              )}
              {preview.avg_cadence > 0 && (
                <div>
                  <span className="text-gray-600">Avg Cadence:</span>
                  <span className="ml-2 font-semibold">{preview.avg_cadence} rpm</span>
                </div>
              )}
              <div>
                <span className="text-gray-600">Data Points:</span>
                <span className="ml-2 font-semibold">{preview.data_points_count}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={confirmUpload}
              disabled={uploading}
              className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400"
            >
              {uploading ? 'Uploading...' : 'Confirm Upload'}
            </button>
            <button
              onClick={cancelPreview}
              disabled={uploading}
              className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400 disabled:bg-gray-200"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-2xl mr-2">⚠️</span>
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Upload Area */}
      {!preview && !uploadResult && (
        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center ${
            dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".fit,.gpx,.tcx"
            onChange={handleChange}
          />

          <div className="mb-4">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <p className="text-lg mb-2">Drag and drop files here</p>
          <p className="text-sm text-gray-500 mb-4">or click to browse</p>

          <button
            onClick={onButtonClick}
            disabled={uploading}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400"
          >
            {uploading ? 'Processing...' : 'Select Files'}
          </button>

          <p className="text-xs text-gray-500 mt-4">
            Supported formats: .fit, .gpx, .tcx (max 50MB)
          </p>
        </div>
      )}

      {/* Strava Integration Section */}
      <div className="mt-8 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h3 className="font-bold mb-2">🔗 Strava Integration</h3>
        <p className="text-sm text-gray-600 mb-3">
          Connect your Strava account to automatically sync your rides
        </p>
        <button 
          onClick={() => onNavigate && onNavigate('profile')}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-orange-600"
        >
          Connect Strava
        </button>
      </div>
    </div>
  );
}

