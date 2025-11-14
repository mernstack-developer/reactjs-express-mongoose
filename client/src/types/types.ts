//type UserRole = "user" | "admin";

export interface Permission {
  _id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Role {
  _id: string;
  name: string;
  description?: string;
  permissions: Permission[] | string[]; // Can be populated or just IDs
  createdAt?: string;
  updatedAt?: string;
}

export interface User {
  _id: string;
  firstname: string;
  lastname: string;
  phone?: string;
  bio?: string;
  email: string;
  role:  string; // Can be Role object or role ID
  registeredCourses?: string[];
  avatarUrl?: string;
  social?: {
    facebook?: string;
    x?: string;
    linkedin?: string;
    instagram?: string;
  };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    taxId?: string;
  };
  preferences?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}
export interface ContentBlock {
  _id: string;
  type: 'video' | 'text' | 'quiz' | 'assignment' | 'forum' | 'quiz' | 'lesson' | 'h5p' | 'resource' | 'scorm' | 'wiki' | 'workshop' | 'choice' | 'database' | 'feedback' | 'bigbluebutton' | 'lti';
  title: string;
  videoUrl?: string;
  textBody?: string;
  quizData?: Record<string, any>; // Flexible type for quiz data structure
}
export interface CourseSection {
  _id: string;
  title: string;
  description?: string;
  contents: ContentBlock[];
  activities?: any[];
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  imageUrl?: string; // optional course image
  thumbnail?: string; // optional course thumbnail
  sections: CourseSection[]; // Courses now have sections
  instructor: string;
  duration: number; // in hours
  registeredUsers: string[]; // array of user IDs
  createdBy: string; // user ID of the creator
  // Enrollment and pricing fields
  isPublic?: boolean; // Whether course is publicly visible
  enrollmentType?: 'free' | 'paid' | 'approval'; // Type of enrollment: free, paid, or approval-based
  price?: number; // Course price (for paid courses)
  currency?: string; // Currency code (e.g., 'USD')
  requiresPayment?: boolean; // Whether course requires payment (deprecated, use enrollmentType)
  maxStudents?: number; // Maximum number of students allowed
  enrollmentDeadline?: string; // ISO date string for enrollment deadline
  startDate?: string; // ISO date string for course start
  endDate?: string; // ISO date string for course end
  tags?: string[]; // Course tags/categories
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  parent?: string | null;
  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface Guest {
  id: string;
  name: string;
  phoneNumber: string;
  email: string;
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  createdAt: string;
  updatedAt: string;
}
export interface Order {
  id: number;
  user: {
    image: string;
    name: string;
    role: string;
  };
  projectName: string;
  team: {
    images: string[];
  };
  status: string;
  budget: string;
}
export interface Notification {
  _id: string;
  message: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface InvitationStats {
  accepted: number;
  pending: number;
  declined: number;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}
