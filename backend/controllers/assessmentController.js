import Assessment from '../models/Assessment.js';

export const getAssessments = async (req, res) => {
  try {
    const { projectId } = req.query;
    let query = {};
    if (projectId) query.projectId = projectId;

    if (req.user.role === 'Admin') {
      const assessments = await Assessment.find(query).populate('assignedTo', 'name').populate('projectId', 'title');
      res.json(assessments);
    } else {
      query.assignedTo = req.user._id;
      const assessments = await Assessment.find(query).populate('assignedTo', 'name').populate('projectId', 'title');
      res.json(assessments);
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const createAssessment = async (req, res) => {
  try {
    const { projectId, title, assignedTo } = req.body;
    const assessment = new Assessment({
      projectId,
      title,
      assignedTo,
      createdBy: req.user._id,
    });
    const createdAssessment = await assessment.save();
    res.status(201).json(createdAssessment);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const submitAssessment = async (req, res) => {
  try {
    const { submission } = req.body;
    const assessment = await Assessment.findById(req.params.id);

    if (!assessment) return res.status(404).json({ message: 'Assessment not found' });
    if (assessment.assignedTo.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to submit this assessment' });
    }

    assessment.submission = submission;
    assessment.status = 'Submitted';
    await assessment.save();
    res.json(assessment);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

export const reviewAssessment = async (req, res) => {
  try {
    const { score, feedback } = req.body;
    const assessment = await Assessment.findById(req.params.id);

    if (!assessment) return res.status(404).json({ message: 'Assessment not found' });

    assessment.score = score;
    assessment.feedback = feedback;
    assessment.status = 'Reviewed';
    await assessment.save();
    res.json(assessment);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
