# Zeera Frontend

A modern React-based frontend application for the Zeera project management and issue tracking system.

## Tech Stack

- **React 19** - UI library
- **Vite** - Build tool and dev server
- **Redux Toolkit** - State management
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **React Hook Form** - Form handling
- **React Hot Toast** - Notifications
- **Lucide React** - Icons
- **Day.js** - Date manipulation

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── ui/             # Basic UI components (Button, Input, Card, etc.)
│   └── layout/         # Layout components (Header, Layout)
├── pages/              # Page components
│   ├── auth/           # Authentication pages
│   ├── project/        # Project-related pages
│   └── issues/         # Issue-related pages
├── store/              # Redux store and slices
│   └── slices/         # Redux slices for different features
├── services/           # API services and configurations
├── routes/             # Routing configuration
├── hooks/              # Custom React hooks
├── utils/              # Utility functions and constants
└── App.jsx             # Main application component
```

## Features

### Authentication
- User registration and login
- JWT token-based authentication
- Protected routes
- Automatic token refresh handling

### Project Management
- Create and manage projects
- Project overview with statistics
- Team member management
- Project-specific dashboards

### Issue Tracking
- Create, view, and manage issues
- Issue filtering and search
- Status and priority management
- File attachments support
- Comments system

### UI/UX
- Responsive design
- Clean and intuitive interface
- Real-time notifications
- Loading states and error handling

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update the `.env` file with your backend API URL:
```
VITE_API_URL=http://localhost:8000/api/v1
```

5. Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## API Integration

The frontend integrates with the Zeera backend API through:

- **Authentication endpoints**: User login, registration, and profile management
- **Project endpoints**: CRUD operations for projects and team management
- **Issue endpoints**: Issue creation, updates, assignments, and comments
- **File upload**: Multipart form data for attachments

## State Management

Redux Toolkit is used for global state management with the following slices:

- **authSlice**: User authentication and profile data
- **projectSlice**: Project data and current project state
- **issueSlice**: Issue data, filters, and current issue state
- **uiSlice**: UI state like loading, notifications, and modals

## Routing

The application uses React Router DOM with:

- Public routes (landing, login, register)
- Protected routes (dashboard, projects, issues)
- Route guards for authentication
- Dynamic routing for projects and issues

## Styling

Tailwind CSS is used for styling with:

- Utility-first approach
- Responsive design classes
- Custom component styling
- Consistent color scheme and spacing

## Error Handling

Comprehensive error handling includes:

- API error interceptors
- Form validation errors
- Network error handling
- User-friendly error messages
- Automatic token refresh on 401 errors

## Performance Optimizations

- Code splitting with React.lazy (ready for implementation)
- Debounced search inputs
- Optimized re-renders with Redux selectors
- Image optimization for attachments
- Efficient bundle size with Vite

## Contributing

1. Follow the existing code structure and naming conventions
2. Use TypeScript-style JSDoc comments for better documentation
3. Ensure responsive design for all new components
4. Add proper error handling for new features
5. Test thoroughly before submitting changes

## Deployment

For production deployment:

1. Build the application:
```bash
npm run build
```

2. The `dist` folder contains the production-ready files
3. Deploy to your preferred hosting service (Vercel, Netlify, etc.)
4. Ensure the API URL environment variable points to your production backend

## Environment Variables

- `VITE_API_URL`: Backend API base URL
- `VITE_APP_NAME`: Application name
- `VITE_APP_VERSION`: Application version

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)