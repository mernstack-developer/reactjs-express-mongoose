import { useEffect, useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import { fetchCourses, registerForCourse } from '../../features/courses/coursesSlice';
import { useAppDispatch, useAppSelector } from "../../hooks"; 
import { Link } from "react-router-dom";
import CourseForm from "../../components/CourseForm";
import { hasPermission } from '../../features/auth/userSlice';

export default function Courses() {
  const dispatch = useAppDispatch();
  const { data: courses, loading, error } = useAppSelector(state => state.courses);
  const canCreate = useAppSelector(hasPermission('create_course'));
  const canEdit = useAppSelector(hasPermission('edit_course'));

  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<any | null>(null);

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  const handleRegister = (courseId: string) => {
    dispatch(registerForCourse(courseId));
  };

  const openCreate = () => {
    setEditingCourse(null);
    setShowForm(true);
  };
  const openEdit = (course: any) => {
    setEditingCourse(course);
    setShowForm(true);
  };
  const closeForm = () => {
    setEditingCourse(null);
    setShowForm(false);
  };

  if (loading) return <div>Loading courses...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <>
      <PageMeta
        title="React.js Videos Tabs | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Videos page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="courses" />
      <ComponentCard title="Courses List">
        {/* Create button visible only if user has create permission */}
        {canCreate && (
          <div className="mb-4">
            <button
              onClick={openCreate}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              Create Course
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {courses.map((course) => (
            <div key={course._id} className="course-card">
              <Link to={`/courses/${course._id}`} className="course-card-link">
                <div className="relative overflow-hidden">
                  <img
                    src="/images/grid-image/image-01.png"
                    alt="Cover"
                    className="w-full border border-gray-200 rounded-xl dark:border-gray-800"
                  />
                </div>
              </Link>

              <li key={course._id}>
                <h2>{course.title}</h2>
                <p>{course.description}</p>
                <p>Registered Users: {course.registeredUsers.length}</p>
                <button onClick={() => handleRegister(course._id)}>
                  Register
                </button>
                {/* Edit button only for users with edit permission */}
                {canEdit && (
                  <button
                    onClick={() => openEdit(course)}
                    className="ml-2 px-2 py-1 bg-yellow-500 text-white rounded"
                  >
                    Edit
                  </button>
                )}
              </li>
            </div>
          ))}
        </div>
      </ComponentCard>

      {/* Course form modal (create/edit). Uses simple inline component. */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white p-6 rounded max-w-xl w-full">
            <CourseForm initialCourse={editingCourse} onClose={closeForm} />
          </div>
        </div>
      )}
    </>
  );
}
