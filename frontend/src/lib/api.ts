import { API_ENDPOINTS } from "./config";

export interface Repository {
  id: string;
  name: string;
  description: string;
  owner: string;
  private: boolean;
}

export interface Project {
  id: string;
  name: string;
  slug: string;
  repository: string;
  deployedUrl: string;
  status: 'Deployed' | 'Deploying' | 'Error';
  createdAt: string;
  updatedAt: string;
}

export interface DeployResponse {
  Status: string; // URL of the deployed app
}

interface GitHubRepo {
  id?: number | string;
  name?: string;
  description?: string;
  owner?: {
    login?: string;
  };
  private?: boolean;
}

/**
 * Helper function to get auth headers
 */
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('auth_token');
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  return headers;
};

/**
 * Fetch user's GitHub repositories
 */
export async function getRepositories(): Promise<Repository[]> {
  try {
    const response = await fetch(API_ENDPOINTS.REPOSITORIES, {
      headers: getAuthHeaders(),
      credentials: 'include', // Important for sending authentication cookies
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized: Please log in again');
      }
      throw new Error('Failed to fetch repositories');
    }

    const data = await response.json();
    
    // Ensure data is an array
    if (!Array.isArray(data)) {
      console.error('Repository data is not an array:', data);
      return [];
    }
    
    // Transform the response to match our Repository interface
    return data.map((repo: GitHubRepo) => ({
      id: repo?.id?.toString() || `repo-${Math.random().toString(36).substr(2, 9)}`,
      name: repo?.name || 'Unknown Repository',
      description: repo?.description || 'No description',
      owner: repo?.owner?.login || 'unknown',
      private: repo?.private || false,
    }));
  } catch (error) {
    console.error('Error fetching repositories:', error);
    return []; // Return empty array instead of throwing
  }
}

/**
 * Fetch user's projects
 */
export async function getUserProjects(): Promise<Project[]> {
  try {
    const response = await fetch(API_ENDPOINTS.USER_PROJECTS, {
      headers: getAuthHeaders(),
      credentials: 'include', // Important for sending authentication cookies
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized: Please log in again');
      }
      throw new Error('Failed to fetch user projects');
    }

    const data = await response.json();
    
    // Ensure data is an array
    if (!Array.isArray(data)) {
      console.error('Project data is not an array:', data);
      return [];
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching user projects:', error);
    return []; // Return empty array instead of throwing
  }
}

/**
 * Get details for a specific repository
 */
export async function getRepositoryDetails(owner: string, repo: string): Promise<GitHubRepo | null> {
  try {
    const response = await fetch(API_ENDPOINTS.REPOSITORY_DETAILS(owner, repo), {
      headers: getAuthHeaders(),
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized: Please log in again');
      }
      throw new Error('Failed to fetch repository details');
    }

    return response.json();
  } catch (error) {
    console.error('Error fetching repository details:', error);
    return null; // Return null instead of throwing
  }
}

/**
 * Deploy a project from a GitHub repository
 */
export async function deployProject(owner: string, repo: string, slug: string): Promise<DeployResponse> {
  try {
    if (!owner || !repo || !slug) {
      throw new Error('Missing required parameters');
    }
    
    const response = await fetch(API_ENDPOINTS.DEPLOY_PROJECT, {
      method: 'POST',
      headers: getAuthHeaders(),
      credentials: 'include',
      body: JSON.stringify({
        gitHubUrl: `https://github.com/${owner}/${repo}`,
        slug: slug
      }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('Unauthorized: Please log in again');
      }
      const errorData = await response.json();
      console.log(errorData.error, 'errorDatsdfkjna');
      throw new Error(`Failed to deploy project: ${errorData.error}`);
    }

    const data = await response.json();
    return { Status: data?.Status || `https://${slug}.domain.com` };
  } catch (error) {
    console.error('Error deploying project:', error);
    throw error; // We still throw here as this is a critical operation
  }
}
