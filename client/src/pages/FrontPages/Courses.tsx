import { useEffect } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import ComponentCard from "../../components/common/ComponentCard";
import { fetchCourses,registerForCourse} from '../../features/courses/coursesSlice';
import { useAppDispatch,useAppSelector } from "../../hooks"; 
import { Link } from "react-router-dom";

export default function Courses() {
const dispatch = useAppDispatch();
const { data: courses, loading, error } = useAppSelector(state => state.courses);
  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  const handleRegister = (courseId: string) => {
    dispatch(registerForCourse(courseId));
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
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
             {courses.map((course) => (
                        <Link key={course._id} to={`/courses/${course._id}`} className="course-card-link">

         <div className="relative">
      <div className="overflow-hidden">
        <img
          src="/images/grid-image/image-01.png"
          alt="Cover"
          className="w-full border border-gray-200 rounded-xl dark:border-gray-800"
        />
                  <li key={course._id}>
            <h2>{course.title}</h2>
            <p>{course.description}</p>
            <p>Registered Users: {course.registeredUsers.length}</p>
            <button onClick={() => handleRegister(course._id)}>
              Register
            </button>
          </li>
      </div>
    </div>     
</Link>
        ))}



    </div>

        </ComponentCard>
    </>
  );
}
