import React, { useState } from 'react';
import { useAppDispatch } from '../../hooks';
import {
  toggleSectionVisibility,
  updateSectionDescription,
  deleteSection,
  duplicateSection,
} from '../../features/courses/coursesSlice';
import ActivityEditor from './ActivityEditor';
import RichTextEditor from '../RichTextEditor/RichTextEditor';
import RichTextRenderer from '../RichTextRenderer/RichTextRenderer';

interface SectionEditorProps {
  section: any;
  courseId: string;
  sectionIndex: number;
  onRefresh: () => void;
}

const SectionEditor: React.FC<SectionEditorProps> = ({ section, courseId, sectionIndex, onRefresh }) => {
  const dispatch = useAppDispatch();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [descriptionText, setDescriptionText] = useState(section.description || '');
  const [sectionTitle, setSectionTitle] = useState(section.title || section.sectionTitle || '');
  const [mediaType, setMediaType] = useState<'video' | 'image' | undefined>(section.media?.type);
  const [mediaUrl, setMediaUrl] = useState(section.media?.url || '');
  const [mediaThumbnail, setMediaThumbnail] = useState(section.media?.thumbnail || '');
  const [mediaAlt, setMediaAlt] = useState(section.media?.alt || '');

  const handleToggleVisibility = async () => {
    try {
      await dispatch(toggleSectionVisibility({ sectionId: section._id, isHidden: !section.isHidden }));
      onRefresh();
    } catch (error) {
      console.error('Failed to toggle visibility:', error);
    }
  };

  const handleSaveDescription = async () => {
    try {
      const mediaData = mediaType ? {
        type: mediaType,
        url: mediaUrl,
        thumbnail: mediaThumbnail || undefined,
        alt: mediaAlt || undefined,
      } : undefined;

      await dispatch(
        updateSectionDescription({
          sectionId: section._id,
          description: descriptionText,
          title: sectionTitle,
          media: mediaData,
        })
      );
      setIsEditingDescription(false);
      onRefresh();
    } catch (error) {
      console.error('Failed to update description:', error);
    }
  };

  const handleDuplicate = async () => {
    try {
      await dispatch(duplicateSection({ id: section._id, courseId }));
      onRefresh();
    } catch (error) {
      console.error('Failed to duplicate section:', error);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Delete section "${sectionTitle}"? This cannot be undone.`)) return;
    try {
      await dispatch(deleteSection({ id: section._id, courseId }));
      onRefresh();
    } catch (error) {
      console.error('Failed to delete section:', error);
    }
  };

  return (
    <div className="mb-6 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm bg-white dark:bg-gray-800">
      {/* Section Header */}
      <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 flex items-center justify-between border-b border-gray-300 dark:border-gray-600">
        <div className="flex items-center gap-3 flex-1">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? '▼' : '▶'}
          </button>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {sectionIndex + 1}. {sectionTitle || 'Untitled Section'}
          </h3>
        </div>

        {/* Edit Icons */}
        <div className="flex items-center gap-2">
          {/* Visibility Toggle */}
          <button
            onClick={handleToggleVisibility}
            title={section.isHidden ? 'Show section' : 'Hide from students'}
            className={`p-2 rounded transition-colors ${
              section.isHidden
                ? 'bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200 dark:hover:bg-blue-800'
            }`}
          >
            {section.isHidden ? '👁️‍🗨️' : '👁️'}
          </button>

          {/* Edit Description */}
          <button
            onClick={() => setIsEditingDescription(!isEditingDescription)}
            title="Edit section description"
            className="p-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300 rounded hover:bg-yellow-200 dark:hover:bg-yellow-800 transition-colors"
          >
            ✏️
          </button>

          {/* Duplicate */}
          <button
            onClick={handleDuplicate}
            title="Duplicate section"
            className="p-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
          >
            📋
          </button>

          {/* Delete */}
          <button
            onClick={handleDelete}
            title="Delete section"
            className="p-2 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Description Editor */}
      {isEditingDescription && (
        <div className="px-4 py-4 bg-gray-50 dark:bg-gray-750 border-b border-gray-300 dark:border-gray-600">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
              Section Title
            </label>
            <input
              type="text"
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              placeholder="Section title"
            />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Section Description
            </label>
            <RichTextEditor
              value={descriptionText}
              onChange={setDescriptionText}
              placeholder="Enter section description with rich formatting..."
              height="400px"
              variant="full"
            />
          </div>

          {/* Media Section */}
          <div className="mb-4 p-4 bg-gray-50 dark:bg-gray-750 rounded-lg border border-gray-300 dark:border-gray-600">
            <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Section Media</h4>
            
            {/* Media Type Selection */}
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                Media Type
              </label>
              <select
                value={mediaType || ''}
                onChange={(e) => setMediaType(e.target.value ? (e.target.value as 'video' | 'image') : undefined)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                <option value="">No media</option>
                <option value="video">Video</option>
                <option value="image">Image</option>
              </select>
            </div>

            {/* Media URL */}
            {mediaType && (
              <>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                    Media URL
                  </label>
                  <input
                    type="url"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                    placeholder="Enter video or image URL"
                  />
                </div>

                {/* Thumbnail (for videos) */}
                {mediaType === 'video' && (
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                      Video Thumbnail URL (optional)
                    </label>
                    <input
                      type="url"
                      value={mediaThumbnail}
                      onChange={(e) => setMediaThumbnail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Enter video thumbnail URL"
                    />
                  </div>
                )}

                {/* Alt Text (for images) */}
                {mediaType === 'image' && (
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-1">
                      Image Alt Text
                    </label>
                    <input
                      type="text"
                      value={mediaAlt}
                      onChange={(e) => setMediaAlt(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                      placeholder="Describe the image for accessibility"
                    />
                  </div>
                )}

                {/* Preview */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                    Preview
                  </label>
                  {mediaType === 'video' && mediaUrl && (
                    <video
                      src={mediaUrl}
                      className="w-full max-h-48 object-cover rounded"
                      controls
                      poster={mediaThumbnail}
                    />
                  )}
                  {mediaType === 'image' && mediaUrl && (
                    <img
                      src={mediaUrl}
                      alt={mediaAlt || 'Section media'}
                      className="w-full max-h-48 object-cover rounded"
                    />
                  )}
                </div>
              </>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleSaveDescription}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              Save
            </button>
            <button
              onClick={() => {
                setIsEditingDescription(false);
                setDescriptionText(section.description || '');
                setSectionTitle(section.title || section.sectionTitle || '');
                setMediaType(section.media?.type);
                setMediaUrl(section.media?.url || '');
                setMediaThumbnail(section.media?.thumbnail || '');
                setMediaAlt(section.media?.alt || '');
              }}
              className="px-4 py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Section Content */}
      {isExpanded && (
        <div className="px-4 py-4">
          {/* Section Media Preview */}
          {section.media && !isEditingDescription && (
            <div className="mb-4">
              <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-2">Section Media</h4>
              {section.media.type === 'video' ? (
                <video
                  src={section.media.url}
                  className="w-full max-h-48 object-cover rounded-lg shadow"
                  controls
                  poster={section.media.thumbnail}
                />
              ) : (
                <img
                  src={section.media.url}
                  alt={section.media.alt || 'Section media'}
                  className="w-full max-h-48 object-cover rounded-lg shadow"
                />
              )}
            </div>
          )}

          {section.description && !isEditingDescription && (
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <RichTextRenderer content={section.description} />
            </div>
          )}

          {/* Activities Section */}
          <div className="mt-4">
            <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3">Activities & Resources</h4>
            {section.activities && section.activities.length > 0 ? (
              <div className="space-y-2">
                {section.activities.map((activity: any, idx: number) => (
                  <ActivityEditor
                    key={activity._id}
                    activity={activity}
                    activityIndex={idx}
                    sectionId={section._id}
                    courseId={courseId}
                    onRefresh={onRefresh}
                  />
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400 italic text-sm">No activities in this section.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionEditor;
