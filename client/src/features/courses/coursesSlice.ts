import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { apiClient } from "../../utils/api";
import { ApiResponse, Course } from "../../types/types";

export interface CoursesState {
  data: Course[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  selectedCourse: Course | null;
}

const initialState: CoursesState = {
  data: [],
  selectedCourse: null,
  loading: false,
  error: null,
  lastUpdated: null,
};

export const fetchCourses = createAsyncThunk<Course[]>('courses/fetchCourses', async () => {
  const response = await apiClient.get<ApiResponse<Course[]>>('/courses');
  if (!response.data) throw new Error('Failed to fetch courses');
  console.log('Fetched Courses:', response);
  return response.data.data;
});

export const fetchCourseById = createAsyncThunk<Course, string>('courses/fetchCourseById',
   async (_id) => {
   const response = await apiClient.get<ApiResponse<Course>>(`/courses/${_id}`);
   console.log('Fetched Course by ID Response:', response.data.data);
  // if (!response.data) throw new Error('Failed to fetch course');
  return response.data.data;
});

export const createCourse = createAsyncThunk<Course, Partial<Course>>('courses/createCourse', async (courseData) => {
  const response = await apiClient.post<ApiResponse<Course>>('/courses', courseData);
  if (!response.data) throw new Error('Failed to create course');
  return response.data.data;
});

export const updateCourse = createAsyncThunk<Course, { id: string; data: Partial<Course> }>('courses/updateCourse', async ({ id, data }) => {
  const response = await apiClient.put<ApiResponse<Course>>(`/courses/${id}`, data);
  if (!response.data) throw new Error('Failed to update course');
  return response.data.data;
});

export const deleteCourse = createAsyncThunk<void, string>('courses/deleteCourse', async (id) => {
  const response = await apiClient.delete<ApiResponse<void>>(`/courses/${id}`);
  if (!response.data) throw new Error('Failed to delete course');

  return;
});
export const registerForCourse = createAsyncThunk<void, string>('courses/registerForCourse', async (courseId) => {
  const response = await apiClient.post<ApiResponse<void>>(`/courses/${courseId}/register`);
  if (!response.data) throw new Error('Failed to register for course');

  return;
});

export const unregisterFromCourse = createAsyncThunk<void, string>('courses/unregisterFromCourse', async (courseId) => {
  const response = await apiClient.post<ApiResponse<void>>(`/courses/${courseId}/unregister`);
  if (!response.data) throw new Error('Failed to unregister from course');

  return;
});
export const fetchRegisteredCourses = createAsyncThunk<Course[]>(
  'courses/fetchRegisteredCourses', 
  async () => {
    const response = await apiClient.get<ApiResponse<Course[]>>('/courses/registered');
    if (!response.data) throw new Error('Failed to fetch registered courses');
    return response.data.data;
  }
);
export const coursesSlice=createSlice({
  name:'courses',
 initialState,
  reducers: {},
  extraReducers:(builder)=>{
    builder
    .addCase(fetchCourses.pending,(state)=>{
      state.loading=true;
      state.error=null;
      state.selectedCourse = null;
    })
    .addCase(fetchCourses.fulfilled,(state,action)=>{
      state.loading=false;
      state.data=action.payload;
      state.selectedCourse = null;
    })
    .addCase(fetchCourses.rejected,(state,action)=>{
      state.loading=false;
      state.error=action.error.message || 'Failed to fetch courses';
      state.selectedCourse = null;
    })
    .addCase(fetchRegisteredCourses.pending,(state)=>{
      state.loading=true;
      state.error=null;
      state.selectedCourse = null;
    })
    .addCase(fetchRegisteredCourses.fulfilled,(state,action)=>{
      state.loading=false;
      state.data=action.payload;
      state.selectedCourse = null;
    })
    .addCase(fetchRegisteredCourses.rejected,(state,action)=>{
      state.loading=false;
      state.error=action.error.message || 'Failed to fetch registered courses';
      
    })    
     .addCase(fetchCourseById.pending, (state) => {
      state.loading = true;
      state.error = null;
      state.selectedCourse = null; // Clear previous course when fetching a new one
    })
    .addCase(fetchCourseById.fulfilled, (state, action: PayloadAction<Course>) => {
      state.loading = false;
      state.selectedCourse = action.payload; // Store the single course object here
    })
    .addCase(fetchCourseById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Failed to fetch course details';
      state.selectedCourse = null;
    });
  }
});

export default coursesSlice.reducer;
