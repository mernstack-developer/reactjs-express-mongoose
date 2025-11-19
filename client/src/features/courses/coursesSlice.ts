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
  return response.data.data;
});

export const fetchCourseById = createAsyncThunk<Course, string>('courses/fetchCourseById',
   async (_id) => {
   const response = await apiClient.get<ApiResponse<Course>>(`/courses/view/${_id}`);
  // if (!response.data) throw new Error('Failed to fetch course');
  return response.data.data;
});

// Section related thunks
export const createSection = createAsyncThunk<any, { courseId?: string; section: Partial<any> }>('courses/createSection', async ({ courseId, section }) => {
  const payload = { ...section, ...(courseId ? { courseId } : {}) };
  const response = await apiClient.post<ApiResponse<any>>('/sections', payload);
  if (!response.data) throw new Error('Failed to create section');
  return response.data.data;
});

export const fetchSectionById = createAsyncThunk<any, string>('courses/fetchSectionById', async (id) => {
  const response = await apiClient.get<ApiResponse<any>>(`/sections/${id}`);
  if (!response.data) throw new Error('Failed to fetch section');
  return response.data.data;
});

export const updateSection = createAsyncThunk<any, { id: string; data: Partial<any> }>('courses/updateSection', async ({ id, data }) => {
  const response = await apiClient.put<ApiResponse<any>>(`/sections/${id}`, data);
  if (!response.data) throw new Error('Failed to update section');
  return response.data.data;
});

export const deleteSection = createAsyncThunk<any, { id: string; courseId?: string }>('courses/deleteSection', async ({ id, courseId }) => {
  const url = courseId ? `/sections/${id}?courseId=${courseId}` : `/sections/${id}`;
  const response = await apiClient.delete<ApiResponse<any>>(url);
  if (!response.data) throw new Error('Failed to delete section');
  return { id };
});

export const duplicateSection = createAsyncThunk<any, { id: string; courseId?: string }>('courses/duplicateSection', async ({ id, courseId }) => {
  const response = await apiClient.post<ApiResponse<any>>(`/sections/${id}/duplicate`, { courseId });
  if (!response.data) throw new Error('Failed to duplicate section');
  return response.data.data;
});

export const reorderSections = createAsyncThunk<any, { courseId: string; orderedSectionIds: string[] }>('courses/reorderSections', async ({ courseId, orderedSectionIds }) => {
  const response = await apiClient.post<ApiResponse<any>>(`/sections/course/${courseId}/reorder`, { orderedSectionIds });
  if (!response.data) throw new Error('Failed to reorder sections');
  return response.data.data;
});

export const toggleSectionVisibility = createAsyncThunk<any, { sectionId: string; isHidden: boolean }>('courses/toggleSectionVisibility', async ({ sectionId, isHidden }) => {
  const response = await apiClient.put<ApiResponse<any>>(`/sections/${sectionId}`, { isHidden });
  if (!response.data) throw new Error('Failed to toggle section visibility');
  return response.data.data;
});

export const updateSectionDescription = createAsyncThunk<any, { sectionId: string; description: string; title?: string; media?: any }>('courses/updateSectionDescription', async ({ sectionId, description, title, media }) => {
  const response = await apiClient.put<ApiResponse<any>>(`/sections/${sectionId}`, { 
    description, 
    ...(title ? { title } : {}), 
    ...(media ? { media } : {})
  });
  if (!response.data) throw new Error('Failed to update section description');
  return response.data.data;
});

// Activity thunks
export const updateActivity = createAsyncThunk<any, { activityId: string; data: any }>('courses/updateActivity', async ({ activityId, data }) => {
  const response = await apiClient.put<ApiResponse<any>>(`/activities/${activityId}`, data);
  if (!response.data) throw new Error('Failed to update activity');
  return response.data.data;
});

export const deleteActivity = createAsyncThunk<any, string>('courses/deleteActivity', async (activityId) => {
  const response = await apiClient.delete<ApiResponse<any>>(`/activities/${activityId}`);
  if (!response.data) throw new Error('Failed to delete activity');
  return { id: activityId };
});

export const toggleActivityVisibility = createAsyncThunk<any, { activityId: string; isHidden: boolean }>('courses/toggleActivityVisibility', async ({ activityId, isHidden }) => {
  const response = await apiClient.put<ApiResponse<any>>(`/activities/${activityId}`, { isHidden });
  if (!response.data) throw new Error('Failed to toggle activity visibility');
  return response.data.data;
});

export const reorderActivities = createAsyncThunk<any, { sectionId: string; orderedActivityIds: string[] }>('courses/reorderActivities', async ({ sectionId, orderedActivityIds }) => {
  const response = await apiClient.post<ApiResponse<any>>(`/activities/section/${sectionId}/reorder`, { orderedActivityIds });
  if (!response.data) throw new Error('Failed to reorder activities');
  return response.data.data;
});

export const duplicateCourse = createAsyncThunk<Course, string>('courses/duplicateCourse', async (courseId) => {
  const course = await apiClient.get<ApiResponse<Course>>(`/courses/${courseId}`);
  if (!course.data) throw new Error('Failed to fetch course to duplicate');
  const courseData = course.data.data;
  const copy = { ...courseData };
  copy.title = `${copy.title} (copy)`;
  const response = await apiClient.post<ApiResponse<Course>>('/courses', copy);
  if (!response.data) throw new Error('Failed to duplicate course');
  return response.data.data;
});

export const createCourse = createAsyncThunk<Course, Partial<Course>>('courses/createCourse', async (courseData) => {
  const response = await apiClient.post<ApiResponse<Course>>('/courses', courseData);
  if (!response.data) throw new Error('Failed to create course');
  return response.data.data;
});

export const updateCourse = createAsyncThunk<Course, { id: string; data: Partial<Course> }>('courses/updateCourse', async ({ id, data }) => {
  const response = await apiClient.put<ApiResponse<Course>>(`/courses/edit/${id}`, data);
  if (!response.data) throw new Error('Failed to update course');
  return response.data.data;
});

export const deleteCourse = createAsyncThunk<void, string>('courses/deleteCourse', async (id) => {
  const response = await apiClient.delete<ApiResponse<void>>(`/courses/delete/${id}`);
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
export const fetchRegisteredCourses = createAsyncThunk<Course[],{ userId: string}>(
  'courses/fetchRegisteredCourses', 
  async ({ userId }) => {
    const response = await apiClient.get<ApiResponse<Course[]>>(`/courses/registered/${userId}`);
    if (!response.data) throw new Error('Failed to fetch registered courses');
    return response.data.data;
  }
);

// Public courses exposed by enrollment controller
export const fetchPublicCourses = createAsyncThunk<Course[]>('courses/fetchPublicCourses', async () => {
  const response = await apiClient.get<ApiResponse<Course[]>>('/enrollment/public-courses');
  if (!response.data) throw new Error('Failed to fetch public courses');
  return response.data.data;
});

// Enroll a user into a course via the enrollment endpoint
export const enrollInCourse = createAsyncThunk<void, string>('courses/enrollInCourse', async (courseId) => {
  const response = await apiClient.post<ApiResponse<any>>(`/enrollment/enroll/${courseId}`);
  if (!response.data) throw new Error('Failed to enroll in course');
  return;
});
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
    .addCase(fetchPublicCourses.pending,(state)=>{
      state.loading=true;
      state.error=null;
      state.selectedCourse = null;
    })
    .addCase(fetchPublicCourses.fulfilled,(state,action)=>{
      state.loading=false;
      state.data=action.payload;
      state.selectedCourse = null;
    })
    .addCase(fetchPublicCourses.rejected,(state,action)=>{
      state.loading=false;
      state.error=action.error.message || 'Failed to fetch public courses';
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
