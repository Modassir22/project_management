import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Plus, Users, Layout } from 'lucide-react';
import api from '../services/api';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);


  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '', memberIds: [] });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [projectsRes, usersRes] = await Promise.all([
        api.get('/projects'),
        user.role === 'Admin' ? api.get('/auth/users') : { data: [] }
      ]);
      setProjects(projectsRes.data);
      if (user.role === 'Admin') {
        setAllUsers(usersRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    e.preventDefault();
    try {
      await api.post('/projects', newProject);
      setShowModal(false);
      setNewProject({ title: '', description: '', memberIds: [] });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating project');
    }
  };

  if (loading) return <div>Loading projects...</div>;

  return (
    <div>
      <div className="d-flex justify-between align-center mb-4">
        <div>
          <h1>Projects</h1>
          <p>Manage and view all your active projects.</p>
        </div>
        {user.role === 'Admin' && (
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={18} /> New Project
          </button>
        )}
      </div>

      <div className="dashboard-grid">
        {projects.length === 0 ? (
          <div className="card text-center" style={{ gridColumn: '1 / -1', padding: '3rem' }}>
            <Layout size={48} color="var(--text-muted)" style={{ marginBottom: '1rem' }} />
            <h3>No Projects Found</h3>
            <p>You don't have any projects assigned to you yet.</p>
          </div>
        ) : projects.map(p => (
          <div key={p._id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="d-flex justify-between align-center mb-2">
              <h3><Link to={`/project/${p._id}`} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>{p.title}</Link></h3>
              <span className={`badge ${p.status === 'Completed' ? 'badge-low' : 'badge-medium'}`}>{p.status || 'Pending'}</span>
            </div>
            <p style={{ flex: 1, fontSize: '0.9rem' }}>{p.description}</p>
            <div className="d-flex justify-between align-center mt-3 pt-2" style={{ borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              <div className="d-flex align-center gap-1">
                <Users size={14} /> {p.members.length} Members
              </div>
              <div>Created by: {p.createdBy?.name}</div>
            </div>
            <Link to={`/project/${p._id}`} className="btn btn-outline mt-2" style={{ width: '100%' }}>View Details</Link>
          </div>
        ))}
      </div>

      {showModal && user.role === 'Admin' && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="d-flex justify-between align-center mb-3">
              <h2>Create New Project</h2>
              <button className="btn btn-outline" style={{ padding: '0.25rem' }} onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateProject}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input className="form-control" required value={newProject.title} onChange={e => setNewProject({...newProject, title: e.target.value})} placeholder="Project Name" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows="3" value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} placeholder="Project objective..." />
              </div>
              <div className="form-group">
                <label className="form-label">Assign Members</label>
                <select 
                  multiple 
                  className="form-control" 
                  style={{ height: '120px' }}
                  value={newProject.memberIds} 
                  onChange={e => {
                    const selected = Array.from(e.target.selectedOptions, option => option.value);
                    setNewProject({...newProject, memberIds: selected});
                  }}
                >
                  {allUsers.map(u => (
                    <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                  ))}
                </select>
                <small style={{ color: 'var(--text-muted)', display: 'block', marginTop: '0.5rem' }}>Hold Ctrl/Cmd to select multiple members.</small>
              </div>
              <div className="d-flex justify-between mt-4">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Project</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;
