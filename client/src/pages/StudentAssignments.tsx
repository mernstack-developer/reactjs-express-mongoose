import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle,
  Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  additionalFiles?: AssignmentFile[];
}

const StudentAssignments: React.FC = () => {
  const [activeTab, setActiveTab] = useState('assignments');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
      const response = await fetch(`${apiUrl}/student/assignments`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setAssignments(data);
      }
    } catch (err: any) {
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAssignmentStatus = (assignment: Assignment) => {
    // For now, assume no submissions exist
    if (new Date() > new Date(assignment.dueDate)) return 'late';
    return 'not_submitted';
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
          <h1 className="text-2xl font-bold text-gray-900">My Assignments</h1>
          <p className="text-gray-600">View and submit your assignments</p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'pending', name: 'Pending', icon: Clock },
            { id: 'submitted', name: 'Submitted', icon: FileText },
            { id: 'graded', name: 'Graded', icon: CheckCircle }
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

      {/* Pending Assignments Tab */}
      {activeTab === 'pending' && (
        <div className="space-y-6">
          {assignments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No pending assignments</h3>
              <p className="text-gray-600">You have no assignments due.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {assignments.map((assignment) => {
                const status = getAssignmentStatus(assignment);
                const isOverdue = new Date() > new Date(assignment.dueDate);
                
                if (status !== 'not_submitted') return null;

                return (
                  <div key={assignment._id} className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 mb-2">{assignment.title}</h3>
                        <p className="text-gray-600 text-sm mb-2">{assignment.description}</p>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-500">Course: {assignment.course.title}</p>
                          <p className="text-sm text-gray-500">Section: {assignment.section.title}</p>
                          <p className={`text-sm font-medium ${
                            isOverdue ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            Due: {new Date(assignment.dueDate).toLocaleDateString()}
                            {isOverdue && ' (Overdue)'}
                          </p>
                          <p className="text-sm text-gray-500">Max Points: {assignment.maxPoints}</p>
                        </div>

                        {/* Additional Files */}
                        {assignment.additionalFiles && assignment.additionalFiles.length > 0 && (
                          <div className="mt-4 pt-3 border-t border-gray-200">
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
                      <div className="ml-4">
                        <Clock className={`h-8 w-8 ${
                          isOverdue ? 'text-red-500' : 'text-yellow-500'
                        }`} />
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => navigate(`/assignments/${assignment._id}/submit`)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                      >
                        Submit Assignment
                      </button>
                      <button 
                        onClick={() => navigate(`/assignments/${assignment._id}`)}
                        className="text-gray-600 hover:text-gray-900 text-sm"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Submitted Assignments Tab */}
      {activeTab === 'submitted' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assignment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-center" colSpan={5}>
                      <div className="text-sm text-gray-500 py-4">No submitted assignments yet</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Graded Assignments Tab */}
      {activeTab === 'graded' && (
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assignment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Feedback
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <tr>
                    <td className="px-6 py-4 whitespace-nowrap text-center" colSpan={6}>
                      <div className="text-sm text-gray-500 py-4">No graded assignments yet</div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentAssignments;