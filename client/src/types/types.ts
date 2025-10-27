//type UserRole = "user" | "admin";
export interface User {
  id: string;
  name: string;
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
