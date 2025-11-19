import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks';
import { fetchCourseById, createSection, updateCourse, updateSection } from '../features/courses/coursesSlice';
import SectionEditor from '../components/CourseEditor/SectionEditor';
import RichTextEditor from '../components/RichTextEditor/RichTextEditor';
import '../components/RichTextEditor/RichTextEditor.css';

const CourseEditor: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { selectedCourse: course, loading } = useAppSelector((state: any) => state.courses);
  const [editMode, setEditMode] = useState(false);
  const [editBasicInfo, setEditBasicInfo] = useState(false);
  const [saving, setSaving] = useState(false);
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    instructor: '',
    duration: 0,
    enrollmentType: 'free' as 'free' | 'paid' | 'approval',
    price: 0,
    currency: 'INR',
    isPublic: false,
    maxStudents: undefined as number | undefined,
    enrollmentDeadline: '',
    startDate: '',
    endDate: '',
    tags: [] as string[],
    category: undefined as string | undefined,
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (id) {
      dispatch(fetchCourseById(id));
    }
  }, [id, dispatch]);

  // Populate form data when course loads
  useEffect(() => {
    if (course) {
      setCourseData({
        title: course.title || '',
        description: course.description || '',
        instructor: course.instructor || '',
        duration: course.duration || 0,
        enrollmentType: course.enrollmentType || 'free',
        price: course.price || 0,
        currency: course.currency || 'INR',
        isPublic: course.isPublic || false,
        maxStudents: course.maxStudents,
        enrollmentDeadline: course.enrollmentDeadline || '',
        startDate: course.startDate || '',
        endDate: course.endDate || '',
        tags: course.tags || [],
        category: course.category || undefined,
      });
    }
  }, [course]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let processedValue: any = value;
    
    if (name === 'duration') {
      processedValue = parseInt(value) || 0;
    } else if (name === 'price') {
      processedValue = parseFloat(value) || 0;
    } else if (name === 'maxStudents') {
      processedValue = value ? parseInt(value) || undefined : undefined;
    } else if (name === 'isPublic') {
      processedValue = (e.target as HTMLInputElement).checked;
    } else if (name === 'enrollmentType') {
      processedValue = value as 'free' | 'paid' | 'approval';
    } else if (name === 'tags') {
      processedValue = value.split(',').map(tag => tag.trim()).filter(tag => tag);
    }
    
    setCourseData(prev => ({
      ...prev,
      [name]: processedValue,
    }));
  };

  const handleDescriptionChange = (content: string) => {
    setCourseData(prev => ({
      ...prev,
      description: content,
    }));
  };

  const handleSaveCourse = async () => {
    if (!course?._id) return;
    
    setSaving(true);
    setError('');
    
    try {
      const courseUpdateData: any = { ...courseData };
      
      // Handle category - only include if it has a value
      if (courseData.category) {
        courseUpdateData.category = courseData.category;
      } else {
        delete courseUpdateData.category;
      }
      
      await dispatch(updateCourse({ id: course._id, data: courseUpdateData }));
      setEditBasicInfo(false);
      // Refresh course data
      dispatch(fetchCourseById(course._id));
    } catch (err: any) {
      setError(err.message || 'Failed to update course');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    // Navigate to a preview route or open in new tab
    const previewUrl = `/courses/view/${course?._id}`;
    window.open(previewUrl, '_blank');
  };

  const handleAddSection = async () => {
    const title = prompt('Enter section title:') || 'Untitled Section';
    if (!course) return;
    try {
      await dispatch(createSection({ courseId: course._id, section: { title, description: '' } }));
      // Refresh course data after creating section
      dispatch(fetchCourseById(course._id));
    } catch (error) {
      console.error('Failed to create section:', error);
    }
  };

  // Helper function to build section tree
  const buildSectionTree = (sections: any[]): any[] => {
    const sectionMap = new Map<string, any>();
    const rootSections: any[] = [];

    // First pass: create map of all sections
    sections.forEach(section => {
      sectionMap.set(section._id, { ...section });
    });

    // Second pass: build hierarchy
    sections.forEach(section => {
      if (section.parentSection && sectionMap.has(section.parentSection)) {
        // This section has a parent, add it to parent's children
        const parent = sectionMap.get(section.parentSection)!;
        if (!parent.children) {
          parent.children = [];
        }
        parent.children.push(section);
      } else {
        // This is a root section
        rootSections.push(section);
      }
    });

    // Sort sections by order
    rootSections.sort((a, b) => (a.order || 0) - (b.order || 0));
    
    return rootSections;
  };

  // Helper function to flatten section tree
  const flattenSectionTree = (sections: any[], parentSection?: string): any[] => {
    let flattened: any[] = [];
    
    sections.forEach((section, index) => {
      // Update section with new parent and order
      const updatedSection = {
        ...section,
        parentSection,
        order: index,
        children: undefined // Remove children for flattened view
      };
      
      flattened.push(updatedSection);
      
      // Add children if they exist
      if (section.children && section.children.length > 0) {
        flattened = flattened.concat(flattenSectionTree(section.children, section._id));
      }
    });
    
    return flattened;
  };

  // Drag and drop functionality for sections
  const handleSectionDragStart = (e: React.DragEvent, sectionId: string, sectionTitle: string) => {
    e.dataTransfer.setData('sectionId', sectionId);
    e.dataTransfer.setData('sectionTitle', sectionTitle);
    e.dataTransfer.setData('sourceParentId', 'root'); // For now, assume root level
    e.dataTransfer.effectAllowed = 'move';
    
    // Add visual feedback for dragged element
    const target = e.target as HTMLElement;
    const dragElement = target.closest('[draggable]') as HTMLElement;
    if (dragElement) {
      dragElement.classList.add('opacity-50', 'border-2', 'border-blue-500', 'shadow-lg');
      // Set custom drag image with clear indication
      const dragImage = document.createElement('div');
      dragImage.innerHTML = `<div class="bg-blue-500 text-white px-3 py-1 rounded text-sm shadow font-medium">📄 ${sectionTitle}</div>`;
      document.body.appendChild(dragImage);
      e.dataTransfer.setDragImage(dragImage, 0, 0);
      setTimeout(() => dragImage.remove(), 0);
    }
  };

  const handleSectionDragOver = (e: React.DragEvent, targetSectionId: string, targetSectionTitle: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'link'; // Use 'link' to indicate creating parent-child relationship
    
    // Add visual feedback for drop zone with parent indication
    const target = e.target as HTMLElement;
    const dropElement = target.closest('.bg-white, .dark\\:bg-gray-800') as HTMLElement;
    if (dropElement && !dropElement.classList.contains('opacity-50')) {
      dropElement.classList.add('ring-2', 'ring-green-500', 'bg-green-50', 'dark\\:bg-green-900/20', 'shadow-md', 'border-2', 'border-dashed');
      
      // Add a "+" indicator to show this will become a parent
      let indicator = dropElement.querySelector('.parent-indicator');
      if (!indicator) {
        indicator = document.createElement('div');
        indicator.className = 'parent-indicator absolute -top-2 -left-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg animate-pulse';
        indicator.innerHTML = '<span class="text-white text-sm font-bold">+ 📄</span>';
        dropElement.appendChild(indicator);
        
        // Add parent label
        let parentLabel = dropElement.querySelector('.parent-label');
        if (!parentLabel) {
          parentLabel = document.createElement('div');
          parentLabel.className = 'parent-label absolute -top-8 left-0 text-xs text-green-600 dark:text-green-400 font-medium';
          parentLabel.textContent = 'Will become PARENT';
          dropElement.appendChild(parentLabel);
        }
      }
    }
  };

  const handleSectionDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Remove visual feedback
    const target = e.target as HTMLElement;
    const dropElement = target.closest('.bg-white, .dark\\:bg-gray-800') as HTMLElement;
    if (dropElement) {
      dropElement.classList.remove('ring-2', 'ring-green-500', 'bg-green-50', 'dark\\:bg-green-900/20', 'shadow-md', 'border-2', 'border-dashed');
      
      // Remove parent indicator and label
      const indicator = dropElement.querySelector('.parent-indicator');
      if (indicator) {
        indicator.remove();
      }
      const parentLabel = dropElement.querySelector('.parent-label');
      if (parentLabel) {
        parentLabel.remove();
      }
    }
  };

  const handleSectionDrop = async (e: React.DragEvent, targetSectionId: string, targetSectionTitle: string) => {
    e.preventDefault();
    
    // Remove visual feedback
    const target = e.target as HTMLElement;
    const dropElement = target.closest('.bg-white, .dark\\:bg-gray-800') as HTMLElement;
    if (dropElement) {
      dropElement.classList.remove('ring-2', 'ring-green-500', 'bg-green-50', 'dark\\:bg-green-900/20', 'shadow-md', 'border-2', 'border-dashed');
      
      // Remove parent indicator and label
      const indicator = dropElement.querySelector('.parent-indicator');
      if (indicator) {
        indicator.remove();
      }
      const parentLabel = dropElement.querySelector('.parent-label');
      if (parentLabel) {
        parentLabel.remove();
      }
    }
    
    const draggedSectionId = e.dataTransfer.getData('sectionId');
    const draggedSectionTitle = e.dataTransfer.getData('sectionTitle');
    
    // Prevent dropping on itself
    if (draggedSectionId === targetSectionId) return;
    
    // Show confirmation dialog with clear section-subsection indication and visual preview
    const confirmMessage = `🎯 CREATE SECTION-SUBSECTION RELATIONSHIP\n\n📄 "${draggedSectionTitle}" → 📋 "${targetSectionTitle}"\n\nThis will:\n✅ Make "${targetSectionTitle}" the SECTION\n✅ Make "${draggedSectionTitle}" the SUBSECTION\n✅ Create hierarchical structure\n\nConfirm this action?`;
    
    if (!confirm(confirmMessage)) {
      return;
    }
    
    console.log('🎯 Creating section-subsection relationship:', {
      subsectionSectionId: draggedSectionId,
      subsectionTitle: draggedSectionTitle,
      parentSectionId: targetSectionId,
      sectionTitle: targetSectionTitle
    });
    
    try {
      // Make the dragged section a child of the target section
      await dispatch(updateSection({
        id: draggedSectionId,
        data: {
          parentSection: targetSectionId
        }
      }));
      
      // Show success message with clear indication
      alert(`✅ SUCCESS!\n\n📄 "${draggedSectionTitle}" is now a SUBSECTION of 📋 "${targetSectionTitle}"\n\nThe hierarchy has been updated successfully.`);
      
      // Refresh course data
      dispatch(fetchCourseById(course._id));
    } catch (error) {
      console.error('❌ Failed to update section hierarchy:', error);
      alert('❌ Failed to update section hierarchy. Please try again.');
    }
  };

  const handleRefreshCourse = () => {
    if (course) {
      dispatch(fetchCourseById(course._id));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading course...</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <p className="text-xl text-gray-600 dark:text-gray-400 mb-4">Course not found</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Recursive SectionItem component for hierarchical display
  const SectionItem: React.FC<{
    section: any;
    level: number;
    onDragStart: (e: React.DragEvent, sectionId: string, sectionTitle: string) => void;
    onDragOver: (e: React.DragEvent, targetSectionId: string, targetSectionTitle: string) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onDrop: (e: React.DragEvent, targetSectionId: string, targetSectionTitle: string) => void;
    onUpdate: () => void;
  }> = ({ section, level, onDragStart, onDragOver, onDragLeave, onDrop, onUpdate }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const hasChildren = !!(section.children && section.children.length > 0);

    return (
      <div className={`relative transition-all duration-300 ease-in-out`}>
        {/* Hierarchy connection lines */}
        {level > 0 && (
          <>
            {/* Vertical line for this level */}
            <div className="absolute left-6 top-0 bottom-12 w-0.5 bg-gray-200 dark:bg-gray-600"></div>
            {/* Horizontal connector line */}
            <div className="absolute left-6 top-4 w-4 h-0.5 bg-gray-200 dark:bg-gray-600"></div>
          </>
        )}
        
        {/* Section Card with proper indentation and positioning */}
        <div 
          className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-all duration-200 ${
            level > 0 ? `ml-${level * 12} pl-8` : 'ml-0'
          }`}
          draggable
          onDragStart={(e) => onDragStart(e, section._id, section.title)}
          onDragOver={(e) => onDragOver(e, section._id, section.title)}
          onDragLeave={onDragLeave}
          onDrop={(e) => onDrop(e, section._id, section.title)}
        >
          <div className="flex items-start gap-3">
            {/* Drag Handle */}
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-gray-400 cursor-grab hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
                <path d="M7 2a1 1 0 011-1h4a1 1 0 011 1v1a1 1 0 01-1 1H8a1 1 0 01-1-1V2zM4 5a1 1 0 011-1h10a1 1 0 011 1v1a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 9a1 1 0 011-1h10a1 1 0 011 1v1a1 1 0 01-1 1H5a1 1 0 01-1-1V9zM4 13a1 1 0 011-1h10a1 1 0 011 1v1a1 1 0 01-1 1H5a1 1 0 01-1-1v-1zM7 17a1 1 0 011-1h4a1 1 0 011 1v1a1 1 0 01-1 1H8a1 1 0 01-1-1v-1z" />
              </svg>
            </div>

            {/* Section Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-3 mb-2">
                {/* Hierarchy depth indicator with better visual */}
                <div className="flex-shrink-0 mt-1">
                  {level > 0 ? (
                    <div className="flex items-center gap-1">
                      {Array.from({ length: level }, (_, i) => (
                        <div key={i} className="w-3 h-3 bg-blue-500 rounded-sm border-2 border-white dark:border-gray-800 shadow-sm"></div>
                      ))}
                    </div>
                  ) : (
                    <div className="w-3 h-3 bg-gray-300 dark:bg-gray-600 rounded-sm"></div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-gray-900 dark:text-white flex-1 text-xl">
                      {section.title}
                    </h4>
                    
                    {/* Section/Subsection status indicators */}
                    {section.parentSection && (
                      <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900 px-2 py-1 rounded-full font-medium whitespace-nowrap">
                        📄 SUBSECTION
                      </span>
                    )}
                    {hasChildren && (
                      <span className="text-xs text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900 px-2 py-1 rounded-full font-medium whitespace-nowrap">
                        📋 SECTION
                      </span>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 mt-1 text-xs text-gray-500 dark:text-gray-400">
                    <span className="flex items-center gap-1">
                      📝 {section.activities?.length || 0} activities
                    </span>
                    <span className="flex items-center gap-1">
                      📊 Order: {section.order || 0}
                    </span>
                    {hasChildren && (
                      <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                        📄 {section.children.length} subsections
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Expand/collapse for subsections */}
                {hasChildren && (
                  <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex-shrink-0 ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    title={isExpanded ? "Collapse subsections" : "Expand subsections"}
                  >
                    <svg className={`w-5 h-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                )}
              </div>
              
              {/* Subsection titles in footer for sections */}
              {hasChildren && (
                <div className={`transition-all duration-300 ease-in-out overflow-hidden ${
                  isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-2 flex items-center gap-1">
                      📄 SUBSECTIONS:
                    </div>
                    <div className="space-y-2">
                      {section.children.map((subsection: any, index: number) => (
                        <div key={subsection._id} className="flex items-center gap-3 text-sm text-gray-700 dark:text-gray-300 p-2 bg-gray-50 dark:bg-gray-700/30 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors border border-gray-200 dark:border-gray-600">
                          <span className="text-xs text-gray-500 dark:text-gray-400 font-mono font-medium bg-white dark:bg-gray-800 px-2 py-1 rounded w-8 text-center border border-gray-300 dark:border-gray-600">
                            {index + 1}
                          </span>
                          <span className="flex-1 font-medium">{subsection.title}</span>
                          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <span>{subsection.activities?.length || 0}</span>
                            <span>📝</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Children Sections */}
          {hasChildren && isExpanded && (
            <div className="relative mt-6 space-y-4">
              {/* Main vertical connection line for children */}
              <div className="absolute left-6 top-8 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-600"></div>
              
              <div className="ml-12 space-y-4">
                {section.children.map((childSection: any, index: number) => (
                  <div key={childSection._id} className="relative">
                    {/* Horizontal connector line for each child */}
                    <div className="absolute left-0 top-4 w-6 h-0.5 bg-gray-200 dark:bg-gray-600"></div>
                    
                    <SectionItem
                      section={childSection}
                      level={level + 1}
                      onDragStart={onDragStart}
                      onDragOver={onDragOver}
                      onDragLeave={onDragLeave}
                      onDrop={onDrop}
                      onUpdate={onUpdate}
                    />
                    
                    {/* Last child connector line extension */}
                    {index === section.children.length - 1 && level === 0 && (
                      <div className="absolute left-6 top-8 w-0.5 h-4 bg-gray-200 dark:bg-gray-600"></div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Go back"
            >
              ←
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {course.title}
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">Course Editor</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setEditMode(!editMode)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                editMode
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'bg-green-600 hover:bg-green-700 text-white'
              }`}
            >
              {editMode ? '🔒 Turn Editing Off' : '🔓 Turn Editing On'}
            </button>

            <button
              onClick={() => setEditBasicInfo(!editBasicInfo)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                editBasicInfo
                  ? 'bg-orange-600 hover:bg-orange-700 text-white'
                  : 'bg-yellow-600 hover:bg-yellow-700 text-white'
              }`}
            >
              {editBasicInfo ? '📝 Save Basic Info' : '✏️ Edit Basic Info'}
            </button>

            <button
              onClick={handlePreview}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              👁️ Preview Course
            </button>

            {editMode && (
              <button
                onClick={handleAddSection}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                + Add Section
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Basic Course Information */}
      <div className="max-w-5xl mx-auto p-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Basic Course Information</h2>
          </div>

          {editBasicInfo ? (
            <form onSubmit={handleSaveCourse} className="space-y-6">
              {/* Course Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Course Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={courseData?.title || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter course title"
                  required
                />
              </div>

              {/* Course Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Course Description *
                </label>
                <RichTextEditor
                  value={courseData?.description || ''}
                  onChange={handleDescriptionChange}
                  placeholder="Describe your course..."
                />
              </div>

              {/* Instructor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Instructor *
                </label>
                <input
                  type="text"
                  name="instructor"
                  value={courseData?.instructor || ''}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter instructor name"
                  required
                />
              </div>

              {/* Enrollment Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Enrollment Type *
                </label>
                <select
                  name="enrollmentType"
                  value={courseData?.enrollmentType || 'free'}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="free">Free</option>
                  <option value="paid">Paid</option>
                  <option value="approval">Approval Required</option>
                </select>
              </div>

              {/* Pricing */}
              {(courseData?.enrollmentType === 'paid') && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Price
                    </label>
                    <input
                      type="number"
                      name="price"
                      step="0.01"
                      min="0"
                      value={courseData?.price || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Currency
                    </label>
                    <input
                      type="text"
                      name="currency"
                      value={courseData?.currency || 'USD'}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      placeholder="USD"
                    />
                  </div>
                </div>
              )}

              {/* Duration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Duration (hours) *
                  </label>
                  <input
                    type="number"
                    name="duration"
                    step="0.5"
                    min="0.5"
                    value={courseData?.duration || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="1.0"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={courseData?.tags?.join(', ') || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    placeholder="javascript, react, programming"
                  />
                </div>
              </div>

              {/* Scheduling */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="startDate"
                    value={courseData?.startDate?.split('T')[0] || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    name="endDate"
                    value={courseData?.endDate?.split('T')[0] || ''}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Public Visibility */}
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isPublic"
                    checked={courseData?.isPublic || false}
                    onChange={handleInputChange}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Make this course publicly visible
                  </span>
                </label>
              </div>

              {/* Form Actions */}
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg font-medium transition-colors"
                >
                  {saving ? '💾 Saving...' : '💾 Save Course'}
                </button>
                <button
                  type="button"
                  onClick={() => setEditBasicInfo(false)}
                  disabled={saving}
                  className="px-6 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>

              {/* Error Display */}
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
                </div>
              )}
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Instructor</span>
                  <p className="font-medium text-gray-900 dark:text-white">{courseData?.instructor || 'Not specified'}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Duration</span>
                  <p className="font-medium text-gray-900 dark:text-white">{courseData?.duration || 'Not specified'} hours</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Enrollment Type</span>
                  <p className="font-medium text-gray-900 dark:text-white capitalize">{courseData?.enrollmentType || 'free'}</p>
                </div>
              </div>
              
              {courseData?.enrollmentType === 'paid' && (
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Price</span>
                  <p className="font-medium text-gray-900 dark:text-white">{courseData?.currency || 'USD'} {courseData?.price || 0}</p>
                </div>
              )}

              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Description</span>
                <div className="mt-1 text-gray-700 dark:text-gray-300 prose max-w-none">
                  {courseData?.description ? (
                    <div dangerouslySetInnerHTML={{ __html: courseData.description }} />
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">No description provided</p>
                  )}
                </div>
              </div>

              {courseData?.tags && courseData.tags.length > 0 && (
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">Tags</span>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {courseData.tags.map((tag: string) => (
                      <span key={tag} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full dark:bg-blue-900 dark:text-blue-200">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto p-6">
        {/* Course Overview Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 mb-8 border border-gray-200 dark:border-gray-700">
          <div className="flex gap-6">
            {course.imageUrl && (
              <img
                src={course.imageUrl}
                alt={course.title}
                className="w-32 h-32 object-cover rounded-lg flex-shrink-0"
              />
            )}
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {course.title}
              </h2>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {course.description}
              </p>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Sections</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {course.sections?.length || 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Enrolled</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {course.registeredUsers?.length || 0}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Duration</p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {course.duration} hours
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 dark:text-gray-400">Status</p>
                  <p className="font-semibold text-green-600 dark:text-green-400">
                    {editMode ? '✏️ Editing' : '👁️ Viewing'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sections */}
        {editMode ? (
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Course Structure
              </h2>
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Drag and drop sections to organize hierarchy
                </div>
                <button
                  onClick={handleAddSection}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                >
                  + Add Section
                </button>
              </div>
            </div>

            {course.sections && course.sections.length > 0 ? (
              <div className="space-y-6">
                {course.sections.map((section: any, index: number) => (
                  <div key={section._id} className="relative">
                    {/* Root level vertical connection line */}
                    {index < course.sections.length - 1 && (
                      <div className="absolute left-0 top-20 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-600"></div>
                    )}
                    
                    <SectionItem
                      section={section}
                      level={0}
                      onDragStart={handleSectionDragStart}
                      onDragOver={handleSectionDragOver}
                      onDragLeave={handleSectionDragLeave}
                      onDrop={handleSectionDrop}
                      onUpdate={handleRefreshCourse}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <p className="text-gray-600 dark:text-gray-400 mb-4">No sections yet.</p>
                <button
                  onClick={handleAddSection}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
                >
                  Create First Section
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-center">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              Turn on editing to modify sections, activities, and course content.
            </p>
            <button
              onClick={() => setEditMode(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
            >
              Enable Editing
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default CourseEditor;
