import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Plus, Search, Filter } from 'lucide-react';
import { fetchProjectIssues } from '../../store/slices/issueSlice';
import { Layout } from '../../components/layout';
import { Button, Card, Input } from '../../components/ui';

const IssueList = () => {
  const { projectId } = useParams();
  const { issues, isLoading } = useSelector((state) => state.issue);
  const { currentProject } = useSelector((state) => state.project);
  const dispatch = useDispatch();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    if (projectId) {
      dispatch(fetchProjectIssues(projectId));
    }
  }, [dispatch, projectId]);

  const filteredIssues = issues.filter(issue => {
    const matchesSearch = issue.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || issue.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || issue.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

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
          <div className="text-lg text-gray-600">Loading issues...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Issues</h1>
            <p className="text-gray-600 mt-2">
              {currentProject?.name} - Manage and track project issues
            </p>
          </div>
          <Link to={`/project/${projectId}/issues/create`}>
            <Button className="flex items-center space-x-2">
              <Plus size={20} />
              <span>New Issue</span>
            </Button>
          </Link>
        </div>

        <Card>
          <Card.Content>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search issues..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                  <option value="closed">Closed</option>
                </select>
                
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Priority</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </Card.Content>
        </Card>

        {filteredIssues.length === 0 ? (
          <Card>
            <Card.Content className="text-center py-12">
              <div className="text-gray-400 mb-4">
                <Filter size={48} className="mx-auto" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No issues found
              </h3>
              <p className="text-gray-600 mb-4">
                {issues.length === 0 
                  ? "Get started by creating your first issue"
                  : "Try adjusting your search or filters"
                }
              </p>
              {issues.length === 0 && (
                <Link to={`/project/${projectId}/issues/create`}>
                  <Button>Create Issue</Button>
                </Link>
              )}
            </Card.Content>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredIssues.map((issue) => (
              <Link key={issue._id} to={`/project/${projectId}/issues/${issue._id}`}>
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <Card.Content>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {issue.title}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <span>#{issue._id.slice(-6)}</span>
                          <span>•</span>
                          <span>Created by {issue.createdBy?.name}</span>
                          <span>•</span>
                          <span>{new Date(issue.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(issue.priority)}`}>
                          {issue.priority}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(issue.status)}`}>
                          {issue.status}
                        </span>
                        {issue.assignedTo && (
                          <div className="flex items-center space-x-2">
                            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-blue-600">
                                {issue.assignedTo.name?.charAt(0).toUpperCase()}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Card.Content>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default IssueList;