import React, { useState } from 'react';
import { X, FileText, BookOpen, Upload, File, X as XIcon } from 'lucide-react';

interface CreateActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionId: string;
  onActivityCreated: () => void;
}

interface AssignmentFormData {
  title: string;
  description: string;
  maxPoints: number;
  dueDate: string;
  submissionType: 'file' | 'text' | 'both';
  allowLateSubmissions: boolean;
  lateSubmissionPenalty: number;
}

interface FileUpload {
  file: File;
  id: string;
  name: string;
  size: number;
}

const CreateActivityModal: React.FC<CreateActivityModalProps> = ({
  isOpen,
  onClose,
  sectionId,
  onActivityCreated
}) => {
  const [activeTab, setActiveTab] = useState<'assignment' | 'quiz'>('assignment');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Assignment form data
  const [assignmentData, setAssignmentData] = useState<AssignmentFormData>({
    title: '',
    description: '',
    maxPoints: 100,
    dueDate: '',
    submissionType: 'file',
    allowLateSubmissions: false,
    lateSubmissionPenalty: 10
  });

  // File upload state
  const [files, setFiles] = useState<FileUpload[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      
      // First upload files if any
      let uploadedFiles = [];
      if (files.length > 0) {
        for (const file of files) {
          const formData = new FormData();
          formData.append('file', file.file);
          
          const uploadResponse = await fetch(`${apiUrl}/upload`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData
          });

          if (uploadResponse.ok) {
            const uploadResult = await uploadResponse.json();
            uploadedFiles.push({
              filename: file.name,
              url: uploadResult.data.url || uploadResult.data.downloadUrl
            });
          }
        }
      }
      
      if (activeTab === 'assignment') {
        // Create assignment
        const response = await fetch(`${apiUrl}/assignments/create-activity`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sectionId,
            assignment: {
              title: assignmentData.title,
              description: assignmentData.description,
              maxPoints: assignmentData.maxPoints,
              dueDate: assignmentData.dueDate,
              submissionType: assignmentData.submissionType,
              allowLateSubmissions: assignmentData.allowLateSubmissions,
              lateSubmissionPenalty: assignmentData.lateSubmissionPenalty,
              additionalFiles: uploadedFiles
            }
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create assignment');
        }

        const result = await response.json();
        console.log('Assignment created:', result);
      } else if (activeTab === 'quiz') {
        // Create quiz (placeholder for now)
        const response = await fetch(`${apiUrl}/activities`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            sectionId,
            type: 'quiz',
            title: assignmentData.title,
            description: assignmentData.description,
            additionalFiles: uploadedFiles
          })
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create quiz');
        }

        const result = await response.json();
        console.log('Quiz created:', result);
      }

      // Refresh the section data
      onActivityCreated();
      onClose();
      
    } catch (err: any) {
      console.error('Error creating activity:', err);
      setError(err.message || 'An error occurred while creating the activity');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setAssignmentData(prev => ({
      ...prev,
      [name]: checked !== undefined ? checked : value
    }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const newFiles: FileUpload[] = selectedFiles.map(file => ({
        file,
        id: Math.random().toString(36),
        name: file.name,
        size: file.size
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New Activity</h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
              {error}
            </div>
          )}

          {/* Activity Type Tabs */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('assignment')}
                className={`whitespace-nowrap py-2 px-4 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === 'assignment'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Assignment</span>
              </button>
              <button
                onClick={() => setActiveTab('quiz')}
                className={`whitespace-nowrap py-2 px-4 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === 'quiz'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BookOpen className="h-4 w-4" />
                <span>Quiz</span>
              </button>
            </nav>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Basic Activity Fields */}
            <div className="grid grid-cols-1 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Activity Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={assignmentData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter activity title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={assignmentData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter activity description"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Points
                </label>
                <input
                  type="number"
                  name="maxPoints"
                  value={assignmentData.maxPoints}
                  onChange={handleInputChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Due Date
                </label>
                <input
                  type="datetime-local"
                  name="dueDate"
                  value={assignmentData.dueDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Assignment-specific fields */}
            {activeTab === 'assignment' && (
              <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Assignment Settings</h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Submission Type
                  </label>
                  <select
                    name="submissionType"
                    value={assignmentData.submissionType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="file">File Upload</option>
                    <option value="text">Text Entry</option>
                    <option value="both">File + Text</option>
                  </select>
                </div>

                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      name="allowLateSubmissions"
                      checked={assignmentData.allowLateSubmissions}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      Allow late submissions
                    </span>
                  </label>
                </div>

                {assignmentData.allowLateSubmissions && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Late Submission Penalty (% per day)
                    </label>
                    <input
                      type="number"
                      name="lateSubmissionPenalty"
                      value={assignmentData.lateSubmissionPenalty}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}

                {/* File Upload Section for Instructor Materials */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Materials for Students
                  </label>
                  <div className="border-2 border-gray-300 border-dashed rounded-lg p-4 text-center hover:border-blue-500 hover:bg-blue-50/5 transition-colors">
                    <input 
                      type="file" 
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      id="assignment-files"
                    />
                    <label 
                      htmlFor="assignment-files"
                      className="cursor-pointer flex flex-col items-center space-y-2"
                    >
                      <Upload className="h-8 w-8 text-gray-400" />
                      <span className="text-sm text-gray-600">
                        Drop files here or click to upload
                      </span>
                      <span className="text-xs text-gray-500">
                        Support for PDF, DOC, DOCX, TXT, ZIP files
                      </span>
                    </label>
                  </div>
                  
                  {/* File List */}
                  {files.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {files.map((file) => (
                        <div key={file.id} className="flex items-center space-x-2 p-2 bg-white rounded-lg border">
                          <File className="h-4 w-4 text-gray-500" />
                          <span className="text-sm flex-1">{file.name}</span>
                          <span className="text-xs text-gray-500">{formatFileSize(file.size)}</span>
                          <button
                            onClick={() => removeFile(file.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <XIcon className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {loading && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>}
                <span>Create Activity</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateActivityModal;