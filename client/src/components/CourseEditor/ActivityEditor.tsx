import React, { useState } from 'react';
import { useAppDispatch } from '../../hooks';
import {
  toggleActivityVisibility,
  updateActivity,
  deleteActivity,
} from '../../features/courses/coursesSlice';

interface ActivityEditorProps {
  activity: any;
  activityIndex: number;
  sectionId: string;
  courseId: string;
  onRefresh: () => void;
}

const ActivityEditor: React.FC<ActivityEditorProps> = ({
  activity,
  onRefresh,
}) => {
  const dispatch = useAppDispatch();
  const [isEditingSettings, setIsEditingSettings] = useState(false);
  const [title, setTitle] = useState(activity.title || '');
  const [description, setDescription] = useState(activity.description || '');

  const getActivityIcon = (type: string) => {
    const icons: Record<string, string> = {
      assignment: '📝',
      quiz: '❓',
      forum: '💬',
      lesson: '📖',
      video: '🎥',
      resource: '📄',
    };
    return icons[type] || '🔗';
  };

  const handleToggleVisibility = async () => {
    try {
      await dispatch(
        toggleActivityVisibility({ activityId: activity._id, isHidden: !activity.isHidden })
      );
      onRefresh();
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
    }
  };

  const handleSaveSettings = async () => {
    try {
      await dispatch(
        updateActivity({ activityId: activity._id, data: { title, description } })
      );
      setIsEditingSettings(false);
      onRefresh();
    } catch (error) {
      console.error('Failed to update activity:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try {
      await dispatch(deleteActivity(activity._id));
      onRefresh();
    } catch (error) {
      console.error('Failed to delete activity:', error);
    }
  };

  return (
    <div className="p-3 bg-gray-100 dark:bg-gray-750 rounded-lg border border-gray-300 dark:border-gray-600">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{getActivityIcon(activity.type)}</span>
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
              {activity.type}
            </span>
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {title || 'Untitled Activity'}
            </span>
          </div>
          {description && !isEditingSettings && (
            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">{description}</p>
          )}
        </div>

        {/* Edit Icons */}
        <div className="flex items-center gap-1 ml-2">
          {/* Visibility Toggle */}
          <button
            onClick={handleToggleVisibility}
            title={activity.isHidden ? 'Show activity' : 'Hide from students'}
            className={`p-1.5 rounded text-xs transition-colors ${
              activity.isHidden
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'
            }`}
          >
            {activity.isHidden ? '👁️‍🗨️' : '👁️'}
          </button>

          {/* Edit Settings */}
          <button
            onClick={() => setIsEditingSettings(!isEditingSettings)}
            title="Edit activity settings"
            className="p-1.5 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded text-xs hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors"
          >
            ✏️
          </button>

          {/* Delete */}
          <button
            onClick={handleDelete}
            title="Delete activity"
            className="p-1.5 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded text-xs hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Edit Settings */}
      {isEditingSettings && (
        <div className="mt-3 pt-3 border-t border-gray-300 dark:border-gray-600">
          <div className="mb-2">
            <label className="block text-xs font-medium text-gray-900 dark:text-white mb-1">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div className="mb-2">
            <label className="block text-xs font-medium text-gray-900 dark:text-white mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex gap-2 justify-end">
            <button
              onClick={handleSaveSettings}
              className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => {
                setIsEditingSettings(false);
                setTitle(activity.title || '');
                setDescription(activity.description || '');
              }}
              className="px-3 py-1 text-xs bg-gray-400 hover:bg-gray-500 text-white rounded transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityEditor;
