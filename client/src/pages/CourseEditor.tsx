import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../hooks';
import { fetchCourseById, createSection, deleteSection, duplicateSection } from '../features/courses/coursesSlice';
import SectionCard from '../components/SectionCard';

const CourseEditor: React.FC = () => {
  const { id } = useParams();
  const dispatch = useAppDispatch();
  const { selectedCourse, loading } = useAppSelector((state: any) => state.courses);
  const [editMode, setEditMode] = useState(false);
  const [collapseAll, setCollapseAll] = useState(false);

  useEffect(() => {
    if (id) dispatch(fetchCourseById(id));
  }, [id, dispatch]);

  if (loading) return <div>Loading...</div>;
  if (!selectedCourse) return <div>No course found</div>;

  const onAddSection = async () => {
    const title = prompt('Section title') || 'Untitled Section';
    const section = { title, description: '' };
    await dispatch(createSection({ courseId: selectedCourse._id, section }));
    await dispatch(fetchCourseById(selectedCourse._id));
  };

  const onDuplicate = async (sectionId: string) => {
    await dispatch(duplicateSection({ id: sectionId, courseId: selectedCourse._id }));
    await dispatch(fetchCourseById(selectedCourse._id));
  };

  const onDelete = async (sectionId: string) => {
    if (!confirm('Delete this section and its contents?')) return;
    await dispatch(deleteSection({ id: sectionId, courseId: selectedCourse._id }));
    await dispatch(fetchCourseById(selectedCourse._id));
  };

  // Reordering handled via UI interactions; call reorderSections when needed

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{selectedCourse.title} - Editor</h1>
        <div>
          <button className="mr-2 btn" onClick={() => setEditMode(!editMode)}>{editMode ? 'Turn editing off' : 'Turn editing on'}</button>
          <button className="btn" onClick={onAddSection}>Add section</button>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Left: Course index drawer */}
        <aside className="w-64 border p-2 h-[70vh] overflow-auto">
          <h3 className="font-semibold mb-2">Course Index</h3>
          <button className="text-sm underline mb-2" onClick={() => setCollapseAll(!collapseAll)}>{collapseAll ? 'Expand all' : 'Collapse all'}</button>
          <ul>
            {selectedCourse.sections?.map((s: any, idx: number) => (
              <li key={s._id} className="mb-1">
                <a href={`#section-${s._id}`} className="text-blue-600">{idx + 1}. {s.title || s.sectionTitle || 'Untitled'}</a>
              </li>
            ))}
          </ul>
        </aside>

        {/* Main course area */}
        <main className="flex-1">
          {selectedCourse.sections?.map((section: any, idx: number) => (
            <div id={`section-${section._id}`} key={section._id} className="mb-4 border rounded p-3">
              <div className="flex justify-between items-center">
                <h2 className="font-semibold">{idx + 1}. {section.title || section.sectionTitle}</h2>
                <div className="flex gap-2">
                  {editMode && (
                    <>
                      <button className="btn" onClick={() => onDuplicate(section._id)}>Duplicate</button>
                      <button className="btn" onClick={() => onDelete(section._id)}>Delete</button>
                    </>
                  )}
                </div>
              </div>
              <SectionCard section={section} editable={editMode} />
            </div>
          ))}
        </main>

        {/* Right: Block drawer (simplified) */}
        <aside className="w-72 border p-2">
          <h3 className="font-semibold mb-2">Block drawer</h3>
          <p className="text-sm text-gray-600">Add blocks when edit mode is enabled.</p>
        </aside>
      </div>
    </div>
  );
};

export default CourseEditor;
