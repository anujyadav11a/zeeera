import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Users, FileText, Plus, Settings } from 'lucide-react';
import { fetchProjectById } from '../../store/slices/projectSlice';
import { Layout } from '../../components/layout';
import { Button, Card } from '../../components/ui';

const ProjectOverview = () => {
  const { projectId } = useParams();
  const { currentProject, isLoading } = useSelector((state) => state.project);
  const dispatch = useDispatch();

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectById(projectId));
    }
  }, [dispatch, projectId]);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-600">Loading project...</div>
        </div>
      </Layout>
    );
  }

  if (!currentProject) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Project not found</h2>
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
              {currentProject.name}
            </h1>
            <p className="text-gray-600 mt-2">
              {currentProject.description || 'No description available'}
            </p>
          </div>
          <div className="flex space-x-3">
            <Link to={`/project/${projectId}/issues/create`}>
              <Button className="flex items-center space-x-2">
                <Plus size={20} />
                <span>New Issue</span>
              </Button>
            </Link>
            <Button variant="outline" className="flex items-center space-x-2">
              <Settings size={20} />
              <span>Settings</span>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-4 gap-6">
          <Card>
            <Card.Content className="flex items-center space-x-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-600">Total Issues</p>
              </div>
            </Card.Content>
          </Card>
          
          <Card>
            <Card.Content className="flex items-center space-x-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FileText className="w-6 h-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-600">Open Issues</p>
              </div>
            </Card.Content>
          </Card>
          
          <Card>
            <Card.Content className="flex items-center space-x-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">0</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </Card.Content>
          </Card>
          
          <Card>
            <Card.Content className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {currentProject.members?.length || 0}
                </p>
                <p className="text-sm text-gray-600">Team Members</p>
              </div>
            </Card.Content>
          </Card>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Recent Issues</h3>
                <Link to={`/project/${projectId}/issues`}>
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
            </Card.Header>
            <Card.Content>
              <div className="text-center py-8 text-gray-500">
                No issues yet. Create your first issue to get started.
              </div>
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Team Members</h3>
                <Button variant="outline" size="sm">
                  <Plus size={16} className="mr-1" />
                  Add Member
                </Button>
              </div>
            </Card.Header>
            <Card.Content>
              {currentProject.members && currentProject.members.length > 0 ? (
                <div className="space-y-3">
                  {currentProject.members.map((member) => (
                    <div key={member._id} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-sm font-medium text-blue-600">
                          {member.name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{member.name}</p>
                        <p className="text-xs text-gray-500">{member.role}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No team members yet.
                </div>
              )}
            </Card.Content>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ProjectOverview;