import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

// Pages
import Landing from '../pages/Landing';
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import Dashboard from '../pages/Dashboard';
import ProjectOverview from '../pages/project/ProjectOverview';
import CreateProject from '../pages/project/CreateProject';
import IssueList from '../pages/issues/IssueList';
import CreateIssue from '../pages/issues/CreateIssue';
import IssueDetail from '../pages/issues/IssueDetail';

// Components
import ProtectedRoute from '../components/ProtectedRoute';

const AppRoutes = () => {
  const { isAuthenticated } = useSelector((state) => state.auth);

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Landing />} 
      />
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} 
      />
      <Route 
        path="/register" 
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Register />} 
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      
      {/* Project Routes */}
      <Route
        path="/projects/create"
        element={
          <ProtectedRoute>
            <CreateProject />
          </ProtectedRoute>
        }
      />
      <Route
        path="/project/:projectId"
        element={
          <ProtectedRoute>
            <ProjectOverview />
          </ProtectedRoute>
        }
      />
      
      {/* Issue Routes */}
      <Route
        path="/project/:projectId/issues"
        element={
          <ProtectedRoute>
            <IssueList />
          </ProtectedRoute>
        }
      />
      <Route
        path="/project/:projectId/issues/create"
        element={
          <ProtectedRoute>
            <CreateIssue />
          </ProtectedRoute>
        }
      />
      <Route
        path="/project/:projectId/issues/:issueId"
        element={
          <ProtectedRoute>
            <IssueDetail />
          </ProtectedRoute>
        }
      />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default AppRoutes;