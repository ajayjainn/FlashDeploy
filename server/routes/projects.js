import express from 'express';
import Project from '../models/Project.js';
const router = express.Router();

router.get('/', async (req, res) => {
  const projects = await Project.find({ owner: req.user.id });
  res.json(projects);
});

export default router;