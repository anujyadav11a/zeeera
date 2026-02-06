import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, Users, FileText } from 'lucide-react';
import Button from '../components/ui/Button';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-6 py-12">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Welcome to <span className="text-blue-600">Zeera</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            A powerful project management and issue tracking tool designed for teams and individuals
          </p>
          <div className="flex justify-center space-x-4">
            <Link to="/login">
              <Button size="lg">Get Started</Button>
            </Link>
            <Link to="/register">
              <Button variant="outline" size="lg">Sign Up</Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="text-center p-6">
            <CheckCircle className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Issue Tracking</h3>
            <p className="text-gray-600">Create, assign, and track issues with ease</p>
          </div>
          <div className="text-center p-6">
            <Users className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Team Collaboration</h3>
            <p className="text-gray-600">Work together seamlessly with your team</p>
          </div>
          <div className="text-center p-6">
            <FileText className="w-12 h-12 text-blue-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">Project Management</h3>
            <p className="text-gray-600">Organize and manage projects efficiently</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;