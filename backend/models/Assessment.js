import mongoose from 'mongoose';

const assessmentSchema = mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Project',
  },
  title: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  submission: {
    type: String,
  },
  score: {
    type: Number,
  },
  feedback: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Pending', 'Submitted', 'Reviewed'],
    default: 'Pending',
  },
}, {
  timestamps: true,
});

const Assessment = mongoose.model('Assessment', assessmentSchema);

export default Assessment;
