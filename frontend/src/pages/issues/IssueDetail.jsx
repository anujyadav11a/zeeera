import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Calendar, User, Paperclip, MessageCircle } from 'lucide-react';
import { fetchIssueById, updateIssueStatus } from '../../store/slices/issueSlice';
import { Layout } from '../../components/layout';
import { Button, Card } from '../../components/ui';
import toast from 'react-hot-toast';

const IssueDetail = () => {
  const { projectId, issueId } = useParams();
  const { currentIssue, isLoading } = useSelector((state) => state.issue);
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  
  const [newComment, setNewComment] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (issueId) {
      dispatch(fetchIssueById(issueId));
    }
  }, [dispatch, issueId]);

  const handleStatusUpdate = async (newStatus) => {
    setIsUpdating(true);
    try {
      await dispatch(updateIssueStatus({ issueId, status: newStatus })).unwrap();
      toast.success('Issue status updated successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    } finally {
      setIsUpdating(false);
    }
  };

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
          <div className="text-lg text-gray-600">Loading issue...</div>
        </div>
      </Layout>
    );
  }

  if (!currentIssue) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900">Issue not found</h2>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(currentIssue.priority)}`}>
                {currentIssue.priority} priority
              </span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(currentIssue.status)}`}>
                {currentIssue.status}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {currentIssue.title}
            </h1>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>#{currentIssue._id.slice(-6)}</span>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <User size={16} />
                <span>Created by {currentIssue.createdBy?.name}</span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-1">
                <Calendar size={16} />
                <span>{new Date(currentIssue.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          
          <div className="flex space-x-2">
            {currentIssue.status !== 'in-progress' && (
              <Button
                variant="outline"
                onClick={() => handleStatusUpdate('in-progress')}
                disabled={isUpdating}
              >
                Start Progress
              </Button>
            )}
            {currentIssue.status !== 'resolved' && currentIssue.status !== 'closed' && (
              <Button
                onClick={() => handleStatusUpdate('resolved')}
                disabled={isUpdating}
              >
                Mark Resolved
              </Button>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <Card.Header>
                <h3 className="text-lg font-semibold">Description</h3>
              </Card.Header>
              <Card.Content>
                <div className="prose max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {currentIssue.description}
                  </p>
                </div>
              </Card.Content>
            </Card>

            {currentIssue.attachments && currentIssue.attachments.length > 0 && (
              <Card>
                <Card.Header>
                  <h3 className="text-lg font-semibold flex items-center space-x-2">
                    <Paperclip size={20} />
                    <span>Attachments</span>
                  </h3>
                </Card.Header>
                <Card.Content>
                  <div className="space-y-2">
                    {currentIssue.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <Paperclip size={16} className="text-gray-500" />
                        <a
                          href={attachment.secure_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 font-medium"
                        >
                          {attachment.original_filename || `Attachment ${index + 1}`}
                        </a>
                      </div>
                    ))}
                  </div>
                </Card.Content>
              </Card>
            )}

            <Card>
              <Card.Header>
                <h3 className="text-lg font-semibold flex items-center space-x-2">
                  <MessageCircle size={20} />
                  <span>Comments</span>
                </h3>
              </Card.Header>
              <Card.Content>
                <div className="space-y-4">
                  {currentIssue.comments && currentIssue.comments.length > 0 ? (
                    currentIssue.comments.map((comment, index) => (
                      <div key={index} className="border-l-4 border-blue-200 pl-4 py-2">
                        <div className="flex items-center space-x-2 mb-2">
                          <span className="font-medium text-gray-900">{comment.author?.name}</span>
                          <span className="text-sm text-gray-500">
                            {new Date(comment.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700">{comment.content}</p>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-4">No comments yet</p>
                  )}
                  
                  <div className="border-t pt-4">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="mt-2 flex justify-end">
                      <Button
                        size="sm"
                        disabled={!newComment.trim()}
                      >
                        Add Comment
                      </Button>
                    </div>
                  </div>
                </div>
              </Card.Content>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <Card.Header>
                <h3 className="text-lg font-semibold">Details</h3>
              </Card.Header>
              <Card.Content className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">Assignee</label>
                  <div className="mt-1">
                    {currentIssue.assignedTo ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-medium text-blue-600">
                            {currentIssue.assignedTo.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-sm text-gray-900">{currentIssue.assignedTo.name}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Unassigned</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Priority</label>
                  <div className="mt-1">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getPriorityColor(currentIssue.priority)}`}>
                      {currentIssue.priority}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <div className="mt-1">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getStatusColor(currentIssue.status)}`}>
                      {currentIssue.status}
                    </span>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Created</label>
                  <div className="mt-1 text-sm text-gray-900">
                    {new Date(currentIssue.createdAt).toLocaleDateString()}
                  </div>
                </div>
                
                {currentIssue.updatedAt !== currentIssue.createdAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Last Updated</label>
                    <div className="mt-1 text-sm text-gray-900">
                      {new Date(currentIssue.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                )}
              </Card.Content>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default IssueDetail;