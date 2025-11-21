import React, { useEffect } from 'react';
import { useSectionProgress } from '../../hooks/useSectionProgress';
import { formatTime } from '../../utils/formatTime';

interface SectionProgressProps {
  sectionId: string;
  estimatedDuration?: number;
  onSectionComplete?: () => void;
  autoStart?: boolean;
  showControls?: boolean;
  className?: string;
}

const SectionProgress: React.FC<SectionProgressProps> = ({
  sectionId,
  estimatedDuration = 0,
  onSectionComplete,
  autoStart = false,
  showControls = true,
  className = ''
}) => {
  const {
    progress,
    isTracking,
    error,
    startTracking,
    stopTracking,
    pauseTracking,
    resumeTracking,
    completionPercentage,
    timeSpent,
    durationWatched,
    isCompleted
  } = useSectionProgress({
    sectionId,
    estimatedDuration,
    onSectionComplete
  });

  useEffect(() => {
    if (autoStart && !isTracking && !isCompleted) {
      startTracking();
    }
  }, [autoStart, isTracking, isCompleted, startTracking]);

  const handleStart = () => {
    startTracking();
  };

  const handleStop = () => {
    stopTracking();
  };

  const handlePause = () => {
    pauseTracking();
  };

  const handleResume = () => {
    resumeTracking();
  };

  const formatDuration = (seconds: number) => {
    return formatTime(seconds);
  };

  const getProgressColor = () => {
    if (completionPercentage >= 90) return 'bg-green-500';
    if (completionPercentage >= 70) return 'bg-blue-500';
    if (completionPercentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (error) {
    return (
      <div className={`section-progress-error ${className}`}>
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <span>Error loading progress: {error}</span>
          <button
            onClick={() => window.location.reload()}
            className="ml-2 text-red-600 hover:text-red-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`section-progress ${className}`}>
      {/* Progress Bar */}
      <div className="mb-2">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>Progress</span>
          <span>{Math.round(completionPercentage)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Time Information */}
      <div className="flex justify-between text-sm text-gray-500 mb-3">
        <span>
          Time Spent: {formatDuration(timeSpent)}
        </span>
        <span>
          Duration Watched: {formatDuration(durationWatched)}
        </span>
        {estimatedDuration > 0 && (
          <span>
            Estimated: {formatDuration(estimatedDuration)}
          </span>
        )}
      </div>

      {/* Completion Status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {isCompleted ? (
            <span className="flex items-center text-green-600 font-medium">
              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Completed
            </span>
          ) : (
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              isTracking ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {isTracking ? 'Tracking' : 'Not Active'}
            </span>
          )}
        </div>

        {progress && (
          <span className="text-xs text-gray-400">
            Last activity: {new Date(progress.lastActivityAt).toLocaleString()}
          </span>
        )}
      </div>

      {/* Controls */}
      {showControls && (
        <div className="flex space-x-2">
          {!isTracking && !isCompleted && (
            <button
              onClick={handleStart}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded text-sm transition-colors"
            >
              Start Tracking
            </button>
          )}

          {isTracking && (
            <>
              <button
                onClick={handlePause}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1.5 rounded text-sm transition-colors"
              >
                Pause
              </button>
              <button
                onClick={handleStop}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded text-sm transition-colors"
              >
                Stop
              </button>
            </>
          )}

          {!isTracking && !isCompleted && (
            <button
              onClick={handleResume}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded text-sm transition-colors"
            >
              Resume
            </button>
          )}

          {isCompleted && (
            <button
              onClick={handleStop}
              className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-1.5 rounded text-sm transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SectionProgress;