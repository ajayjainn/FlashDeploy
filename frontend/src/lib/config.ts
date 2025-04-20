// API configuration for production and development environments

// Define the base URL for API requests
export const API_BASE_URL = import.meta.env.PROD 
  ? '/api' 
  : 'http://localhost:5001/api';

// Endpoints for various API resources
export const API_ENDPOINTS = {
  // Auth
  AUTH_STATUS: `${API_BASE_URL}/auth/status`,
  AUTH_STATUS_PUBLIC: `${API_BASE_URL}/auth/status/public`,
  AUTH_GITHUB: `${API_BASE_URL}/auth/github`,
  AUTH_LOGOUT: `${API_BASE_URL}/auth/logout`,
  
  // Repositories
  REPOSITORIES: `${API_BASE_URL}/repositories`,
  REPOSITORY_DETAILS: (owner: string, repo: string) => 
    `${API_BASE_URL}/repositories/${owner}/${repo}`,
    
  // Projects
  USER_PROJECTS: `${API_BASE_URL}/projects`,
    
  // Deployment
  DEPLOY_PROJECT: `${API_BASE_URL}/deploy/project`,
}; 