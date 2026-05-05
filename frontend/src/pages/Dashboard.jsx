import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import { Layout, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, projectsRes] = await Promise.all([
        api.get('/tasks'),
        api.get('/projects')
      ]);
      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading dashboard data...</div>;

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'Done').length;
  const pendingTasks = tasks.filter(t => t.status !== 'Done').length;
  

  const recentTasks = [...tasks].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'High': return <span className="badge badge-high">High</span>;
      case 'Medium': return <span className="badge badge-medium">Medium</span>;
      case 'Low': return <span className="badge badge-low">Low</span>;
      default: return <span className="badge badge-medium">Medium</span>;
    }
  };

  return (
    <div>
      <div className="d-flex justify-between align-center mb-3">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, {user.name}. Here's what's happening today.</p>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-title">
            <Layout size={18} color="var(--text-secondary)" />
            Total Projects
          </div>
          <div className="stat-value">{projects.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">
            <CheckCircle size={18} color="var(--success)" />
            Completed Tasks
          </div>
          <div className="stat-value">{completedTasks}</div>
        </div>
        <div className="stat-card">
          <div className="stat-title">
            <Clock size={18} color="var(--warning)" />
            Pending Tasks
          </div>
          <div className="stat-value">{pendingTasks}</div>
        </div>
      </div>

      <div className="d-flex gap-3">
        <div style={{ flex: 2 }}>
          <h2 className="mb-2">Recent Tasks</h2>
          <div className="card" style={{ padding: '0' }}>
            <div className="table-container" style={{ border: 'none' }}>
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Project</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTasks.length === 0 ? (
                    <tr><td colSpan="5" className="text-center">No tasks found.</td></tr>
                  ) : recentTasks.map(task => (
                    <tr key={task._id}>
                      <td style={{ fontWeight: 500 }}>{task.title}</td>
                      <td>{task.project?.title || 'Unknown'}</td>
                      <td>{getPriorityBadge(task.priority)}</td>
                      <td>
                        <span className={`badge ${task.status === 'Done' ? 'badge-low' : 'badge-medium'}`}>
                          {task.status}
                        </span>
                      </td>
                      <td>{task.dueDate ? format(new Date(task.dueDate), 'MMM dd, yyyy') : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div style={{ flex: 1 }}>
          <h2 className="mb-2">Your Projects</h2>
          <div className="d-flex" style={{ flexDirection: 'column', gap: '1rem' }}>
            {projects.slice(0, 4).map(p => (
              <div key={p._id} className="card" style={{ padding: '1rem' }}>
                <div className="d-flex justify-between align-center mb-1">
                  <h3 style={{ margin: 0, fontSize: '1rem' }}>
                    <Link to={`/project/${p._id}`} style={{ color: 'var(--text-primary)', textDecoration: 'none' }}>{p.title}</Link>
                  </h3>
                  <span className={`badge ${p.status === 'Completed' ? 'badge-low' : 'badge-medium'}`}>{p.status}</span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Members: {p.members.length}
                </div>
              </div>
            ))}
            {projects.length > 4 && (
              <Link to="/projects" className="btn btn-outline" style={{ justifyContent: 'center' }}>
                View All Projects
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
