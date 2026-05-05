import Task from '../models/Task.js';
import Project from '../models/Project.js';

export const getTasks = async (req, res) => {
  try {
    const { projectId } = req.query;
    let query = {};
    if (projectId) query.project = projectId;

    if (req.user.role === 'Admin') {
      const tasks = await Task.find(query).populate('project', 'title createdBy').populate('assignedTo', 'name');
      res.json(tasks);
    } else {
      if (projectId) {

        const project = await Project.findById(projectId);
        if (project && project.members.includes(req.user._id)) {

           const tasks = await Task.find(query).populate('project', 'title').populate('assignedTo', 'name');
           return res.json(tasks);
        } else {
           return res.status(403).json({ message: 'Not authorized' });
        }
      } else {

        query.assignedTo = req.user._id;
        const tasks = await Task.find(query).populate('project', 'title').populate('assignedTo', 'name');
        res.json(tasks);
      }
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createTask = async (req, res) => {
  try {
    const { title, description, projectId, assignedToId, priority, dueDate } = req.body;
    const task = new Task({
      title,
      description,
      project: projectId,
      assignedTo: assignedToId || null,
      priority,
      dueDate,
    });
    const createdTask = await task.save();
    res.status(201).json(createdTask);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { status, priority, dueDate, assignedToId, feedback } = req.body;
    const task = await Task.findById(req.params.id);

    if (task) {
      if (req.user.role !== 'Admin' && (!task.assignedTo || task.assignedTo.toString() !== req.user._id.toString())) {
        return res.status(403).json({ message: 'Not authorized to update this task' });
      }
      
      if (status) task.status = status;
      if (feedback !== undefined) task.feedback = feedback;
      
      if (req.user.role === 'Admin') {
         if (priority) task.priority = priority;
         if (dueDate) task.dueDate = dueDate;
         if (assignedToId !== undefined) task.assignedTo = assignedToId;
      }

      const updatedTask = await task.save();
      res.json(updatedTask);
    } else {
      res.status(404).json({ message: 'Task not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    await Task.deleteOne({ _id: req.params.id });
    res.json({ message: 'Task removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
