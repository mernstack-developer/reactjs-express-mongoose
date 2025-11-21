import { useState, useEffect, useRef, useCallback } from 'react';
import { apiClient } from '../utils/api';

interface SectionProgress {
  _id?: string;
  userId: string;
  sectionId: string;
  timeSpent: number;
  durationWatched: number;
  completionPercentage: number;
  isCompleted: boolean;
  completedAt?: string;
  lastActivityAt: string;
  progressLogs: ProgressLog[];
}

interface ProgressLog {
  timestamp: string;
  timeSpent: number;
  durationWatched: number;
  completionPercentage: number;
}

interface UseSectionProgressProps {
  sectionId: string;
  estimatedDuration?: number;
  updateInterval?: number; // Default 5000ms (5 seconds)
  onProgressUpdate?: (progress: SectionProgress) => void;
  onSectionComplete?: () => void;
}

export const useSectionProgress = ({
  sectionId,
  estimatedDuration = 0,
  updateInterval = 5000,
  onProgressUpdate,
  onSectionComplete
}: UseSectionProgressProps) => {
  const [progress, setProgress] = useState<SectionProgress | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const trackingRef = useRef<{
    isActive: boolean;
    startTime: number;
    lastUpdateTime: number;
    timeSpentInterval: NodeJS.Timeout | null;
    progressUpdates: Array<{ timeSpent: number; durationWatched: number }>;
  }>({
    isActive: false,
    startTime: 0,
    lastUpdateTime: 0,
    timeSpentInterval: null,
    progressUpdates: []
  });

  // Load initial progress
  const loadProgress = useCallback(async () => {
    try {
      setError(null);
      const response = await apiClient.get(`/sections/${sectionId}/progress`);
      setProgress(response.data.data);
      
      if (response.data.data.isCompleted && onSectionComplete) {
        onSectionComplete();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load section progress');
    }
  }, [sectionId, onSectionComplete]);

  // Update progress on server
  const updateProgress = useCallback(async (timeSpent: number, durationWatched: number) => {
    try {
      const response = await apiClient.post(`/sections/${sectionId}/progress`, {
        timeSpent,
        durationWatched
      });
      
      setProgress(response.data.data);
      onProgressUpdate?.(response.data.data);
      
      if (response.data.data.isCompleted && onSectionComplete) {
        onSectionComplete();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update progress');
    }
  }, [sectionId, onProgressUpdate, onSectionComplete]);

  // Start tracking progress
  const startTracking = useCallback(() => {
    if (trackingRef.current.isActive || !sectionId) return;
    
    trackingRef.current = {
      ...trackingRef.current,
      isActive: true,
      startTime: Date.now(),
      lastUpdateTime: Date.now()
    };
    
    setIsTracking(true);
    
    // Start time tracking interval
    trackingRef.current.timeSpentInterval = setInterval(() => {
      const now = Date.now();
      const timeSinceLastUpdate = now - trackingRef.current.lastUpdateTime;
      
      if (timeSinceLastUpdate >= updateInterval) {
        const timeSpent = Math.floor(timeSinceLastUpdate / 1000); // Convert to seconds
        
        trackingRef.current.progressUpdates.push({
          timeSpent,
          durationWatched: timeSpent // For now, assume duration watched equals time spent
        });
        
        trackingRef.current.lastUpdateTime = now;
        
        // Batch update every 5 seconds
        if (trackingRef.current.progressUpdates.length >= 1) {
          const updates = [...trackingRef.current.progressUpdates];
          trackingRef.current.progressUpdates = [];
          
          updateProgress(
            updates.reduce((total, update) => total + update.timeSpent, 0),
            updates.reduce((total, update) => total + update.durationWatched, 0)
          );
        }
      }
    }, 1000); // Check every second
  }, [sectionId, updateInterval, updateProgress]);

  // Stop tracking progress
  const stopTracking = useCallback(() => {
    if (!trackingRef.current.isActive) return;
    
    trackingRef.current.isActive = false;
    setIsTracking(false);
    
    // Clear interval
    if (trackingRef.current.timeSpentInterval) {
      clearInterval(trackingRef.current.timeSpentInterval);
      trackingRef.current.timeSpentInterval = null;
    }
    
    // Update any remaining progress
    if (trackingRef.current.progressUpdates.length > 0) {
      const updates = [...trackingRef.current.progressUpdates];
      trackingRef.current.progressUpdates = [];
      
      updateProgress(
        updates.reduce((total, update) => total + update.timeSpent, 0),
        updates.reduce((total, update) => total + update.durationWatched, 0)
      );
    }
  }, [updateProgress]);

  // Reset tracking
  const resetTracking = useCallback(() => {
    stopTracking();
    trackingRef.current = {
      isActive: false,
      startTime: 0,
      lastUpdateTime: 0,
      timeSpentInterval: null,
      progressUpdates: []
    };
  }, [stopTracking]);

  // Pause tracking
  const pauseTracking = useCallback(() => {
    if (trackingRef.current.isActive) {
      trackingRef.current.isActive = false;
      
      // Update any accumulated progress
      if (trackingRef.current.progressUpdates.length > 0) {
        const updates = [...trackingRef.current.progressUpdates];
        trackingRef.current.progressUpdates = [];
        
        updateProgress(
          updates.reduce((total, update) => total + update.timeSpent, 0),
          updates.reduce((total, update) => total + update.durationWatched, 0)
        );
      }
    }
  }, [updateProgress]);

  // Resume tracking
  const resumeTracking = useCallback(() => {
    if (!trackingRef.current.isActive) {
      trackingRef.current.isActive = true;
      trackingRef.current.lastUpdateTime = Date.now();
    }
  }, []);

  // Calculate completion percentage
  const calculateCompletionPercentage = useCallback((durationWatched: number) => {
    if (estimatedDuration <= 0) return 0;
    return Math.min(100, (durationWatched / estimatedDuration) * 100);
  }, [estimatedDuration]);

  // Get progress logs
  const getProgressLogs = useCallback(async () => {
    try {
      const response = await apiClient.get(`/sections/${sectionId}/progress/logs`);
      return response.data.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load progress logs');
      return null;
    }
  }, [sectionId]);

  // Initialize progress on mount
  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      resetTracking();
    };
  }, [resetTracking]);

  return {
    progress,
    isTracking,
    error,
    loadProgress,
    updateProgress,
    startTracking,
    stopTracking,
    resetTracking,
    pauseTracking,
    resumeTracking,
    getProgressLogs,
    calculateCompletionPercentage,
    // Computed values
    completionPercentage: progress?.completionPercentage || 0,
    timeSpent: progress?.timeSpent || 0,
    durationWatched: progress?.durationWatched || 0,
    isCompleted: progress?.isCompleted || false
  };
};