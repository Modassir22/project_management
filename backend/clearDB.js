import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import User from './models/User.js';
import Project from './models/Project.js';
import Task from './models/Task.js';
import Assessment from './models/Assessment.js';

dotenv.config();

const clearData = async () => {
  try {
    await connectDB();

    await User.deleteMany();
    await Project.deleteMany();
    await Task.deleteMany();
    await Assessment.deleteMany();

    console.log('Data Destroyed!');
    process.exit();
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

clearData();
