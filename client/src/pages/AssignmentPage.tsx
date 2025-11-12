import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { apiClient } from '../utils/api';
import { uploadFileToServer } from '../utils/upload';

export default function AssignmentPage() {
  const { id } = useParams();
  const [assignment, setAssignment] = useState<any>(null);
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const res = await apiClient.get(`/assignments/${id}`);
      setAssignment(res.data);
    })();
  }, [id]);

  const handleSubmit = async () => {
    if (!id) return;
    setSubmitting(true);
    try {
      let filesMeta: any[] = [];
      if (file) {
        const up = await uploadFileToServer(file);
        const result = up?.data || up;
        const url = result?.url || result?.downloadUrl || result?.publicUrl || result?.data || result;
        filesMeta = [{ filename: file.name, url }];
      }
      const payload = { files: filesMeta, text: '' };
  await apiClient.post(`/assignments/${id}/submit`, payload);
  alert('Submission created');
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  if (!assignment) return <div>Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold">{assignment.title}</h1>
      <p className="mt-2 text-gray-700">{assignment.description}</p>
      <div className="mt-4">
        <label className="block mb-2">Upload file</label>
        <input type="file" onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)} />
      </div>
      <div className="mt-4">
        <button className="btn" onClick={handleSubmit} disabled={submitting}>{submitting ? 'Submitting...' : 'Submit'}</button>
      </div>
    </div>
  );
}
