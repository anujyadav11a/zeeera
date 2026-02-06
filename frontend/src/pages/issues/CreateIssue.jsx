import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { createIssue } from '../../store/slices/issueSlice';
import { fetchProjectMembers } from '../../store/slices/projectSlice';
import { Layout } from '../../components/layout';
import { Input, Button, Card } from '../../components/ui';
import toast from 'react-hot-toast';

const CreateIssue = () => {
  const { projectId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { currentProject } = useSelector((state) => state.project);
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectMembers(projectId));
    }
  }, [dispatch, projectId]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setAttachments(files);
  };

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('priority', data.priority);
      formData.append('status', data.status);
      if (data.assignedTo) {
        formData.append('assignedTo', data.assignedTo);
      }
      
      attachments.forEach((file) => {
        formData.append('attachments', file);
      });

      const result = await dispatch(createIssue({ projectId, issueData: formData })).unwrap();
      toast.success('Issue created successfully!');
      navigate(`/project/${projectId}/issues/${result._id}`);
    } catch (error) {
      toast.error(error.message || 'Failed to create issue');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Issue</h1>
          <p className="text-gray-600 mt-2">
            {currentProject?.name} - Add a new issue to track and manage
          </p>
        </div>

        <Card>
          <Card.Header>
            <h2 className="text-xl font-semibold">Issue Details</h2>
          </Card.Header>
          <Card.Content>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                label="Title"
                placeholder="Enter issue title"
                error={errors.title?.message}
                {...register('title', {
                  required: 'Title is required',
                  minLength: {
                    value: 5,
                    message: 'Title must be at least 5 characters'
                  }
                })}
              />
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  placeholder="Describe the issue in detail..."
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  {...register('description', {
                    required: 'Description is required'
                  })}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Priority
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    {...register('priority', { required: 'Priority is required' })}
                  >
                    <option value="">Select priority</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                  {errors.priority && (
                    <p className="text-sm text-red-600">{errors.priority.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    {...register('status')}
                    defaultValue="open"
                  >
                    <option value="open">Open</option>
                    <option value="in-progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="closed">Closed</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Assign to
                </label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  {...register('assignedTo')}
                >
                  <option value="">Unassigned</option>
                  {currentProject?.members?.map((member) => (
                    <option key={member._id} value={member._id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Attachments
                </label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
                {attachments.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-600">Selected files:</p>
                    <ul className="text-sm text-gray-700">
                      {attachments.map((file, index) => (
                        <li key={index}>• {file.name}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/project/${projectId}/issues`)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create Issue'}
                </Button>
              </div>
            </form>
          </Card.Content>
        </Card>
      </div>
    </Layout>
  );
};

export default CreateIssue;