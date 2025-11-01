//type UserRole = "user" | "admin";
export interface User {
  id: string;
  firstname: string;
  lastname: string;
  phone?: string;
  bio?: string;
  email: string;
  role: "user" | "admin";
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
  id: string;
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
