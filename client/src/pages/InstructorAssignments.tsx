import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  FileText, 
  Users, 
  CheckCircle,
  Eye,
  Upload,
  Download
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';

interface AssignmentFile {
  filename: string;
  url: string;
}

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
  createdAt: string;
  submissionsCount: number;
  gradedCount: number;
  additionalFiles?: AssignmentFile[];
}

const InstructorAssignments: React.FC = () => {
  const [activeTab, setActiveTab] = useState('assignments');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { courseId } = useParams();

  useEffect(() => {
    if (courseId) {
      fetchAssignments();
    }
  }, [courseId]);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${apiUrl}/instructor/assignments/${courseId}`, { headers });
      const data = await response.json();
      
      if (response.ok) {
        setAssignments(data.data || []);
      } else {
        throw new Error(data.message || 'Failed to fetch assignments');
      }
    } catch (err: any) {
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteAssignment = async (assignmentId: string) => {
    if (!confirm('Are you sure you want to delete this assignment?')) return;

    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      };
      
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${apiUrl}/instructor/assignments/${assignmentId}`, {
        method: 'DELETE',
        headers
      });
      
      if (response.ok) {
        setAssignments(prev => prev.filter(a => a._id !== assignmentId));
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete assignment');
      }
    } catch (err: any) {
      console.error('Error deleting assignment:', err);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="h-4 bg-gray-200 rounded mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Assignments</h1>
          <p className="text-gray-600">Manage assignments for your course</p>
        </div>
        <button 
          onClick={() => navigate(`/instructor/courses/${courseId}/assignments/create`)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Create Assignment</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'assignments', name: 'Assignments', icon: FileText },
            { id: 'analytics', name: 'Analytics', icon: Users }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Assignments Tab */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          {assignments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments yet</h3>
              <p className="text-gray-600">Create your first assignment to get started.</p>
              <button 
                onClick={() => navigate(`/instructor/courses/${courseId}/assignments/create`)}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Create Assignment
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {assignments.map((assignment) => (
                <div key={assignment._id} className="bg-white rounded-lg shadow p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">{assignment.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{assignment.description}</p>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">Section: {assignment.section.title}</p>
                        <p className="text-sm text-gray-500">Due: {new Date(assignment.dueDate).toLocaleDateString()}</p>
                        <p className="text-sm text-gray-500">Max Points: {assignment.maxPoints}</p>
                      </div>

                      {/* Additional Files */}
                      {assignment.additionalFiles && assignment.additionalFiles.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <h4 className="text-sm font-medium text-gray-700 mb-2">Additional Materials</h4>
                          <div className="space-y-1">
                            {assignment.additionalFiles.map((file, index) => (
                              <a
                                key={index}
                                href={file.url}
                                download={file.filename}
                                className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800"
                              >
                                <FileText className="h-4 w-4" />
                                <span>{file.filename}</span>
                                <Download className="h-4 w-4 ml-auto" />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="ml-4 text-right">
                      <div className="text-lg font-bold text-blue-600">{assignment.submissionsCount}</div>
                      <p className="text-xs text-gray-500">Submissions</p>
                      <div className="text-lg font-bold text-green-600 mt-2">{assignment.gradedCount}</div>
                      <p className="text-xs text-gray-500">Graded</p>
                    </div>
                  </div>
                  
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => navigate(`/instructor/assignments/${assignment._id}/submissions`)}
                      className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 text-sm"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Submissions</span>
                    </button>
                    <button 
                      onClick={() => navigate(`/instructor/assignments/${assignment._id}/edit`)}
                      className="flex items-center space-x-2 text-green-600 hover:text-green-700 text-sm"
                    >
                      <Edit className="h-4 w-4" />
                      <span>Edit</span>
                    </button>
                    <button 
                      onClick={() => deleteAssignment(assignment._id)}
                      className="flex items-center space-x-2 text-red-600 hover:text-red-700 text-sm"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Assignments</p>
                  <p className="text-2xl font-bold text-gray-900">{assignments.length}</p>
                </div>
                <FileText className="h-8 w-8 text-blue-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Submissions</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {assignments.reduce((total, a) => total + a.submissionsCount, 0)}
                  </p>
                </div>
                <Upload className="h-8 w-8 text-green-500" />
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Average Grade</p>
                  <p className="text-2xl font-bold text-gray-900">85%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-yellow-500" />
              </div>
            </div>
          </div>

          {/* Assignment Performance Chart */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-4">Assignment Performance</h3>
            <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Chart visualization coming soon</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorAssignments;