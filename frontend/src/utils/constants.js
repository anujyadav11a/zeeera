// API endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/User/login',
    REGISTER: '/User/register',
    CURRENT_USER: '/User/current',
  },
  PROJECT: {
    CREATE: '/project/create',
    USER_PROJECTS: '/project/user-projects',
    BY_ID: (id) => `/project/${id}`,
    MEMBERS: (id) => `/project/${id}/members`,
  },
  ISSUE: {
    CREATE: (projectId) => `/issue/create/${projectId}`,
    BY_PROJECT: (projectId) => `/issue/project/${projectId}`,
    BY_ID: (id) => `/issue/${id}`,
    UPDATE_STATUS: (id) => `/issue/${id}/status`,
    ASSIGN: (id) => `/issue/${id}/assign`,
    COMMENTS: (id) => `/issue/${id}/comments`,
  },
};

// Issue status options
export const ISSUE_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in-progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
};

// Issue priority options
export const ISSUE_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
};

// Project roles
export const PROJECT_ROLES = {
  ADMIN: 'admin',
  MEMBER: 'member',
};

// File upload constraints
export const FILE_UPLOAD = {
  MAX_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_TYPES: [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
  ],
};

// UI constants
export const COLORS = {
  PRIMARY: '#3B82F6',
  SUCCESS: '#10B981',
  WARNING: '#F59E0B',
  ERROR: '#EF4444',
  INFO: '#6B7280',
};

export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
};