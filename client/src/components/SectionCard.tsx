import React, { useRef, useState } from 'react';
import { useAppDispatch } from '../hooks';
import { updateSection } from '../features/courses/coursesSlice';
import { uploadFileToServer } from '../utils/upload';
import { apiClient } from '../utils/api';

const SectionCard: React.FC<{ section: any; editable?: boolean }> = ({ section, editable = false }) => {
  const dispatch = useAppDispatch();

  const onAddContent = async () => {
    const type = prompt('Content type (video|text|quiz)') || 'text';
    const title = prompt('Content title') || 'New content';
    const content = { type, title };
    const newContents = [...(section.contents || []), content];
    await dispatch(updateSection({ id: section._id, data: { contents: newContents } }));
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);

  const onUploadFile = () => {
    fileInputRef.current?.click();
  };

  const createActivity = async () => {
    const type = prompt('Activity type (assignment|quiz|forum|choice|h5p|lesson|scorm|wiki|workshop|database|feedback|bigbluebutton|lti)') || 'assignment';
    const title = prompt('Activity title') || 'New activity';
    try {
      if (type === 'assignment') {
        // Open a simple prompt flow to create an assignment and activity
        const desc = prompt('Assignment description (short)') || '';
        const payload = { sectionId: section._id, assignment: { title, description: desc } };
        const res = await apiClient.post('/assignments/create-activity', payload);
        const data = res.data && res.data.data ? res.data.data : res.data;
        // data contains { assignment, activity }
        const act = data.activity || data;
        const actId = act._id || act;
        const newActivities = [...(section.activities || []), actId];
        await dispatch(updateSection({ id: section._id, data: { activities: newActivities } }));
      } else {
        const payload = { sectionId: section._id, activity: { type, title, description: '' } };
        const res = await apiClient.post('/activities', payload);
        const activity = res.data && res.data.data ? res.data.data : res.data;
        const actId = activity && activity._id ? activity._id : activity;
        const newActivities = [...(section.activities || []), actId];
        await dispatch(updateSection({ id: section._id, data: { activities: newActivities } }));
      }
    } catch (err) {
      console.error('Failed to create activity', err);
      alert('Failed to create activity');
    }
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    setUploading(true);
    try {
      const resp = await uploadFileToServer(f);
      // server returns data (Vercel response) under data
      const url = resp?.data?.url || resp?.data?.downloadUrl || resp?.data?.publicUrl || resp?.data?.key || resp?.data?.object || resp?.url || resp.data;
      const content = { type: f.type.startsWith('video') ? 'video' : f.type.startsWith('image') ? 'image' : 'file', title: f.name, url };
      const newContents = [...(section.contents || []), content];
      await dispatch(updateSection({ id: section._id, data: { contents: newContents } }));
    } catch (err) {
      console.error('Upload failed', err);
      alert('Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const onRemoveContent = async (index: number) => {
    if (!confirm('Remove this content?')) return;
    const newContents = (section.contents || []).filter((_: any, i: number) => i !== index);
    await dispatch(updateSection({ id: section._id, data: { contents: newContents } }));
  };

  return (
    <div>
      <p className="text-sm text-gray-700">{section.description || ''}</p>
      <div className="mt-2">
        {(section.contents || []).map((c: any, idx: number) => (
          <div key={idx} className="border rounded p-2 mb-2">
            <div className="flex justify-between">
              <div>
                <strong>{c.title}</strong>
                <div className="text-xs text-gray-500">Type: {c.type}</div>
              </div>
              {editable && (
                <div>
                  <button className="btn mr-2" onClick={() => onRemoveContent(idx)}>Remove</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {editable && (
        <div className="mt-2">
          <div className="flex items-center gap-2">
            <button className="btn" onClick={onAddContent}>Add content</button>
            <button className="btn" onClick={createActivity}>Add activity</button>
            <button className="btn" onClick={onUploadFile} disabled={uploading}>{uploading ? 'Uploading...' : 'Upload file'}</button>
            <input ref={fileInputRef} type="file" onChange={handleFile} className="hidden" />
          </div>
        </div>
      )}
    </div>
  );
};

export default SectionCard;
