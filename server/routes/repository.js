import express from 'express';
import { 
  getUserRepositories, 
  getRepositoryDetails, 
} from '../utils/githubApi.js';

const router = express.Router();

// Get all repositories for the authenticated user
router.get('/', async (req, res) => {
  try {
    const repos = await getUserRepositories(req.user.accessToken);
    res.json(repos);
  } catch (error) {
    console.error('Error fetching repositories:', error);
    res.status(500).json({ error: 'Failed to fetch repositories' });
  }
});

// Get details for a specific repository
router.get('/:owner/:repo', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const repoDetails = await getRepositoryDetails(req.user.accessToken, owner, repo);
    res.json(repoDetails);
  } catch (error) {
    console.error('Error fetching repository details:', error);
    res.status(500).json({ error: 'Failed to fetch repository details' });
  }
});


export default router; 