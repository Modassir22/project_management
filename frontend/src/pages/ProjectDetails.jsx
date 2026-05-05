import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ArrowLeft, Trash2, Plus, Calendar, Flag, User as UserIcon, UserPlus, UserMinus, MessageSquare, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import api from '../services/api';

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals State
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({ title: '', description: '', assignedToId: '', priority: 'Medium', dueDate: '' });
  
  const [selectedTask, setSelectedTask] = useState(null);
  const [taskUpdateData, setTaskUpdateData] = useState({ status: '', feedback: '', assignedToId: '' });

  // Add Member State
  const [showAddMember, setShowAddMember] = useState(false);
  const [selectedNewMember, setSelectedNewMember] = useState('');

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      const [projectRes, tasksRes, usersRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks?projectId=${id}`),
        user.role === 'Admin' ? api.get('/auth/users') : { data: [] }
      ]);
      setProject(projectRes.data);
      setTasks(tasksRes.data);
      if (user.role === 'Admin') setAllUsers(usersRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProject = async () => {
    try {
      await api.delete(`/projects/${id}`);
      navigate('/projects');
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting project');
    }
  };

  const handleDeleteTask = async (taskId, e) => {
    if (e) e.stopPropagation();
    try {
      await api.delete(`/tasks/${taskId}`);
      if (selectedTask && selectedTask._id === taskId) setSelectedTask(null);
      fetchProjectData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting task');
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await api.post('/tasks', {
        ...newTask,
        projectId: id
      });
      setShowTaskModal(false);
      setNewTask({ title: '', description: '', assignedToId: '', priority: 'Medium', dueDate: '' });
      fetchProjectData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating task');
    }
  };

  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/tasks/${selectedTask._id}`, { 
        status: taskUpdateData.status,
        feedback: taskUpdateData.status === 'Done' ? taskUpdateData.feedback : '',
        ...(user.role === 'Admin' && { assignedToId: taskUpdateData.assignedToId || null })
      });
      setSelectedTask(null);
      fetchProjectData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating task');
    }
  };

  const handleAddMember = async () => {
    if (!selectedNewMember) return;
    try {
      await api.post(`/projects/${id}/add-member`, { userId: selectedNewMember });
      setSelectedNewMember('');
      setShowAddMember(false);
      fetchProjectData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error adding member');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member from the project?')) return;
    try {
      await api.delete(`/projects/${id}/remove-member`, { data: { userId } });
      fetchProjectData();
    } catch (err) {
      alert(err.response?.data?.message || 'Error removing member');
    }
  };

  const openTaskDetails = (task) => {
    setSelectedTask(task);
    setTaskUpdateData({ 
      status: task.status, 
      feedback: task.feedback || '',
      assignedToId: task.assignedTo?._id || ''
    });
  };

  if (loading) return <div>Loading project details...</div>;
  if (!project) return <div>Project not found or access denied.</div>;

  const canDeleteProject = user.role === 'Admin' || (project.createdBy && project.createdBy._id === user._id);
  const canManageTasks = user.role === 'Admin';
  
  const availableUsersToAdd = allUsers.filter(u => !project.members.some(m => m._id === u._id));

  const renderTaskColumn = (status, title) => {
    const columnTasks = tasks.filter(t => t.status === status);
    
    return (
      <div className="kanban-column">
        <div className="column-header">
          {title} <span className="badge" style={{ backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-primary)' }}>{columnTasks.length}</span>
        </div>
        {columnTasks.map(task => {
          const canDelete = user.role === 'Admin';

          return (
            <div key={task._id} className="task-card" onClick={() => openTaskDetails(task)}>
              <div className="task-card-header">
                <div className="task-title">{task.title}</div>
                {canDelete && (
                  <button className="btn" style={{ padding: '0', background: 'transparent', border: 'none', color: 'var(--text-muted)' }} onClick={(e) => handleDeleteTask(task._id, e)}>
                    <Trash2 size={14} className="hover-danger" />
                  </button>
                )}
              </div>
              
              {task.description && (
                <p style={{ fontSize: '0.8rem', marginBottom: '0.5rem', color: 'var(--text-muted)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', whiteSpace: 'pre-wrap' }}>
                  {task.description}
                </p>
              )}
              
              <div className="task-meta mb-2">
                {task.priority && (
                  <span className={`badge badge-${task.priority.toLowerCase()}`} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Flag size={10} /> {task.priority}
                  </span>
                )}
                {task.dueDate && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Calendar size={12} /> {format(new Date(task.dueDate), 'MMM dd')}
                  </span>
                )}
                {task.assignedTo && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', marginLeft: 'auto' }}>
                    <UserIcon size={12} /> {task.assignedTo.name}
                  </span>
                )}
              </div>
              {task.status === 'Done' && task.feedback && (
                <div className="mt-2 pt-2" style={{ borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <MessageSquare size={12} /> Feedback attached
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div>
      <div className="d-flex justify-between align-center mb-4">
        <div className="d-flex align-center gap-2">
          <Link to="/projects" className="btn btn-outline" style={{ padding: '0.4rem' }}>
            <ArrowLeft size={16} />
          </Link>
          <div>
            <h1 style={{ margin: 0 }}>{project.title}</h1>
            <div className="d-flex align-center gap-2 mt-1">
              <span className={`badge ${project.status === 'Completed' ? 'badge-low' : 'badge-medium'}`}>{project.status || 'Pending'}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Created by {project.createdBy?.name}</span>
            </div>
          </div>
        </div>
        <div className="d-flex gap-2">
          {canManageTasks && (
            <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}>
              <Plus size={16} /> Add Task
            </button>
          )}
          {canDeleteProject && (
            <button className="btn btn-danger" onClick={handleDeleteProject}>
              <Trash2 size={16} /> Delete Project
            </button>
          )}
        </div>
      </div>

      <p style={{ maxWidth: '800px', marginBottom: '2rem' }}>{project.description}</p>

      <div className="mb-4">
        <div className="d-flex justify-between align-center mb-2">
          <h3 style={{ margin: 0 }}>Team Members ({project.members?.length || 0})</h3>
          {user.role === 'Admin' && !showAddMember && (
            <button className="btn btn-outline" style={{ padding: '0.2rem 0.5rem', fontSize: '0.8rem' }} onClick={() => setShowAddMember(true)}>
              <UserPlus size={14} /> Add Member
            </button>
          )}
        </div>
        
        {showAddMember && (
          <div className="d-flex gap-2 mb-3 align-center p-3 card" style={{ backgroundColor: 'var(--bg-primary)' }}>
            <select className="form-control" style={{ maxWidth: '300px' }} value={selectedNewMember} onChange={(e) => setSelectedNewMember(e.target.value)}>
              <option value="">Select a user to add...</option>
              {availableUsersToAdd.map(u => (
                <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
              ))}
            </select>
            <button className="btn btn-primary" onClick={handleAddMember} disabled={!selectedNewMember}>Add</button>
            <button className="btn btn-outline" onClick={() => setShowAddMember(false)}>Cancel</button>
          </div>
        )}

        <div className="d-flex flex-wrap gap-2">
          {project.members?.map(m => (
            <div key={m._id} className="card" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div className="avatar" style={{ width: '24px', height: '24px', fontSize: '0.6rem' }}>
                {m.name.substring(0,2).toUpperCase()}
              </div>
              <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{m.name}</span>
              {user.role === 'Admin' && (
                <button 
                  className="btn" 
                  style={{ padding: '0.2rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', marginLeft: '0.5rem' }}
                  onClick={() => handleRemoveMember(m._id)}
                  title="Remove Member"
                >
                  <UserMinus size={14} className="hover-danger" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      <h3 className="mb-2 d-flex justify-between align-center mt-4">
        Task Board
      </h3>
      <div className="kanban-board">
        {renderTaskColumn('Todo', 'To Do')}
        {renderTaskColumn('In Progress', 'In Progress')}
        {renderTaskColumn('Done', 'Done')}
      </div>

      {showTaskModal && canManageTasks && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="d-flex justify-between align-center mb-3">
              <h2>Add New Task</h2>
              <button className="btn btn-outline" style={{ padding: '0.25rem' }} onClick={() => setShowTaskModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input className="form-control" required value={newTask.title} onChange={e => setNewTask({...newTask, title: e.target.value})} placeholder="Task title" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows="3" required value={newTask.description} onChange={e => setNewTask({...newTask, description: e.target.value})} placeholder="Task details" />
              </div>
              <div className="d-flex gap-2">
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Assignee</label>
                  <select className="form-control" value={newTask.assignedToId} onChange={e => setNewTask({...newTask, assignedToId: e.target.value})}>
                    <option value="">Unassigned</option>
                    {project.members && project.members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Priority</label>
                  <select className="form-control" value={newTask.priority} onChange={e => setNewTask({...newTask, priority: e.target.value})}>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Due Date</label>
                <input type="date" className="form-control" value={newTask.dueDate} onChange={e => setNewTask({...newTask, dueDate: e.target.value})} />
              </div>
              <div className="d-flex justify-between mt-4">
                <button type="button" className="btn btn-outline" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Task Details Popup Modal */}
      {selectedTask && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="d-flex justify-between align-center mb-3">
              <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <CheckCircle size={20} color="var(--accent-color)" /> Task Details
              </h2>
              <button className="btn btn-outline" style={{ padding: '0.25rem' }} onClick={() => setSelectedTask(null)}>&times;</button>
            </div>
            
            <div className="mb-4">
              <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: 'var(--text-primary)' }}>{selectedTask.title}</h3>
              <div className="d-flex gap-3 mb-3" style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                <span><strong>Priority:</strong> {selectedTask.priority}</span>
                <span><strong>Due:</strong> {selectedTask.dueDate ? format(new Date(selectedTask.dueDate), 'MMM dd, yyyy') : 'No date'}</span>
                <span><strong>Assignee:</strong> {selectedTask.assignedTo?.name || 'Unassigned'}</span>
              </div>
              <div className="card" style={{ padding: '1rem', backgroundColor: 'var(--bg-primary)' }}>
                <p style={{ margin: 0, whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>
                  {selectedTask.description || 'No description provided.'}
                </p>
              </div>
            </div>

            {/* If assigned to current user, or if admin, allow updating status */}
            {(user.role === 'Admin' || (selectedTask.assignedTo && selectedTask.assignedTo._id === user._id)) ? (
              <form onSubmit={handleUpdateTask}>
                
                {user.role === 'Admin' && (
                  <div className="form-group">
                    <label className="form-label">Assign Task To</label>
                    <select 
                      className="form-control" 
                      value={taskUpdateData.assignedToId || ''} 
                      onChange={e => setTaskUpdateData({...taskUpdateData, assignedToId: e.target.value})}
                    >
                      <option value="">Unassigned</option>
                      {project.members && project.members.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
                    </select>
                  </div>
                )}

                <div className="form-group">
                  <label className="form-label">Update Status</label>
                  <select 
                    className="form-control" 
                    value={taskUpdateData.status} 
                    onChange={e => setTaskUpdateData({...taskUpdateData, status: e.target.value})}
                  >
                    <option value="Todo">Todo</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Done">Done</option>
                  </select>
                </div>

                {taskUpdateData.status === 'Done' && (
                  <div className="form-group mt-3">
                    <label className="form-label">Completion Feedback (Optional)</label>
                    <textarea 
                      className="form-control" 
                      rows="3" 
                      value={taskUpdateData.feedback} 
                      onChange={e => setTaskUpdateData({...taskUpdateData, feedback: e.target.value})}
                      placeholder="Share your feedback, challenges faced, or outcome..."
                    />
                  </div>
                )}

                <div className="d-flex justify-between mt-4">
                  <button type="button" className="btn btn-outline" onClick={() => setSelectedTask(null)}>Close</button>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                </div>
              </form>
            ) : (
              <div>
                <hr style={{ borderColor: 'var(--border-color)', margin: '1.5rem 0' }} />
                {selectedTask.status === 'Done' && selectedTask.feedback && (
                  <div className="mb-3">
                    <h4 className="mb-1" style={{ color: 'var(--success)' }}>Feedback</h4>
                    <p style={{ fontStyle: 'italic' }}>"{selectedTask.feedback}"</p>
                  </div>
                )}
                <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => setSelectedTask(null)}>Close</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetails;
