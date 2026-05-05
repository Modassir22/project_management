import Project from '../models/Project.js';
import Task from '../models/Task.js';
import Assessment from '../models/Assessment.js';

export const getProjects = async (req, res) => {
  try {
    let projects;
    if (req.user.role === 'Admin') {
      projects = await Project.find({}).populate('createdBy', 'name').populate('members', 'name');
    } else {
      projects = await Project.find({ members: req.user._id }).populate('createdBy', 'name').populate('members', 'name');
    }
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createProject = async (req, res) => {
  try {
    const { title, description, memberIds } = req.body;
    const project = new Project({
      title,
      description,
      createdBy: req.user._id,
      members: memberIds || [],
    });
    const createdProject = await project.save();
    res.status(201).json(createdProject);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate('createdBy', 'name').populate('members', 'name email');
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (req.user.role !== 'Admin' && !project.members.some(m => m._id.toString() === req.user._id.toString())) {
      return res.status(403).json({ message: 'Not authorized to view this project' });
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { title, description, status } = req.body;
    const project = await Project.findById(req.params.id);

    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (title) project.title = title;
    if (description) project.description = description;
    if (status) project.status = status;

    const updatedProject = await project.save();
    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    await Project.deleteOne({ _id: req.params.id });
    await Task.deleteMany({ project: req.params.id });
    await Assessment.deleteMany({ projectId: req.params.id });
    res.json({ message: 'Project removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const addMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    if (!project.members.includes(userId)) {
      project.members.push(userId);
      await project.save();
    }
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const removeMember = async (req, res) => {
  try {
    const { userId } = req.body;
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    project.members = project.members.filter(m => m.toString() !== userId);
    await project.save();
    res.json(project);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
