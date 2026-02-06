import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchProjectIssues = createAsyncThunk(
  'issue/fetchProjectIssues',
  async (projectId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/project/${projectId}/list-Issues`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch issues');
    }
  }
);

export const fetchIssueById = createAsyncThunk(
  'issue/fetchIssueById',
  async (issueId, { rejectWithValue }) => {
    try {
      const response = await api.get(`/issue/get-Issue/${issueId}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch issue');
    }
  }
);

export const createIssue = createAsyncThunk(
  'issue/createIssue',
  async ({ projectId, issueData }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/project/${projectId}/issues`, issueData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create issue');
    }
  }
);

export const updateIssue = createAsyncThunk(
  'issue/updateIssue',
  async ({ issueId, issueData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/issue/update-Issue/${issueId}`, issueData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update issue');
    }
  }
);

export const updateIssueStatus = createAsyncThunk(
  'issue/updateIssueStatus',
  async ({ issueId, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/issue/update-Issue/${issueId}`, { status });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update status');
    }
  }
);

export const assignIssue = createAsyncThunk(
  'issue/assignIssue',
  async ({ issueId, assigneeId }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/issue/assign-issue/${issueId}`, { assignedTo: assigneeId });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to assign issue');
    }
  }
);

export const addComment = createAsyncThunk(
  'issue/addComment',
  async ({ issueId, comment }, { rejectWithValue }) => {
    try {
      const response = await api.post(`/issue/${issueId}/comments`, { content: comment });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add comment');
    }
  }
);

const initialState = {
  issues: [],
  currentIssue: null,
  isLoading: false,
  error: null,
  filters: {
    status: 'all',
    priority: 'all',
    assignee: 'all',
  },
};

const issueSlice = createSlice({
  name: 'issue',
  initialState,
  reducers: {
    clearCurrentIssue: (state) => {
      state.currentIssue = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {
        status: 'all',
        priority: 'all',
        assignee: 'all',
      };
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch project issues
      .addCase(fetchProjectIssues.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchProjectIssues.fulfilled, (state, action) => {
        state.isLoading = false;
        state.issues = action.payload;
      })
      .addCase(fetchProjectIssues.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Fetch issue by ID
      .addCase(fetchIssueById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchIssueById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentIssue = action.payload;
      })
      .addCase(fetchIssueById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Create issue
      .addCase(createIssue.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createIssue.fulfilled, (state, action) => {
        state.isLoading = false;
        state.issues.push(action.payload);
        state.currentIssue = action.payload;
      })
      .addCase(createIssue.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      // Update issue
      .addCase(updateIssue.fulfilled, (state, action) => {
        const index = state.issues.findIndex(i => i._id === action.payload._id);
        if (index !== -1) {
          state.issues[index] = action.payload;
        }
        if (state.currentIssue?._id === action.payload._id) {
          state.currentIssue = action.payload;
        }
      })
      // Update issue status
      .addCase(updateIssueStatus.fulfilled, (state, action) => {
        const index = state.issues.findIndex(i => i._id === action.payload._id);
        if (index !== -1) {
          state.issues[index] = action.payload;
        }
        if (state.currentIssue?._id === action.payload._id) {
          state.currentIssue = action.payload;
        }
      })
      // Assign issue
      .addCase(assignIssue.fulfilled, (state, action) => {
        const index = state.issues.findIndex(i => i._id === action.payload._id);
        if (index !== -1) {
          state.issues[index] = action.payload;
        }
        if (state.currentIssue?._id === action.payload._id) {
          state.currentIssue = action.payload;
        }
      })
      // Add comment
      .addCase(addComment.fulfilled, (state, action) => {
        if (state.currentIssue) {
          state.currentIssue.comments = state.currentIssue.comments || [];
          state.currentIssue.comments.push(action.payload);
        }
      });
  },
});

export const { clearCurrentIssue, clearError, setFilters, clearFilters } = issueSlice.actions;
export default issueSlice.reducer;