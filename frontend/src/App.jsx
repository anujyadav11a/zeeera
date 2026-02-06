import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import { store } from './store/store';
import { getCurrentUser } from './store/slices/authSlice';
import AppRoutes from './routes/AppRoutes';
import './App.css';

function App() {
  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('token');
    if (token) {
      store.dispatch(getCurrentUser());
    }
  }, []);

  return (
    <Provider store={store}>
      <BrowserRouter>
        <div className="App">
          <AppRoutes />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                theme: {
                  primary: 'green',
                  secondary: 'black',
                },
              },
            }}
          />
        </div>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
