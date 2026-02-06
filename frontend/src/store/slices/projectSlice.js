import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchUserProjects = createAsyncThunk(
  'project/fetchUserProjects',
  async (_, { rejectWithValue }) => {
    try {
      // For now, we'll get projects where user is a member
      // This will need a backend endpoint, but let's try a workaround
      const response = await api.get('/project/user-projects');
      return response.data.data;
    } catch (error) {
      // If the endpoint doesn't exist, return empty array for now
      if (error.response?.status === 404) {
        return [];
      }
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch projects');
    }
  }
);

export const fetchProjectById = createAsyncThunk(
  'project/fetchProjectById',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/project/get-ProjectDetails/${projectId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch project');
    }
  }
);

export const createProject = createAsyncThunk(
  'project/createProject',
  async (projectData, { rejectWithValue }) => {
    try {
      const response = await api.post('/project/create-Project', projectData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create project');
    }
  }
);

export const updateProject = createAsyncThunk(
  'project/updateProject',
  async ({ projectId, projectData }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/project/${projectId}`, projectData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update project');
    }
  }
);

export const fetchProjectMembers = createAsyncThunk(
  'project/fetchProjectMembers',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/project/list-Members/${projectId}`);
      return response.data.data.members || response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch members');
    }
  }
);

export const addProjectMember = createAsyncThunk(
  'project/addProjectMember',
  async ({ projectId, memberData }, { rejectWithValue }) => {
    try {
      const response = await api.post('/project/add-Member', {
        ProjectId: projectId,
        userId: memberData.userId,
        role: memberData.role
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add member');
    }
  }
);

const initialState = {
  projects: [],
  currentProject: null,
  isLoading: false,
  error: null,
};

const projectSlice = createSlice({
  name: 'project',
  initialState,
  reducers: {
    clearCurrentProject: (state) => {
      state.currentProject = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch user projects
      .addCase(fetchUserProjects.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserProjects.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects = action.payload;
      })
      .addCase(fetchUserProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch project by ID
      .addCase(fetchProjectById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentProject = action.payload;
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create project
      .addCase(createProject.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.isLoading = false;
        state.projects.push(action.payload);
        state.currentProject = action.payload;
      })
      .addCase(createProject.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update project
      .addCase(updateProject.fulfilled, (state, action) => {
        const index = state.projects.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.projects[index] = action.payload;
        }
        if (state.currentProject?._id === action.payload._id) {
          state.currentProject = action.payload;
        }
      })
      // Fetch project members
      .addCase(fetchProjectMembers.fulfilled, (state, action) => {
        if (state.currentProject) {
          state.currentProject.members = action.payload;
        }
      })
      // Add project member
      .addCase(addProjectMember.fulfilled, (state, action) => {
        if (state.currentProject) {
          state.currentProject.members = state.currentProject.members || [];
          state.currentProject.members.push(action.payload);
        }
      });
  },
});

export const { clearCurrentProject, clearError } = projectSlice.actions;
export default projectSlice.reducer;