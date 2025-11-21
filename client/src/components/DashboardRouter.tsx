import React, { useEffect, useState } from 'react';
import { useAppSelector } from '../hooks';
import { RootState } from '../store';
import StudentDashboard from '../components/Student/StudentDashboard';
import InstructorDashboard from '../components/Instructor/InstructorDashboard';
import AdminDashboard from '../components/Admin/AdminDashboard';
//import { User } from '../types/types';

const DashboardRouter: React.FC = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const user = useAppSelector((state: RootState) => state.user.data);

  useEffect(() => {
    if (user) {
      // Get user role from the user object
      const role = user.role?.name || 'student';
      setUserRole(role);
    }
  }, [user]);

  if (!userRole) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse">
          <div className="h-8 w-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {userRole === 'admin' && <AdminDashboard />}
      {userRole === 'instructor' && <InstructorDashboard />}
      {userRole === 'student' && <StudentDashboard />}
      {userRole !== 'admin' && userRole !== 'instructor' && userRole !== 'student' && (
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Your Dashboard</h2>
          <p className="text-gray-600">Your role is: {userRole}</p>
          <p className="text-gray-600 mt-2">Dashboard functionality for this role is being developed.</p>
        </div>
      )}
    </div>
  );
};

export default DashboardRouter;