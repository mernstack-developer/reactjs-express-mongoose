import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  FileText, 
  Upload, 
  Download, 
  Clock, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  File,
  Save,
  Send
} from 'lucide-react';
import { apiClient } from '../utils/api';
import { uploadFileToServer } from '../utils/upload';

interface Assignment {
  _id: string;
  title: string;
  description: string;
  course: {
    _id: string;
    title: string;
  };
  section: {
    _id: string;
    title: string;
  };
  dueDate: string;
  maxPoints: number;
  submissionType: 'file' | 'text' | 'both';
  additionalFiles: Array<{
    filename: string;
    url: string;
  }>;
  createdAt: string;
}

interface Submission {
  _id: string;
  assignment: string;
  student: string;
  files: Array<{
    filename: string;
    url: string;
  }>;
  text: string;
  submittedAt: string;
  graded: boolean;
  grade?: number;
  feedback?: string;
}

interface FileUpload {
  file: File;
  id: string;
  name: string;
  size: number;
  uploadProgress?: number;
  uploading?: boolean;
  error?: string;
}

const AssignmentPage: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [submission, setSubmission] = useState<Submission | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Form state
  const [textSubmission, setTextSubmission] = useState('');
  const [files, setFiles] = useState<FileUpload[]>([]);
  
  // UI state
  const [activeTab, setActiveTab] = useState<'details' | 'submit' | 'submission'>('details');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    fetchAssignment();
  }, [id]);

  const fetchAssignment = async () => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/assignments/${id}`);
      setAssignment(res.data);
      
      // Check if student has already submitted
      try {
        const subRes = await apiClient.get(`/assignments/${id}/submission`);
        if (subRes.data) {
          setSubmission(subRes.data);
          setActiveTab('submission');
        }
      } catch (subError) {
        // No submission yet
      }
    } catch (err: any) {
      console.error('Error fetching assignment:', err);
      setError(err.message || 'Failed to load assignment');
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      const newFiles: FileUpload[] = selectedFiles.map(file => ({
        file,
        id: Math.random().toString(36),
        name: file.name,
        size: file.size,
        uploadProgress: 0,
        uploading: false
      }));
      
      // Check file size limit (5MB)
      const totalSize = newFiles.reduce((sum, f) => sum + f.size, 0);
      if (totalSize > 5 * 1024 * 1024) {
        setError('Total file size cannot exceed 5MB');
        return;
      }
      
      setFiles(prev => [...prev, ...newFiles]);
      setError('');
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

  const uploadFiles = async (): Promise<Array<{ filename: string; url: string }>> => {
    const uploadedFiles: Array<{ filename: string; url: string }> = [];
    
    for (const fileUpload of files) {
      try {
        setFiles(prev => prev.map(f => 
          f.id === fileUpload.id ? { ...f, uploading: true } : f
        ));
        
        const result = await uploadFileToServer(fileUpload.file);
        const url = result?.data?.url || result?.data?.downloadUrl || result?.url || result;
        
        if (url) {
          uploadedFiles.push({
            filename: fileUpload.name,
            url: url
          });
        }
      } catch (err) {
        setFiles(prev => prev.map(f => 
          f.id === fileUpload.id ? { ...f, error: 'Upload failed' } : f
        ));
      } finally {
        setFiles(prev => prev.map(f => 
          f.id === fileUpload.id ? { ...f, uploading: false } : f
        ));
      }
    }
    
    return uploadedFiles;
  };

  const handleSubmit = async (isDraftSubmission: boolean = false) => {
    if (!id) return;
    
    try {
      setSubmitting(true);
      setError('');
      
      // Validate required fields
      if (!isDraftSubmission) {
        if (assignment?.submissionType === 'file' && files.length === 0) {
          setError('Please upload at least one file for file submission');
          return;
        }
        if (assignment?.submissionType === 'text' && !textSubmission.trim()) {
          setError('Please enter text for text submission');
          return;
        }
        if (assignment?.submissionType === 'both' && files.length === 0 && !textSubmission.trim()) {
          setError('Please provide either a file or text for submission');
          return;
        }
      }
      
      // Upload files if any
      const uploadedFiles = files.length > 0 ? await uploadFiles() : [];
      
      // Prepare submission data
      const payload = {
        text: textSubmission,
        files: uploadedFiles,
        isDraft: isDraftSubmission
      };
      
      if (isDraftSubmission) {
        // Save as draft
        await apiClient.post(`/assignments/${id}/save-draft`, payload);
        setError('');
      } else {
        // Submit assignment
        const response = await apiClient.post(`/assignments/${id}/submit`, payload);
        setSubmission(response.data);
        setActiveTab('submission');
        setError('');
      }
      
      // Clear files after successful submission
      if (!isDraftSubmission) {
        setFiles([]);
        setTextSubmission('');
      }
      
    } catch (err: any) {
      console.error('Error submitting assignment:', err);
      setError(err.message || 'Failed to submit assignment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = () => {
    handleSubmit(true);
  };

  const handleFinalSubmit = () => {
    handleSubmit(false);
  };

  const getStatusInfo = () => {
    if (!assignment) return null;
    
    const now = new Date();
    const dueDate = new Date(assignment.dueDate);
    const isOverdue = now > dueDate;
    
    if (submission) {
      if (submission.graded) {
        return {
          type: 'graded',
          icon: CheckCircle,
          color: 'text-green-600',
          message: `Graded: ${submission.grade || 0}/${assignment.maxPoints} points`
        };
      } else {
        return {
          type: 'submitted',
          icon: Upload,
          color: 'text-blue-600',
          message: 'Submitted - Awaiting grading'
        };
      }
    } else if (isOverdue) {
      return {
        type: 'overdue',
        icon: AlertTriangle,
        color: 'text-red-600',
        message: 'Overdue - Late submission may be penalized'
      };
    } else {
      return {
        type: 'open',
        icon: Clock,
        color: 'text-yellow-600',
        message: `Due ${new Date(assignment.dueDate).toLocaleDateString()}`
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2 w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Assignment Not Found</h2>
            <p className="text-gray-600 mb-6">The assignment you're looking for doesn't exist or has been removed.</p>
            <button
              onClick={() => navigate(-1)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusInfo();

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{assignment.title}</h1>
                <p className="text-gray-600">{assignment.course?.title || 'Unknown Course'}</p>
              </div>
            </div>
            {statusInfo && (
              <div className={`flex items-center space-x-2 ${statusInfo.color}`}>
                <statusInfo.icon className="h-5 w-5" />
                <span className="font-medium">{statusInfo.message}</span>
              </div>
            )}
          </div>
          
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('details')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === 'details'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <FileText className="h-4 w-4" />
                <span>Details</span>
              </button>
              {!submission && (
                <button
                  onClick={() => setActiveTab('submit')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === 'submit'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Upload className="h-4 w-4" />
                  <span>Submit Assignment</span>
                </button>
              )}
              {submission && (
                <button
                  onClick={() => setActiveTab('submission')}
                  className={`pb-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === 'submission'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>My Submission</span>
                </button>
              )}
            </nav>
          </div>
        </div>

        {/* Assignment Details Tab */}
        {activeTab === 'details' && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
                  <div className="text-gray-700 leading-relaxed">
                    {assignment.description || 'No description provided.'}
                  </div>
                </div>

                {/* Additional Materials */}
                {assignment.additionalFiles && assignment.additionalFiles.length > 0 && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Additional Materials</h3>
                    <div className="space-y-2">
                      {assignment.additionalFiles.map((file, index) => (
                        <a
                          key={index}
                          href={file.url}
                          download={file.filename}
                          className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <File className="h-5 w-5 text-blue-600" />
                          <span className="text-blue-600 hover:text-blue-800 font-medium">{file.filename}</span>
                          <Download className="h-4 w-4 text-gray-400 ml-auto" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <h3 className="text-sm font-medium text-blue-900 mb-2">Assignment Info</h3>
                    <div className="space-y-2 text-sm text-blue-800">
                      <div className="flex justify-between">
                        <span>Section:</span>
                        <span className="font-medium">{assignment.section?.title || 'Unknown Section'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Max Points:</span>
                        <span className="font-medium">{assignment.maxPoints}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Submission Type:</span>
                        <span className="font-medium capitalize">{assignment.submissionType}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <h3 className="text-sm font-medium text-yellow-900 mb-2">Due Date</h3>
                    <div className="flex items-center space-x-2 text-yellow-800">
                      <Calendar className="h-4 w-4" />
                      <span className="font-medium">
                        {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : 'No due date set'}
                      </span>
                    </div>
                  </div>

                  {statusInfo && (
                    <div className={`p-4 bg-${statusInfo.type === 'graded' ? 'green' : statusInfo.type === 'submitted' ? 'blue' : statusInfo.type === 'overdue' ? 'red' : 'yellow'}-50 rounded-lg`}>
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Status</h3>
                      <div className="flex items-center space-x-2 text-gray-800">
                        <statusInfo.icon className="h-4 w-4" />
                        <span className="font-medium">{statusInfo.message}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Submit Assignment Tab */}
        {activeTab === 'submit' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Submit Assignment</h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                {error}
              </div>
            )}

            {/* Submission Type Instructions */}
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">Submission Requirements</h3>
              <p className="text-blue-800">
                {assignment.submissionType === 'file' && 'Upload one or more files for your assignment submission.'}
                {assignment.submissionType === 'text' && 'Enter your assignment response in the text area below.'}
                {assignment.submissionType === 'both' && 'You can submit both files and text for this assignment.'}
              </p>
            </div>

            {/* File Upload Section */}
            {(assignment.submissionType === 'file' || assignment.submissionType === 'both') && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Files
                </label>
                <div className="border-2 border-gray-300 border-dashed rounded-lg p-6 text-center hover:border-blue-500 hover:bg-blue-50/5 transition-colors">
                  <input 
                    type="file" 
                    multiple
                    onChange={handleFileSelect}
                    className="hidden"
                    id="assignment-files"
                    accept=".pdf,.doc,.docx,.txt,.zip,.jpg,.jpeg,.png"
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
                      Supported: PDF, DOC, DOCX, TXT, ZIP, JPG, PNG (max 5MB total)
                    </span>
                  </label>
                </div>
                
                {/* File List */}
                {files.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {files.map((file) => (
                      <div key={file.id} className={`flex items-center space-x-3 p-3 rounded-lg border ${file.error ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-gray-50'}`}>
                        <File className="h-5 w-5 text-gray-500" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          {file.uploading && (
                            <div className="flex items-center space-x-2">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${file.uploadProgress || 0}%` }}></div>
                              </div>
                              <span className="text-xs text-gray-500">{file.uploadProgress || 0}%</span>
                            </div>
                          )}
                          {file.error && <p className="text-xs text-red-600">{file.error}</p>}
                        </div>
                        <button
                          onClick={() => removeFile(file.id)}
                          disabled={file.uploading}
                          className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                        >
                          <XCircle className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Text Submission Section */}
            {(assignment.submissionType === 'text' || assignment.submissionType === 'both') && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Text Submission
                </label>
                <textarea
                  value={textSubmission}
                  onChange={(e) => setTextSubmission(e.target.value)}
                  placeholder="Enter your assignment response here..."
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">{textSubmission.length} characters</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-between">
              <div className="space-x-3">
                <button
                  onClick={handleSaveDraft}
                  disabled={submitting}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Save className="h-4 w-4" />
                  <span>Save Draft</span>
                </button>
              </div>
              
              <div className="space-x-3">
                <button
                  onClick={handleFinalSubmit}
                  disabled={submitting}
                  className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="h-4 w-4" />
                  <span>Submit Assignment</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* My Submission Tab */}
        {activeTab === 'submission' && submission && (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">My Submission</h2>
              <div className="flex items-center space-x-2 text-green-600">
                <CheckCircle className="h-5 w-5" />
                <span className="font-medium">Submitted</span>
              </div>
            </div>

            {/* Submission Details */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div>
                <h3 className="text-md font-semibold text-gray-900 mb-3">Submitted Files</h3>
                {submission.files && submission.files.length > 0 ? (
                  <div className="space-y-2">
                    {submission.files.map((file, index) => (
                      <a
                        key={index}
                        href={file.url}
                        download={file.filename}
                        className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        <File className="h-5 w-5 text-blue-600" />
                        <span className="text-blue-600 font-medium">{file.filename}</span>
                        <Download className="h-4 w-4 text-gray-400 ml-auto" />
                      </a>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No files submitted</p>
                )}
              </div>

              <div>
                <h3 className="text-md font-semibold text-gray-900 mb-3">Submitted Text</h3>
                {submission.text ? (
                  <div className="p-3 bg-gray-50 rounded-lg h-48 overflow-y-auto">
                    <p className="text-gray-700 whitespace-pre-wrap">{submission.text}</p>
                  </div>
                ) : (
                  <p className="text-gray-500 italic">No text submitted</p>
                )}
              </div>
            </div>

            {/* Submission Metadata */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 text-sm text-gray-600 mb-6">
              <div>
                <span className="font-medium">Submitted:</span>
                <span className="ml-2">{submission?.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div>
                <span className="font-medium">Status:</span>
                <span className="ml-2">
                  {submission?.graded ? (
                    <span className="text-green-600">Graded</span>
                  ) : (
                    <span className="text-yellow-600">Pending</span>
                  )}
                </span>
              </div>
              {submission?.graded && (
                <div>
                  <span className="font-medium">Grade:</span>
                  <span className="ml-2 text-green-600 font-medium">
                    {submission.grade || 0}/{assignment.maxPoints} points
                  </span>
                </div>
              )}
            </div>

            {/* Feedback */}
            {submission?.graded && submission.feedback && (
              <div>
                <h3 className="text-md font-semibold text-gray-900 mb-3">Feedback</h3>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-green-800 whitespace-pre-wrap">{submission.feedback}</p>
                </div>
              </div>
            )}

            {!submission.graded && (
              <div className="p-4 bg-yellow-50 rounded-lg">
                <p className="text-yellow-800">
                  Your assignment has been submitted and is currently being graded. 
                  You will be notified when grading is complete.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignmentPage;