import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { Plus, Users, FileText, Clock } from 'lucide-react';
import { fetchUserProjects } from '../store/slices/projectSlice';
import { Layout } from '../components/layout';
import { Button, Card } from '../components/ui';

const Dashboard = () => {
  const { projects, isLoading } = useSelector((state) => state.project);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchUserProjects());
  }, [dispatch]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your projects and track issues
            </p>
          </div>
          <Link to="/projects/create">
            <Button className="flex items-center space-x-2">
              <Plus size={20} />
              <span>New Project</span>
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card>
            <Card.Content className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{projects.length}</p>
                <p className="text-sm text-gray-600">Total Projects</p>
              </div>
            </Card.Content>
          </Card>
          
          <Card>
            <Card.Content className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {projects.reduce((acc, project) => acc + (project.members?.length || 0), 0)}
                </p>
                <p className="text-sm text-gray-600">Team Members</p>
              </div>
            </Card.Content>
          </Card>
          
          <Card>
            <Card.Content className="flex items-center space-x-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Clock className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-600">Active Issues</p>
              </div>
            </Card.Content>
          </Card>
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Projects</h2>
          {projects.length === 0 ? (
            <Card>
              <Card.Content className="text-center py-12">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No projects yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Get started by creating your first project
                </p>
                <Link to="/projects/create">
                  <Button>Create Project</Button>
                </Link>
              </Card.Content>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Link key={project._id} to={`/project/${project._id}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer">
                    <Card.Header>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {project.name}
                      </h3>
                    </Card.Header>
                    <Card.Content>
                      <p className="text-gray-600 text-sm mb-4">
                        {project.description || 'No description'}
                      </p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <span>{project.members?.length || 0} members</span>
                        <span>0 issues</span>
                      </div>
                    </Card.Content>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;