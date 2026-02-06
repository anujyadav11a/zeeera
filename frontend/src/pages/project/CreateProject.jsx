import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useForm } from 'react-hook-form';
import { createProject } from '../../store/slices/projectSlice';
import { Layout } from '../../components/layout';
import { Input, Button, Card } from '../../components/ui';
import toast from 'react-hot-toast';

const CreateProject = () => {
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    try {
      const result = await dispatch(createProject(data)).unwrap();
      toast.success('Project created successfully!');
      navigate(`/project/${result._id}`);
    } catch (error) {
      toast.error(error.message || 'Failed to create project');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
          <p className="text-gray-600 mt-2">
            Set up a new project to start tracking issues and collaborating with your team
          </p>
        </div>

        <Card>
          <Card.Header>
            <h2 className="text-xl font-semibold">Project Details</h2>
          </Card.Header>
          <Card.Content>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <Input
                label="Project Name"
                placeholder="Enter project name"
                error={errors.name?.message}
                {...register('name', {
                  required: 'Project name is required',
                  minLength: {
                    value: 3,
                    message: 'Project name must be at least 3 characters'
                  }
                })}
              />
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  placeholder="Enter project description (optional)"
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  {...register('description')}
                />
                {errors.description && (
                  <p className="text-sm text-red-600">{errors.description.message}</p>
                )}
              </div>
              
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/dashboard')}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating...' : 'Create Project'}
                </Button>
              </div>
            </form>
          </Card.Content>
        </Card>
      </div>
    </Layout>
  );
};

export default CreateProject;