//type UserRole = "user" | "admin";
export interface User {
  _id: string;
  firstname: string;
  lastname: string;
  phone?: string;
  bio?: string;
  email: string;
  role: "user" | "admin";
  createdAt: string;
  updatedAt: string;
}
export interface ContentBlock {
  _id: string;
  type: 'video' | 'text' | 'quiz';
  title: string;
  videoUrl?: string;
  textBody?: string;
  quizData?: Record<string, any>; // Flexible type for quiz data structure
}
export interface CourseSection {
  _id: string;
  sectionTitle: string;
  contents: ContentBlock[];
}

export interface Course {
  _id: string;
  title: string;
  description: string;
    sections: CourseSection[]; // Courses now have sections
  instructor: string;
  duration: number; // in hours
  registeredUsers: string[]; // array of user IDs
  createdBy: string; // user ID of the creator
  createdAt: string;
  updatedAt: string;
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
