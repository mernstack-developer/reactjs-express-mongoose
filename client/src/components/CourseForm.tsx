import React, { useState } from "react";
import { apiClient } from "../utils/api";
import { useAppDispatch } from "../hooks";
import { fetchCourses } from "../features/courses/coursesSlice";

type Props = {
  initialCourse?: any | null;
  onClose: () => void;
};

export default function CourseForm({ initialCourse = null, onClose }: Props) {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState(initialCourse?.title || "");
  const [description, setDescription] = useState(initialCourse?.description || "");
  const [loading, setLoading] = useState(false);
  const isEdit = Boolean(initialCourse && initialCourse._id);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isEdit) {
        await apiClient.put(`/courses/${initialCourse._id}`, { title, description });
      } else {
        await apiClient.post("/courses", { title, description });
      }
      // Refresh course list in global state
      dispatch(fetchCourses());
      onClose();
    } catch (err: any) {
      console.error("Course save error:", err?.response?.data || err);
      alert(err?.response?.data?.message || "Failed to save course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">{isEdit ? "Edit Course" : "Create Course"}</h3>
        <button type="button" onClick={onClose} className="text-gray-500">Close</button>
      </div>

      <div>
        <label className="block text-sm font-medium">Title</label>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 w-full border rounded px-3 py-2"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="mt-1 w-full border rounded px-3 py-2"
          rows={4}
          required
        />
      </div>

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className="px-4 py-2 border rounded">Cancel</button>
        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">
          {loading ? "Saving..." : isEdit ? "Save Changes" : "Create"}
        </button>
      </div>
    </form>
  );
}
