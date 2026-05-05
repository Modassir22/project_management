import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { FileText, Plus } from 'lucide-react';
import api from '../services/api';

const Assessments = () => {
  const { user } = useAuth();
  const [assessments, setAssessments] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [newAssessment, setNewAssessment] = useState({ title: '', projectId: '', assignedTo: '' });

  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitData, setSubmitData] = useState({ id: '', submission: '' });

  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({ id: '', score: '', feedback: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [assessRes, projRes] = await Promise.all([
        api.get('/assessments'),
        user.role === 'Admin' ? api.get('/projects') : { data: [] }
      ]);
      setAssessments(assessRes.data);
      if (user.role === 'Admin') setProjects(projRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/assessments', newAssessment);
      setShowModal(false);
      setNewAssessment({ title: '', projectId: '', assignedTo: '' });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating assessment');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/assessments/${submitData.id}/submit`, { submission: submitData.submission });
      setShowSubmitModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error submitting assessment');
    }
  };

  const handleReview = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/assessments/${reviewData.id}/review`, { score: reviewData.score, feedback: reviewData.feedback });
      setShowReviewModal(false);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error reviewing assessment');
    }
  };

  if (loading) return <div>Loading assessments...</div>;

  const selectedProjectObj = newAssessment.projectId ? projects.find(p => p._id === newAssessment.projectId) : null;

  return (
    <div>
      <div className="d-flex justify-between align-center mb-4">
        <div>
          <h1>Assessments</h1>
          <p>Track and manage member performance and reviews.</p>
        </div>
        {user.role === 'Admin' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> New Assessment
          </button>
        )}
      </div>

      <div className="card" style={{ padding: '0' }}>
        <div className="table-container" style={{ border: 'none' }}>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Project</th>
                <th>Assignee</th>
                <th>Status</th>
                <th>Score</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {assessments.length === 0 ? (
                <tr><td colSpan="6" className="text-center" style={{ padding: '2rem' }}>No assessments found.</td></tr>
              ) : assessments.map(a => (
                <tr key={a._id}>
                  <td style={{ fontWeight: 500 }}>
                    <div className="d-flex align-center gap-1">
                      <FileText size={16} color="var(--text-muted)" /> {a.title}
                    </div>
                  </td>
                  <td>{a.projectId?.title}</td>
                  <td>{a.assignedTo?.name}</td>
                  <td>
                    <span className={`badge ${a.status === 'Reviewed' ? 'badge-low' : a.status === 'Submitted' ? 'badge-medium' : 'badge-high'}`}>
                      {a.status}
                    </span>
                  </td>
                  <td>{a.score !== undefined ? `${a.score}/100` : '-'}</td>
                  <td>
                    {user.role === 'Member' && a.status === 'Pending' && (
                      <button className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }} onClick={() => {
                        setSubmitData({ id: a._id, submission: '' });
                        setShowSubmitModal(true);
                      }}>Submit Work</button>
                    )}
                    {user.role === 'Admin' && a.status === 'Submitted' && (
                      <button className="btn btn-primary" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }} onClick={() => {
                        setReviewData({ id: a._id, score: '', feedback: '' });
                        setShowReviewModal(true);
                      }}>Review</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Admin Create Modal */}
      {showModal && user.role === 'Admin' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="d-flex justify-between align-center mb-3">
              <h2>Create Assessment</h2>
              <button className="btn btn-outline" style={{ padding: '0.25rem' }} onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label className="form-label">Assessment Title</label>
                <input className="form-control" required value={newAssessment.title} onChange={e => setNewAssessment({...newAssessment, title: e.target.value})} placeholder="e.g. Code Review Q1" />
              </div>
              <div className="form-group">
                <label className="form-label">Project</label>
                <select className="form-control" required value={newAssessment.projectId} onChange={e => setNewAssessment({...newAssessment, projectId: e.target.value, assignedTo: ''})}>
                  <option value="">Select Project</option>
                  {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
                </select>
              </div>
              {newAssessment.projectId && (
                <div className="form-group">
                  <label className="form-label">Assign To Member</label>
                  <select className="form-control" required value={newAssessment.assignedTo} onChange={e => setNewAssessment({...newAssessment, assignedTo: e.target.value})}>
                    <option value="">Select Member</option>
                    {selectedProjectObj?.members?.map(m => (
                      <option key={m._id} value={m._id}>{m.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div className="d-flex justify-between mt-4">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Member Submit Modal */}
      {showSubmitModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="d-flex justify-between align-center mb-3">
              <h2>Submit Assessment</h2>
              <button className="btn btn-outline" style={{ padding: '0.25rem' }} onClick={() => setShowSubmitModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Your Work / Answer</label>
                <textarea className="form-control" rows="5" required value={submitData.submission} onChange={e => setSubmitData({...submitData, submission: e.target.value})} placeholder="Provide your answers or link to your work here..." />
              </div>
              <div className="d-flex justify-between mt-4">
                <button type="button" className="btn btn-outline" onClick={() => setShowSubmitModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin Review Modal */}
      {showReviewModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="d-flex justify-between align-center mb-3">
              <h2>Review Assessment</h2>
              <button className="btn btn-outline" style={{ padding: '0.25rem' }} onClick={() => setShowReviewModal(false)}>&times;</button>
            </div>
            <div className="mb-3 p-3 card">
              <label className="form-label text-muted">Member's Submission:</label>
              <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.9rem' }}>
                {assessments.find(a => a._id === reviewData.id)?.submission}
              </p>
            </div>
            <form onSubmit={handleReview}>
              <div className="form-group">
                <label className="form-label">Score (0-100)</label>
                <input type="number" min="0" max="100" className="form-control" required value={reviewData.score} onChange={e => setReviewData({...reviewData, score: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Feedback</label>
                <textarea className="form-control" rows="3" required value={reviewData.feedback} onChange={e => setReviewData({...reviewData, feedback: e.target.value})} placeholder="Great job on..." />
              </div>
              <div className="d-flex justify-between mt-4">
                <button type="button" className="btn btn-outline" onClick={() => setShowReviewModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Review</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assessments;
