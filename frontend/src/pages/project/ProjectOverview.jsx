import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Users, FileText, Plus, Settings } from 'lucide-react';
import { fetchProjectById } from '../../store/slices/projectSlice';
import { fetchProjectIssues } from '../../store/slices/issueSlice';
import { addProjectMember } from '../../store/slices/projectSlice';
import { Layout } from '../../components/layout';
import { Button, Card, Modal } from '../../components/ui';
import { useForm } from 'react-hook-form';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ProjectOverview = () => {
  const { projectId } = useParams();
  const { currentProject, isLoading } = useSelector((state) => state.project);
  const { issues } = useSelector((state) => state.issue);
  const dispatch = useDispatch();
  
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [isAddingMember, setIsAddingMember] = useState(false);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm();

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectById(projectId));
      dispatch(fetchProjectIssues(projectId));
    }
  }, [dispatch, projectId]);

  const fetchAvailableUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await api.get('/User/all');
      setAvailableUsers(response.data.data || []);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleOpenAddMemberModal = () => {
    setIsAddMemberModalOpen(true);
    fetchAvailableUsers();
  };

  const handleAddMember = async (data) => {
    setIsAddingMember(true);
    try {
      await dispatch(addProjectMember({
        projectId,
        memberData: {
          userId: data.userId,
          role: data.role
        }
      })).unwrap();
      
      toast.success('Member added successfully!');
      setIsAddMemberModalOpen(false);
      reset();
    } catch (error) {
      toast.error(error.message || 'Failed to add member');
    } finally {
      setIsAddingMember(false);
    }
  };

  // Calculate issue statistics
  const totalIssues = issues.length;
  const openIssues = issues.filter(issue => issue.status === 'open').length;
  const completedIssues = issues.filter(issue => issue.status === 'resolved' || issue.status === 'closed').length;
  const recentIssues = issues.slice(0, 5); // Get 5 most recent issues

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'text-blue-600 bg-blue-100';
      case 'in-progress': return 'text-yellow-600 bg-yellow-100';
      case 'resolved': return 'text-green-600 bg-green-100';
      case 'closed': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

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
                <p className="text-2xl font-bold text-gray-900">{totalIssues}</p>
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
                <p className="text-2xl font-bold text-gray-900">{openIssues}</p>
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
                <p className="text-2xl font-bold text-gray-900">{completedIssues}</p>
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
              {recentIssues.length > 0 ? (
                <div className="space-y-3">
                  {recentIssues.map((issue) => (
                    <Link 
                      key={issue._id} 
                      to={`/project/${projectId}/issues/${issue._id}`}
                      className="block hover:bg-gray-50 p-3 rounded-lg transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 truncate">
                            {issue.title}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {issue.key} • {new Date(issue.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(issue.priority)}`}>
                            {issue.priority}
                          </span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                            {issue.status}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No issues yet. Create your first issue to get started.
                </div>
              )}
            </Card.Content>
          </Card>

          <Card>
            <Card.Header>
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Team Members</h3>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleOpenAddMemberModal}
                >
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

        {/* Add Member Modal */}
        <Modal
          isOpen={isAddMemberModalOpen}
          onClose={() => setIsAddMemberModalOpen(false)}
          title="Add Team Member"
        >
          <form onSubmit={handleSubmit(handleAddMember)} className="space-y-4">
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Select User
              </label>
              {loadingUsers ? (
                <div className="text-sm text-gray-500">Loading users...</div>
              ) : (
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  {...register('userId', { required: 'Please select a user' })}
                >
                  <option value="">Select a user</option>
                  {availableUsers.map((user) => (
                    <option key={user._id} value={user._id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              )}
              {errors.userId && (
                <p className="text-sm text-red-600">{errors.userId.message}</p>
              )}
            </div>
            
            <div className="space-y-1">
              <label className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                {...register('role', { required: 'Role is required' })}
              >
                <option value="">Select role</option>
                <option value="viewer">Viewer</option>
                <option value="member">Member</option>
                <option value="developer">Developer</option>
                <option value="leader">Leader</option>
              </select>
              {errors.role && (
                <p className="text-sm text-red-600">{errors.role.message}</p>
              )}
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsAddMemberModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isAddingMember}
              >
                {isAddingMember ? 'Adding...' : 'Add Member'}
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Layout>
  );
};

export default ProjectOverview;