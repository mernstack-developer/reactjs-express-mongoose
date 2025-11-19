import  { useEffect } from 'react';
import {  useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { fetchCourseById} from '../../features/courses/coursesSlice';
import{CourseSection, ContentBlock } from '../../types/types';
import { useParams } from 'react-router-dom';
import { useAppSelector } from '../../hooks';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import ComponentCard from '../../components/common/ComponentCard';
import { registerForCourse} from '../../features/courses/coursesSlice';
import { useAuth } from '../../hooks/useAuth';

// Helper component to render different content types
const ContentBlockRenderer: React.FC<{ content: ContentBlock }> = ({ content }) => {
  switch (content.type) {
    case 'video':
      return (
        <div className="content-video">
          <h4>Video: {content.title}</h4>
          <video controls src={content.videoUrl} style={{ maxWidth: '100%', maxHeight: '400px' }} />
        </div>
      );
    case 'text':
      return (
        <div className="content-text">
          <h4>Text: {content.title}</h4>
          <p>{content.textBody}</p>
        </div>
      );
    case 'quiz':
      return (
        <div className="content-quiz">
          <h4>Quiz: {content.title}</h4>
          {/* Render quiz logic here */}
          <p>Quiz content structure goes here...</p>
        </div>
      );
    default:
      return null;
  }
};

// Component to render a single section
const SectionRenderer: React.FC<{ section: CourseSection }> = ({ section }) => {
  return (
    <div className="course-section" style={{ border: '1px solid #ccc', padding: '10px', margin: '10px 0' }}>
      <h3>{section?.title}</h3>
      {section.contents.map((content) => (
        <ContentBlockRenderer key={content._id} content={content} />
      ))}
    </div>
  );
};


// Main Course Detail View (Assuming we select one course to view details)
export default function CourseDetail() {
     const dispatch = useDispatch<AppDispatch>();
    const { _id } = useParams<{ _id: string }>();
  const {user } = useAuth();
  const { selectedCourse: course } = useAppSelector((state: RootState) => state.courses);
  const loading = useAppSelector((state: RootState) => state.courses.loading);
  const error = useAppSelector((state: RootState) => state.courses.error);

    // Fetch courses if they aren't loaded (if this component loads directly)
    useEffect(() => {
        if (!course) {
             dispatch(fetchCourseById(_id!));
        }
    }, [dispatch, _id, course]);

  const handleEnroll = (courseId: string) => {
    dispatch(registerForCourse(courseId));
  };
    if (loading) return <div>Loading course details...</div>;
     // Handle the Forbidden error message returned by the backend middleware
  if (error && error.includes('Forbidden')) {
    return <div>{error} You must enroll in this course to view the content.</div>;
  }
  if (error) return <div>Error: {error}</div>;
  if (!course) return <div>Course not found.</div>;
  const currentUserId = user._id;
  const isEnrolled = course.registeredUsers.includes(currentUserId);

    return (
      <>
      <PageMeta 
        title="React.js Videos Tabs | TailAdmin - React.js Admin Dashboard Template"
        description="This is React.js Videos page for TailAdmin - React.js Tailwind CSS Admin Dashboard Template"
      />
      <PageBreadcrumb pageTitle="courses" />
        <ComponentCard title="Courses List">
        <div>
            <h1>{course.title}</h1>
            <p>{course.description}</p>
            <hr />
            <h2>Course Curriculum</h2>
            {course.sections.map((section) => (
                <SectionRenderer key={section._id} section={section} />
            ))}
             {isEnrolled ? (
        <div className="course-content">
          <h2>Sections (Visible to Enrolled Students)</h2>
          {/* Render sections, videos, quizzes here */}
        </div>
      ) : (
        <button onClick={() => handleEnroll(course._id)}>Enroll Now</button>
      )}
        </div>
        </ComponentCard>
        </>
    );
};

 CourseDetail;
